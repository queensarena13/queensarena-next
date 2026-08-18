import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { createClient } from "@supabase/supabase-js"

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

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

const RAW_BASE =
  "https://raw.githubusercontent.com/statsbomb/open-data/master/data"

const INCLUDED_COMPETITIONS = new Set([
  "FA Women's Super League",
  "NWSL",
  "Liga F",
  "Frauen Bundesliga",
  "Serie A Women",
  "UEFA Women's Euro",
  "Women's World Cup",
])

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "QueensArena data importer",
    },
  })

  if (!response.ok) {
    throw new Error(`${url} HTTP ${response.status}`)
  }

  return response.json()
}

function seasonYear(seasonName) {
  const match = String(seasonName || "").match(/\d{4}/)

  return match ? match[0] : String(seasonName || "")
}

function startsAt(match) {
  const date = match.match_date
  const time = match.kick_off || "00:00:00.000"

  if (!date) return null

  return `${date}T${time.replace(/\.\d+$/, "")}Z`
}

function toRow(match, competition) {
  const home = match.home_team?.home_team_name
  const away = match.away_team?.away_team_name
  const start = startsAt(match)

  if (!match.match_id || !home || !away || !start) {
    return null
  }

  return {
    external_id: `statsbomb-${match.match_id}`,
    sport: "Football",
    home_team: home,
    away_team: away,
    home_score: Number(match.home_score || 0),
    away_score: Number(match.away_score || 0),
    venue:
      match.stadium?.name ||
      match.competition?.competition_name ||
      competition.competition_name,
    status: "FINISHED",
    starts_at: start,
    competition:
      match.competition?.competition_name ||
      competition.competition_name,
    source: "StatsBomb Open Data",
    region:
      match.competition?.country_name ||
      competition.country_name ||
      "Global",
    season: seasonYear(
      match.season?.season_name || competition.season_name
    ),
    data_status: "imported",
    source_url:
      "https://github.com/statsbomb/open-data",
    updated_at: new Date().toISOString(),
  }
}

function teamRowsFromMatches(rows) {
  const teams = new Map()

  for (const row of rows) {
    for (const name of [row.home_team, row.away_team]) {
      teams.set(`Football:${name}`, {
        name,
        sport: "Football",
        country: null,
        region: row.region,
        provider: row.source,
        external_id: null,
        data_status: "imported",
        source_url: row.source_url,
        updated_at: new Date().toISOString(),
      })
    }
  }

  return [...teams.values()]
}

const competitions = await fetchJson(`${RAW_BASE}/competitions.json`)
const targets = competitions.filter(
  (competition) =>
    competition.competition_gender === "female" &&
    INCLUDED_COMPETITIONS.has(competition.competition_name)
)

const rowsById = new Map()
const sources = []

for (const competition of targets) {
  const url = `${RAW_BASE}/matches/${competition.competition_id}/${competition.season_id}.json`

  try {
    const matches = await fetchJson(url)

    for (const match of matches) {
      const row = toRow(match, competition)
      if (row) rowsById.set(row.external_id, row)
    }

    sources.push({
      provider: "StatsBomb Open Data",
      sport: "Football",
      competition: competition.competition_name,
      season: seasonYear(competition.season_name),
      country: competition.country_name || null,
      region: competition.country_name || "Global",
      provider_league_id: String(competition.competition_id),
      provider_season_id: String(competition.season_id),
      source_url:
        "https://github.com/statsbomb/open-data",
      enabled: true,
      coverage_level: "open-data-history",
      reliability: "provider-open-data",
      updated_at: new Date().toISOString(),
    })

    console.log(
      `${competition.competition_name} ${competition.season_name}: ${matches.length}`
    )
  } catch (error) {
    console.warn(
      `${competition.competition_name} ${competition.season_name} unavailable`,
      error
    )
  }

  await sleep(350)
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

const teamRows = teamRowsFromMatches(rows)

if (teamRows.length > 0) {
  const { error } = await supabase
    .from("teams")
    .upsert(teamRows, {
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
  `Synced ${rows.length} StatsBomb matches and ${teamRows.length} teams.`
)
