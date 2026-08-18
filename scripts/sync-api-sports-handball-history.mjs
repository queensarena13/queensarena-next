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

const baseLeagues = [
  {
    id: 85,
    name: "1a Divisao Women",
    region: "Portugal",
    seasons: ["2023", "2022", "2021"],
  },
  {
    id: 146,
    name: "EHF European League Women",
    region: "Europa",
    seasons: ["2023", "2022", "2021"],
  },
  {
    id: 148,
    name: "European Cup Women",
    region: "Europa",
    seasons: ["2023", "2022", "2021"],
  },
  {
    id: 25,
    name: "Bambusa Kvindeligaen Women",
    region: "Dinamarca",
    seasons: ["2023", "2022", "2021"],
  },
  {
    id: 29,
    name: "Division 1 Women",
    region: "Franca",
    seasons: ["2023", "2022", "2021"],
  },
  {
    id: 42,
    name: "1. Bundesliga Women",
    region: "Alemanha",
    seasons: ["2023", "2022", "2021"],
  },
  {
    id: 50,
    name: "NB I Women",
    region: "Hungria",
    seasons: ["2023", "2022", "2021"],
  },
  {
    id: 58,
    name: "Serie A Women",
    region: "Italia",
    seasons: ["2023", "2022", "2021"],
  },
  {
    id: 76,
    name: "REMA 1000-ligaen women",
    region: "Noruega",
    seasons: ["2023", "2022", "2021"],
  },
  {
    id: 88,
    name: "Liga Nationala Women",
    region: "Romenia",
    seasons: ["2023", "2022", "2021"],
  },
  {
    id: 108,
    name: "Division de Honor Women",
    region: "Espanha",
    seasons: ["2023", "2022", "2021"],
  },
  {
    id: 121,
    name: "Superlig Women",
    region: "Turquia",
    seasons: ["2023", "2022", "2021"],
  },
  {
    id: 132,
    name: "Champions League Women",
    region: "Europa",
    seasons: ["2022", "2021", "2018"],
  },
  {
    id: 133,
    name: "European Championship Women",
    region: "Europa",
    seasons: ["2022", "2020", "2018"],
  },
  {
    id: 154,
    name: "World Championship Women",
    region: "Mundo",
    seasons: ["2022", "2019", "2017"],
  },
]

const targets = baseLeagues.flatMap((league) =>
  league.seasons.map((season) => ({
    ...league,
    season,
  }))
)

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

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

async function apiSportsJson(url, attempts = 2) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30000)

  try {
    const response = await fetch(url, {
      headers: {
        "x-apisports-key": apiKey,
      },
      signal: controller.signal,
    })
    const data = await response.json()

    if (response.status === 429 || data.errors?.rateLimit) {
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

function toRow(item, target) {
  const id = item.id
  const home = item.teams?.home?.name
  const away = item.teams?.away?.name
  const startsAt = item.date

  if (!id || !home || !away || !startsAt) return null

  return {
    external_id: `api-sports-handball-${id}`,
    sport: "Handball",
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

const rowsById = new Map()
const sources = []

for (const target of targets) {
  const url = new URL("https://v1.handball.api-sports.io/games")
  url.searchParams.set("league", String(target.id))
  url.searchParams.set("season", target.season)

  const data = await apiSportsJson(url)

  if (data.errors && Object.keys(data.errors).length > 0) {
    console.warn(
      `${target.name} ${target.season} unavailable`,
      data.errors
    )
    await sleep(7000)
    continue
  }

  for (const item of data.response || []) {
    const row = toRow(item, target)
    if (row) rowsById.set(row.external_id, row)
  }

  sources.push({
    provider: "API-SPORTS",
    sport: "Handball",
    competition: target.name,
    season: target.season,
    region: target.region,
    provider_league_id: String(target.id),
    enabled: true,
    coverage_level: "api-history",
    reliability: "provider",
    updated_at: new Date().toISOString(),
  })

  console.log(
    `${target.name} ${target.season}: ${data.response?.length || 0}`
  )
  await sleep(7000)
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
  `Synced ${rows.length} historical handball matches and ${teamRowsByName.size} teams.`
)
