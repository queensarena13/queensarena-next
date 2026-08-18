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

const apiKey = process.env.API_SPORTS_KEY
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!apiKey || !supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "Missing API_SPORTS_KEY, NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
  )
}

const targets = [
  {
    id: 948,
    name: "1a Divisão - Women",
    sport: "Football",
    region: "Portugal",
    season: "2024",
    baseUrl: "https://v3.football.api-sports.io/fixtures",
    kind: "football",
  },
  {
    id: 525,
    name: "UEFA Champions League Women",
    sport: "Football",
    region: "Europa",
    season: "2024",
    baseUrl: "https://v3.football.api-sports.io/fixtures",
    kind: "football",
  },
  {
    id: 64,
    name: "Feminine Division 1",
    sport: "Football",
    region: "Franca",
    season: "2024",
    baseUrl: "https://v3.football.api-sports.io/fixtures",
    kind: "football",
  },
  {
    id: 139,
    name: "Serie A Women",
    sport: "Football",
    region: "Italia",
    season: "2024",
    baseUrl: "https://v3.football.api-sports.io/fixtures",
    kind: "football",
  },
  {
    id: 91,
    name: "Eredivisie Women",
    sport: "Football",
    region: "Paises Baixos",
    season: "2024",
    baseUrl: "https://v3.football.api-sports.io/fixtures",
    kind: "football",
  },
  {
    id: 74,
    name: "Brasileiro Women",
    sport: "Football",
    region: "Brasil",
    season: "2024",
    baseUrl: "https://v3.football.api-sports.io/fixtures",
    kind: "football",
  },
  {
    id: 190,
    name: "A-League Women",
    sport: "Football",
    region: "Australia",
    season: "2024",
    baseUrl: "https://v3.football.api-sports.io/fixtures",
    kind: "football",
  },
  {
    id: 254,
    name: "NWSL",
    sport: "Football",
    region: "EUA",
    season: "2024",
    baseUrl: "https://v3.football.api-sports.io/fixtures",
    kind: "football",
  },
  {
    id: 641,
    name: "NWSL Women - Challenge Cup",
    sport: "Football",
    region: "EUA",
    season: "2024",
    baseUrl: "https://v3.football.api-sports.io/fixtures",
    kind: "football",
  },
  {
    id: 1119,
    name: "NWSL - Liga MXF Summer Cup",
    sport: "Football",
    region: "EUA",
    season: "2024",
    baseUrl: "https://v3.football.api-sports.io/fixtures",
    kind: "football",
  },
  {
    id: 85,
    name: "1a Divisao Women",
    sport: "Handball",
    region: "Portugal",
    season: "2024",
    baseUrl: "https://v1.handball.api-sports.io/games",
    kind: "handball",
  },
  {
    id: 146,
    name: "EHF European League Women",
    sport: "Handball",
    region: "Europa",
    season: "2024",
    baseUrl: "https://v1.handball.api-sports.io/games",
    kind: "handball",
  },
  {
    id: 148,
    name: "European Cup Women",
    sport: "Handball",
    region: "Europa",
    season: "2024",
    baseUrl: "https://v1.handball.api-sports.io/games",
    kind: "handball",
  },
  {
    id: 25,
    name: "Bambusa Kvindeligaen Women",
    sport: "Handball",
    region: "Dinamarca",
    season: "2024",
    baseUrl: "https://v1.handball.api-sports.io/games",
    kind: "handball",
  },
  {
    id: 29,
    name: "Division 1 Women",
    sport: "Handball",
    region: "Franca",
    season: "2024",
    baseUrl: "https://v1.handball.api-sports.io/games",
    kind: "handball",
  },
  {
    id: 42,
    name: "1. Bundesliga Women",
    sport: "Handball",
    region: "Alemanha",
    season: "2024",
    baseUrl: "https://v1.handball.api-sports.io/games",
    kind: "handball",
  },
  {
    id: 50,
    name: "NB I Women",
    sport: "Handball",
    region: "Hungria",
    season: "2024",
    baseUrl: "https://v1.handball.api-sports.io/games",
    kind: "handball",
  },
  {
    id: 58,
    name: "Serie A Women Handball",
    sport: "Handball",
    region: "Italia",
    season: "2024",
    baseUrl: "https://v1.handball.api-sports.io/games",
    kind: "handball",
  },
  {
    id: 76,
    name: "REMA 1000-ligaen women",
    sport: "Handball",
    region: "Noruega",
    season: "2024",
    baseUrl: "https://v1.handball.api-sports.io/games",
    kind: "handball",
  },
  {
    id: 88,
    name: "Liga Nationala Women",
    sport: "Handball",
    region: "Romenia",
    season: "2024",
    baseUrl: "https://v1.handball.api-sports.io/games",
    kind: "handball",
  },
  {
    id: 108,
    name: "Division de Honor Women",
    sport: "Handball",
    region: "Espanha",
    season: "2024",
    baseUrl: "https://v1.handball.api-sports.io/games",
    kind: "handball",
  },
  {
    id: 121,
    name: "Superlig Women",
    sport: "Handball",
    region: "Turquia",
    season: "2024",
    baseUrl: "https://v1.handball.api-sports.io/games",
    kind: "handball",
  },
  {
    id: 132,
    name: "EHF Champions League Women",
    sport: "Handball",
    region: "Europa",
    season: "2024",
    baseUrl: "https://v1.handball.api-sports.io/games",
    kind: "handball",
  },
  {
    id: 132,
    name: "EHF Champions League Women",
    sport: "Handball",
    region: "Europa",
    season: "2023",
    baseUrl: "https://v1.handball.api-sports.io/games",
    kind: "handball",
  },
]

const historicTargets = targets
  .filter((target) => target.season === "2024")
  .map((target) => ({
    ...target,
    season: "2023",
  }))

const syncTargets = [
  ...new Map(
    [...targets, ...historicTargets].map((target) => [
      `${target.kind}:${target.id}:${target.season}`,
      target,
    ])
  ).values(),
]

function normalizeStatus(short, long) {
  const value = `${short || ""} ${long || ""}`.toLowerCase()

  if (["1h", "2h", "live"].some((status) => value.includes(status))) {
    return "LIVE"
  }

  if (value.includes("ht")) return "HALFTIME"
  if (value.includes("ft") || value.includes("finish")) return "FINISHED"
  if (value.includes("postpon")) return "POSTPONED"
  if (value.includes("cancel")) return "CANCELLED"

  return "SCHEDULED"
}

async function fetchTarget(target) {
  const url = new URL(target.baseUrl)
  url.searchParams.set("league", String(target.id))
  url.searchParams.set("season", target.season)

  const data = await apiSportsJson(url, 2)

  if (data.errors && Object.keys(data.errors).length > 0) {
    console.warn(
      `${target.name} ${target.season} unavailable`,
      data.errors
    )
    return []
  }

  return (data.response || []).map((item) =>
    target.kind === "football"
      ? footballToRow(item, target)
      : handballToRow(item, target)
  ).filter(Boolean)
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function apiSportsJson(url, attempts) {
  const controller = new AbortController()
  const timeout = setTimeout(
    () => controller.abort(),
    30000
  )

  try {
    const response = await fetch(url, {
      headers: {
        "x-apisports-key": apiKey,
      },
      signal: controller.signal,
    })
    const data = await response.json()

    if (
      response.status === 429 ||
      data.errors?.rateLimit
    ) {
      if (attempts > 1) {
        await sleep(65000)
        return apiSportsJson(url, attempts - 1)
      }
    }

    if (!response.ok) {
      throw new Error(`${url} HTTP ${response.status}`)
    }

    return data
  } finally {
    clearTimeout(timeout)
  }
}

function footballToRow(item, target) {
  const id = item.fixture?.id
  const home = item.teams?.home?.name
  const away = item.teams?.away?.name
  const startsAt = item.fixture?.date

  if (!id || !home || !away || !startsAt) return null

  return {
    external_id: `api-sports-football-${id}`,
    sport: target.sport,
    home_team: home,
    away_team: away,
    home_score: item.goals?.home ?? 0,
    away_score: item.goals?.away ?? 0,
    venue:
      [item.fixture?.venue?.name, item.fixture?.venue?.city]
        .filter(Boolean)
        .join(", ") ||
      item.league?.name ||
      target.name,
    status: normalizeStatus(
      item.fixture?.status?.short,
      item.fixture?.status?.long
    ),
    starts_at: startsAt,
    competition: item.league?.name || target.name,
    source: "API-SPORTS",
    region: item.league?.country || target.region,
    season: String(item.league?.season || target.season),
    data_status: "imported",
  }
}

function handballToRow(item, target) {
  const id = item.id
  const home = item.teams?.home?.name
  const away = item.teams?.away?.name
  const startsAt = item.date

  if (!id || !home || !away || !startsAt) return null

  return {
    external_id: `api-sports-handball-${id}`,
    sport: target.sport,
    home_team: home,
    away_team: away,
    home_score: item.scores?.home ?? 0,
    away_score: item.scores?.away ?? 0,
    venue: item.league?.name || target.name,
    status: normalizeStatus(item.status?.short, item.status?.long),
    starts_at: startsAt,
    competition: item.league?.name || target.name,
    source: "API-SPORTS",
    region: item.country?.name || target.region,
    season: String(item.league?.season || target.season),
    data_status: "imported",
  }
}

const groups = []

for (const target of syncTargets) {
  groups.push(await fetchTarget(target))
  await sleep(7000)
}
const byId = new Map()

for (const row of groups.flat()) {
  byId.set(row.external_id, row)
}

const rows = [...byId.values()]
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

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
    if (!name || name === "Unknown") continue

    teamRowsByName.set(name, {
      name,
      sport: row.sport,
      country: row.region === "USA" ? "United States" : null,
      region: row.region,
      provider: row.source,
      external_id: null,
      data_status: "imported",
      updated_at: new Date().toISOString(),
    })
  }
}

if (teamRowsByName.size > 0) {
  const { error: teamsError } = await supabase
    .from("teams")
    .upsert([...teamRowsByName.values()], {
      onConflict: "name",
    })

  if (teamsError) throw teamsError
}

const dataSources = syncTargets.map((target) => ({
  provider: "API-SPORTS",
  sport: target.sport,
  competition: target.name,
  season: target.season,
  region: target.region,
  provider_league_id: String(target.id),
  enabled: true,
  coverage_level: "api",
  reliability: "provider",
  updated_at: new Date().toISOString(),
}))

const { error: sourceError } = await supabase
  .from("data_sources")
  .upsert(dataSources, {
    onConflict: "provider,competition,season",
  })

if (sourceError) throw sourceError

console.log(
  `Synced ${rows.length} API-SPORTS matches and ${teamRowsByName.size} teams.`
)
