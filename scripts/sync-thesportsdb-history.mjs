import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { createClient } from "@supabase/supabase-js"
import { getTheSportsDbLeagues } from "../lib/sports-config.ts"

function loadEnvFile(fileName) {
  const envPath = join(process.cwd(), fileName)

  if (!existsSync(envPath)) return

  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim()

    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
      continue
    }

    const [name, ...parts] = trimmed.split("=")
    const value = parts.join("=").trim().replace(/^["']|["']$/g, "")

    if (!process.env[name]) {
      process.env[name] = value
    }
  }
}

loadEnvFile(".env.local")
loadEnvFile(".env.vercel.local")

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
  )
}

const yearSeasons = [
  "2026",
  "2025",
  "2024",
  "2023",
  "2022",
  "2021",
  "2020",
]

const splitSeasons = [
  "2025-2026",
  "2024-2025",
  "2023-2024",
  "2022-2023",
  "2021-2022",
  "2020-2021",
]

const requestedLeagueIds = new Set(
  String(process.env.THESPORTSDB_TARGET_LEAGUE_IDS || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
)

const requestedSeasons = String(process.env.THESPORTSDB_TARGET_SEASONS || "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean)

const seasons =
  requestedSeasons.length > 0
    ? requestedSeasons
    : [...new Set([...yearSeasons, ...splitSeasons])]

const targets = getTheSportsDbLeagues()
  .filter(
    (league) =>
      requestedLeagueIds.size === 0 || requestedLeagueIds.has(String(league.id))
  )
  .map((league) => ({
    ...league,
    seasons,
  }))

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

function normalizeStatus(status) {
  const normalized = status?.toLowerCase() || ""

  if (normalized.includes("live") || normalized.includes("in play")) {
    return "LIVE"
  }

  if (normalized.includes("half")) {
    return "HALFTIME"
  }

  if (
    normalized.includes("finish") ||
    normalized.includes("ended") ||
    normalized === "ft"
  ) {
    return "FINISHED"
  }

  if (normalized.includes("cancel")) return "CANCELLED"
  if (normalized.includes("postpon")) return "POSTPONED"

  return "SCHEDULED"
}

function startsAt(event) {
  if (event.strTimestamp) {
    return event.strTimestamp
  }

  return `${event.dateEvent || ""}T${event.strTime || "00:00:00"}`
}

function toRow(event, target, season) {
  if (!event.idEvent || !event.strHomeTeam || !event.strAwayTeam) {
    return null
  }

  return {
    external_id: `thesportsdb-${event.idEvent}`,
    sport: target.sport,
    home_team: event.strHomeTeam,
    away_team: event.strAwayTeam,
    home_score: Number(event.intHomeScore || 0),
    away_score: Number(event.intAwayScore || 0),
    venue: event.strVenue || event.strLeague || target.name,
    status: normalizeStatus(event.strStatus),
    starts_at: startsAt(event),
    competition: event.strLeague || target.name,
    source: "TheSportsDB",
    region: target.region,
    season,
    data_status: "imported",
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function fetchSeasonEvents(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "QueensArena data importer",
      Accept: "application/json",
    },
  })

  const text = await response.text()

  if (response.status === 429) {
    console.warn(
      `Skipping TheSportsDB response ${response.status} for ${url.toString()}`
    )
    return []
  }

  if (!response.ok || text.trim().startsWith("<")) {
    console.warn(
      `Skipping TheSportsDB response ${response.status} for ${url.toString()}`
    )
    return []
  }

  try {
    const data = JSON.parse(text)
    return data.events || []
  } catch {
    console.warn(
      `Skipping invalid TheSportsDB JSON for ${url.toString()}`
    )
    return []
  }
}

const rowsById = new Map()
const sources = []

for (const target of targets) {
  for (const season of target.seasons) {
    const url = new URL(
      "https://www.thesportsdb.com/api/v1/json/3/eventsseason.php"
    )
    url.searchParams.set("id", target.id)
    url.searchParams.set("s", season)

    const events = await fetchSeasonEvents(url)

    for (const event of events) {
      const row = toRow(event, target, season)
      if (row) rowsById.set(row.external_id, row)
    }

    sources.push({
      provider: "TheSportsDB",
      sport: target.sport,
      competition: target.name,
      season,
      region: target.region,
      provider_league_id: target.id,
      enabled: true,
      coverage_level: "api-history",
      reliability: "provider",
      updated_at: new Date().toISOString(),
    })

    console.log(`${target.name} ${season}: ${events.length}`)
    await sleep(Number(process.env.THESPORTSDB_DELAY_MS || 3500))
  }
}

const rows = [...rowsById.values()]

if (rows.length > 0) {
  const { error } = await supabase
    .from("matches")
    .upsert(rows, {
      onConflict: "external_id",
    })

  if (error) throw error
}

const teamRowsByName = new Map()

for (const row of rows) {
  for (const name of [row.home_team, row.away_team]) {
    teamRowsByName.set(name, {
      name,
      sport: row.sport,
      country: null,
      region: row.region,
      provider: row.source,
      external_id: null,
      data_status: "imported",
      updated_at: new Date().toISOString(),
    })
  }
}

if (teamRowsByName.size > 0) {
  const { error } = await supabase
    .from("teams")
    .upsert([...teamRowsByName.values()], {
      onConflict: "name",
    })

  if (error) throw error
}

if (sources.length > 0) {
  const { error } = await supabase
    .from("data_sources")
    .upsert(sources, {
      onConflict: "provider,competition,season",
    })

  if (error) throw error
}

console.log(
  `Synced ${rows.length} TheSportsDB historical matches and ${teamRowsByName.size} teams.`
)
