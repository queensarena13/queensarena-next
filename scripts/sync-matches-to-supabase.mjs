import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { createClient } from "@supabase/supabase-js"

const root = process.cwd()
const env = await readFile(
  join(root, ".env.local"),
  "utf8"
)

function readEnv(key) {
  return env
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) =>
      line.startsWith(`${key}=`)
    )
    ?.slice(key.length + 1)
    .replace(/^["']|["']$/g, "")
}

const supabaseUrl = readEnv(
  "NEXT_PUBLIC_SUPABASE_URL"
)
const serviceRoleKey = readEnv(
  "SUPABASE_SERVICE_ROLE_KEY"
)

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local"
  )
}

const leagues = [
  {
    id: "4889",
    name: "UEFA Women's Champions League",
    sport: "Football",
    region: "Europa",
  },
  {
    id: "4521",
    name: "NWSL",
    sport: "Football",
    region: "EUA",
  },
  {
    id: "5274",
    name: "EHF Champions League Women",
    sport: "Handball",
    region: "Europa",
  },
  {
    id: "4896",
    name: "World Women's Handball Championship",
    sport: "Handball",
    region: "Mundo",
  },
  {
    id: "4893",
    name: "European Women's Handball Championship",
    sport: "Handball",
    region: "Europa",
  },
]

function normalizeStatus(status) {
  const normalized =
    status?.toLowerCase() || ""

  if (
    normalized.includes("live") ||
    normalized.includes("in play")
  ) {
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

  if (normalized.includes("cancel")) {
    return "CANCELLED"
  }

  if (normalized.includes("postpon")) {
    return "POSTPONED"
  }

  return "SCHEDULED"
}

function startsAt(event) {
  if (event.strTimestamp) {
    return event.strTimestamp
  }

  return `${event.dateEvent || ""}T${
    event.strTime || "00:00:00"
  }`
}

function toRow(event, league) {
  return {
    external_id: event.idEvent,
    sport: league.sport,
    home_team:
      event.strHomeTeam || "Unknown",
    away_team:
      event.strAwayTeam || "Unknown",
    home_score: Number(
      event.intHomeScore || 0
    ),
    away_score: Number(
      event.intAwayScore || 0
    ),
    venue:
      event.strVenue ||
      event.strLeague ||
      league.name,
    status: normalizeStatus(
      event.strStatus
    ),
    starts_at: startsAt(event),
    competition:
      event.strLeague || league.name,
    source: "TheSportsDB",
    region: league.region,
  }
}

async function fetchLeagueEvents(
  league,
  endpoint
) {
  const url =
    `https://www.thesportsdb.com/api/v1/json/3/${endpoint}?id=${league.id}`
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(
      `${endpoint} failed for ${league.name}: ${response.status}`
    )
  }

  const data = await response.json()

  return (data.events || []).map((event) =>
    toRow(event, league)
  )
}

const groups = await Promise.all(
  leagues.flatMap((league) => [
    fetchLeagueEvents(
      league,
      "eventsnextleague.php"
    ),
    fetchLeagueEvents(
      league,
      "eventspastleague.php"
    ),
  ])
)

const byId = new Map()

for (const row of groups.flat()) {
  byId.set(row.external_id, row)
}

const rows = [...byId.values()]

const supabase = createClient(
  supabaseUrl,
  serviceRoleKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
)

const dataSources = leagues.map((league) => ({
  provider: "TheSportsDB",
  sport: league.sport,
  competition: league.name,
  season: "2026",
  provider_league_id: league.id,
  enabled: true,
}))

const { error: sourcesError } =
  await supabase
    .from("data_sources")
    .upsert(dataSources, {
      onConflict:
        "provider,competition,season",
    })

if (sourcesError) {
  throw sourcesError
}

await supabase
  .from("matches")
  .delete()
  .eq("source", "QueensArena")

const { error } = await supabase
  .from("matches")
  .upsert(rows, {
    onConflict: "external_id",
  })

if (error) {
  throw error
}

console.log(
  `Synced ${rows.length} real matches from TheSportsDB.`
)
