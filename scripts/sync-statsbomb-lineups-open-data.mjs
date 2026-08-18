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

function playerPosition(player) {
  const positions = player.positions || []
  const named = positions.find((item) => item.position)

  return named?.position || null
}

function playerCountry(player) {
  return player.country?.name || null
}

const competitions = await fetchJson(`${RAW_BASE}/competitions.json`)
const targets = competitions.filter(
  (competition) =>
    competition.competition_gender === "female" &&
    INCLUDED_COMPETITIONS.has(competition.competition_name)
)

const teamRowsByName = new Map()
const playerRowsByExternalId = new Map()
const rosterByKey = new Map()
let lineupsLoaded = 0

for (const competition of targets) {
  const season = seasonYear(competition.season_name)
  const matchesUrl = `${RAW_BASE}/matches/${competition.competition_id}/${competition.season_id}.json`
  const matches = await fetchJson(matchesUrl)

  for (const match of matches) {
    const lineupsUrl = `${RAW_BASE}/lineups/${match.match_id}.json`

    try {
      const lineups = await fetchJson(lineupsUrl)
      lineupsLoaded += 1

      for (const team of lineups || []) {
        const teamName = team.team_name

        if (!teamName) continue

        teamRowsByName.set(teamName, {
          name: teamName,
          sport: "Football",
          country: null,
          region: competition.country_name || "Global",
          provider: null,
          external_id: null,
          data_status: "imported",
          source_url: "https://github.com/statsbomb/open-data",
          updated_at: new Date().toISOString(),
        })

        for (const player of team.lineup || []) {
          if (!player.player_id || !player.player_name) continue

          const externalId = `statsbomb-player-${player.player_id}`
          const position = playerPosition(player)

          playerRowsByExternalId.set(externalId, {
            name: player.player_name,
            sport: "Football",
            position,
            nationality: playerCountry(player),
            goals: 0,
            assists: 0,
            appearances: 0,
            provider: "StatsBomb Open Data",
            external_id: externalId,
            image_url: null,
            season,
            gender: "women",
            data_status: "imported",
            source_url: "https://github.com/statsbomb/open-data",
            updated_at: new Date().toISOString(),
          })

          rosterByKey.set(
            `${externalId}:${teamName}:${season}:${competition.competition_name}`,
            {
              player_external_id: externalId,
              team_name: teamName,
              season,
              competition: competition.competition_name,
              shirt_number: player.jersey_number || null,
              role: position,
              provider: "StatsBomb Open Data",
              external_id: `${externalId}:${teamName}:${season}:${competition.competition_name}`,
            }
          )
        }
      }
    } catch (error) {
      console.warn(`Lineup unavailable for match ${match.match_id}`, error)
    }

    await sleep(75)
  }

  console.log(
    `${competition.competition_name} ${competition.season_name}: ${matches.length} matches checked`
  )
}

const teamRows = [...teamRowsByName.values()]
const playerRows = [...playerRowsByExternalId.values()]

async function fetchAll(table, select, queryBuilder) {
  const rows = []
  let from = 0
  const pageSize = 1000

  while (true) {
    let query = supabase
      .from(table)
      .select(select)
      .range(from, from + pageSize - 1)

    if (queryBuilder) {
      query = queryBuilder(query)
    }

    const { data, error } = await query

    if (error) throw error
    if (!data || data.length === 0) break

    rows.push(...data)

    if (data.length < pageSize) break
    from += pageSize
  }

  return rows
}

if (teamRows.length > 0) {
  const { error } = await supabase
    .from("teams")
    .upsert(teamRows, {
      onConflict: "name",
    })

  if (error) throw error
}

const existingStatsBombPlayers = await fetchAll(
  "players",
  "external_id",
  (query) => query.eq("provider", "StatsBomb Open Data")
)

const existingPlayerExternalIds = new Set(
  existingStatsBombPlayers
    .map((player) => player.external_id)
    .filter(Boolean)
)

const newPlayerRows = playerRows.filter(
  (player) =>
    !existingPlayerExternalIds.has(player.external_id)
)

if (newPlayerRows.length > 0) {
  const { error } = await supabase
    .from("players")
    .insert(newPlayerRows)

  if (error) throw error
}

const { data: teams, error: teamsError } = await supabase
  .from("teams")
  .select("id,name")
  .in("name", teamRows.map((team) => team.name))

if (teamsError) throw teamsError

const { data: players, error: playersError } = await supabase
  .from("players")
  .select("id,external_id")
  .eq("provider", "StatsBomb Open Data")

if (playersError) throw playersError

const teamIdByName = new Map((teams || []).map((team) => [team.name, team.id]))
const playerIdByExternalId = new Map(
  (players || []).map((player) => [player.external_id, player.id])
)

const rosterRows = [...rosterByKey.values()]
  .map((row) => ({
    player_id: playerIdByExternalId.get(row.player_external_id),
    team_id: teamIdByName.get(row.team_name),
    season: row.season,
    competition: row.competition,
    shirt_number: row.shirt_number,
    role: row.role,
    active: true,
    provider: row.provider,
    external_id: row.external_id,
  }))
  .filter((row) => row.player_id && row.team_id)

if (rosterRows.length > 0) {
  const { error } = await supabase
    .from("roster_memberships")
    .upsert(rosterRows, {
      onConflict: "player_id,team_id,season,competition",
    })

  if (error) throw error
}

console.log(
  `Synced ${newPlayerRows.length} new StatsBomb players (${playerRows.length} discovered), ${teamRows.length} teams and ${rosterRows.length} roster memberships from ${lineupsLoaded} lineups.`
)
