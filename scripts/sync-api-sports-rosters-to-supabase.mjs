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

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

const footballTargets = [
  {
    league: "948",
    season: "2024",
    region: "Portugal",
    country: "Portugal",
  },
  {
    league: "525",
    season: "2024",
    region: "Europa",
    country: null,
  },
  {
    league: "64",
    season: "2024",
    region: "Franca",
    country: "France",
  },
  {
    league: "139",
    season: "2024",
    region: "Italia",
    country: "Italy",
  },
  {
    league: "91",
    season: "2024",
    region: "Paises Baixos",
    country: "Netherlands",
  },
  {
    league: "74",
    season: "2024",
    region: "Brasil",
    country: "Brazil",
  },
  {
    league: "190",
    season: "2024",
    region: "Australia",
    country: "Australia",
  },
  {
    league: "254",
    season: "2024",
    region: "EUA",
    country: "United States",
  },
  {
    league: "1119",
    season: "2024",
    region: "EUA",
    country: "United States",
  },
]

const handballTeamTargets = [
  {
    league: "132",
    season: "2024",
    region: "Europa",
  },
]

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function apiSports(url) {
  const controller = new AbortController()
  const timeout = setTimeout(
    () => controller.abort(),
    30000
  )

  let response
  let data

  try {
    response = await fetch(url, {
      headers: {
        "x-apisports-key": apiKey,
      },
      signal: controller.signal,
    })
    data = await response.json()
  } finally {
    clearTimeout(timeout)
  }

  if (!response.ok) {
    throw new Error(`${url} HTTP ${response.status}`)
  }

  if (data.errors && Object.keys(data.errors).length > 0) {
    throw new Error(`${url} ${JSON.stringify(data.errors)}`)
  }

  return data
}

async function syncFootballTeams(target) {
  const url = new URL(
    "https://v3.football.api-sports.io/teams"
  )
  url.searchParams.set("league", target.league)
  url.searchParams.set("season", target.season)

  const data = await apiSports(url)
  const rows = (data.response || []).map((entry) => ({
    external_id: String(entry.team.id),
    provider: "API-SPORTS",
    name: entry.team.name,
    sport: "Football",
    country: entry.team.country || target.country,
    region: target.region,
    data_status: "imported",
    updated_at: new Date().toISOString(),
  }))

  if (rows.length > 0) {
    const { error } = await supabase
      .from("teams")
      .upsert(rows, {
        onConflict: "name",
      })

    if (error) throw error
  }

  return rows.length
}

async function syncHandballTeams(target) {
  const url = new URL(
    "https://v1.handball.api-sports.io/teams"
  )
  url.searchParams.set("league", target.league)
  url.searchParams.set("season", target.season)

  const data = await apiSports(url)
  const rows = (data.response || []).map((team) => ({
    external_id: String(team.id),
    provider: "API-SPORTS",
    name: team.name,
    sport: "Handball",
    country: team.country?.name || null,
    region: target.region,
    data_status: "imported",
    updated_at: new Date().toISOString(),
  }))

  if (rows.length > 0) {
    const { error } = await supabase
      .from("teams")
      .upsert(rows, {
        onConflict: "name",
      })

    if (error) throw error
  }

  return rows.length
}

async function fetchFootballPlayers(target) {
  const players = []
  let page = 1
  let total = 1

  do {
    const url = new URL(
      "https://v3.football.api-sports.io/players"
    )
    url.searchParams.set("league", target.league)
    url.searchParams.set("season", target.season)
    url.searchParams.set("page", String(page))

    const data = await apiSports(url)
    players.push(...(data.response || []))
    total = Math.min(data.paging?.total || page, 3)
    page += 1

    if (page <= total) {
      await sleep(7000)
    }
  } while (page <= total)

  return players
}

async function getTeamIds() {
  const { data, error } = await supabase
    .from("teams")
    .select("id,name,external_id,provider")
    .eq("provider", "API-SPORTS")

  if (error) throw error

  const byExternalId = new Map()
  const byName = new Map()

  for (const team of data || []) {
    if (team.external_id) {
      byExternalId.set(String(team.external_id), team.id)
    }
    byName.set(team.name, team.id)
  }

  return { byExternalId, byName }
}

async function syncFootballPlayers(target) {
  const entries = await fetchFootballPlayers(target)
  const teamIds = await getTeamIds()
  const now = new Date().toISOString()

  const rows = entries.map((entry) => {
    const player = entry.player
    const stats = entry.statistics?.[0] || {}
    const team = stats.team || {}
    const games = stats.games || {}
    const goals = stats.goals || {}

    return {
      external_id: String(player.id),
      provider: "API-SPORTS",
      team_id:
        teamIds.byExternalId.get(String(team.id)) ||
        teamIds.byName.get(team.name) ||
        null,
      name: player.name,
      sport: "Football",
      position: games.position || null,
      nationality: player.nationality || null,
      age: player.age || null,
      goals: goals.total || 0,
      assists: goals.assists || 0,
      appearances: games.appearences || 0,
      image_url: player.photo || null,
      season: target.season,
      data_status: "imported",
      updated_at: now,
    }
  })

  if (rows.length > 0) {
    const { data: existing, error: existingError } =
      await supabase
        .from("players")
        .select("external_id")
        .eq("provider", "API-SPORTS")

    if (existingError) throw existingError

    const existingIds = new Set(
      (existing || []).map((item) => item.external_id)
    )
    const newRows = rows.filter(
      (row) => !existingIds.has(row.external_id)
    )

    if (newRows.length === 0) {
      return 0
    }

    const { error } = await supabase
      .from("players")
      .insert(newRows)

    if (error) throw error

    return newRows.length
  }

  return 0
}

let footballTeams = 0
let handballTeams = 0
let players = 0

for (const target of footballTargets) {
  try {
    footballTeams += await syncFootballTeams(target)
    await sleep(7000)
    players += await syncFootballPlayers(target)
  } catch (error) {
    console.warn(
      `Football roster ${target.league}/${target.season} unavailable`,
      error.message
    )
  }
  await sleep(7000)
}

for (const target of handballTeamTargets) {
  try {
    handballTeams += await syncHandballTeams(target)
  } catch (error) {
    console.warn(
      `Handball teams ${target.league}/${target.season} unavailable`,
      error.message
    )
  }
  await sleep(7000)
}

console.log(
  `Synced ${footballTeams + handballTeams} teams and ${players} players.`
)
