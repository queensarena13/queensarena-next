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

function createLimiter(limit) {
  let active = 0
  const queue = []

  function next() {
    if (active >= limit || queue.length === 0) return

    active += 1
    const { run, resolve, reject } = queue.shift()

    run()
      .then(resolve)
      .catch(reject)
      .finally(() => {
        active -= 1
        next()
      })
  }

  return function limitRun(run) {
    return new Promise((resolve, reject) => {
      queue.push({ run, resolve, reject })
      next()
    })
  }
}

async function withRetry(label, run, attempts = 4) {
  let lastError

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await run()
    } catch (error) {
      lastError = error
      const waitMs = attempt * 1500
      console.warn(`${label} failed, retry ${attempt}/${attempts}`)
      await sleep(waitMs)
    }
  }

  throw lastError
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

function seasonYear(seasonName) {
  const match = String(seasonName || "").match(/\d{4}/)

  return match ? match[0] : String(seasonName || "")
}

function statsKey(playerExternalId, teamName, season, competition) {
  return `${playerExternalId}:${teamName}:${season}:${competition}`
}

function getOrCreateStat(statsByKey, playerExternalId, teamName, season, competition) {
  const key = statsKey(playerExternalId, teamName, season, competition)
  const existing = statsByKey.get(key)

  if (existing) return existing

  const row = {
    player_external_id: playerExternalId,
    team_name: teamName,
    season,
    competition,
    sport: "Football",
    appearances: 0,
    starts: 0,
    minutes: 0,
    goals: 0,
    assists: 0,
    yellow_cards: 0,
    red_cards: 0,
    source: "StatsBomb Open Data",
    updated_at: new Date().toISOString(),
  }

  statsByKey.set(key, row)
  return row
}

function playerExternalId(playerId) {
  return `statsbomb-player-${playerId}`
}

function teamNameFromEvent(event) {
  return event.team?.name || null
}

function addAppearance(appearanceSets, stat) {
  const key = statsKey(
    stat.player_external_id,
    stat.team_name,
    stat.season,
    stat.competition
  )

  if (appearanceSets.has(key)) return

  stat.appearances += 1
  appearanceSets.add(key)
}

function applyStartingXi(event, statsByKey, appearanceSets, startSets, season, competition) {
  const teamName = teamNameFromEvent(event)
  const lineup = event.tactics?.lineup || []

  if (!teamName || !Array.isArray(lineup)) return

  for (const item of lineup) {
    const playerId = item.player?.id
    if (!playerId) continue

    const stat = getOrCreateStat(
      statsByKey,
      playerExternalId(playerId),
      teamName,
      season,
      competition
    )
    const key = statsKey(
      stat.player_external_id,
      stat.team_name,
      stat.season,
      stat.competition
    )

    if (!startSets.has(key)) {
      stat.starts += 1
      startSets.add(key)
    }

    addAppearance(appearanceSets, stat)
  }
}

function applySubstitution(event, statsByKey, appearanceSets, season, competition) {
  const teamName = teamNameFromEvent(event)
  const playerId = event.substitution?.replacement?.id

  if (!teamName || !playerId) return

  const stat = getOrCreateStat(
    statsByKey,
    playerExternalId(playerId),
    teamName,
    season,
    competition
  )

  addAppearance(appearanceSets, stat)
}

function applyShot(event, statsByKey, season, competition) {
  if (event.shot?.outcome?.name !== "Goal") return

  const playerId = event.player?.id
  const teamName = teamNameFromEvent(event)

  if (!playerId || !teamName) return

  const stat = getOrCreateStat(
    statsByKey,
    playerExternalId(playerId),
    teamName,
    season,
    competition
  )

  stat.goals += 1
}

function applyAssist(event, statsByKey, season, competition) {
  if (!event.pass?.goal_assist) return

  const playerId = event.player?.id
  const teamName = teamNameFromEvent(event)

  if (!playerId || !teamName) return

  const stat = getOrCreateStat(
    statsByKey,
    playerExternalId(playerId),
    teamName,
    season,
    competition
  )

  stat.assists += 1
}

function applyCard(event, statsByKey, season, competition) {
  const cardName =
    event.bad_behaviour?.card?.name ||
    event.foul_committed?.card?.name
  const playerId = event.player?.id
  const teamName = teamNameFromEvent(event)

  if (!cardName || !playerId || !teamName) return

  const stat = getOrCreateStat(
    statsByKey,
    playerExternalId(playerId),
    teamName,
    season,
    competition
  )

  if (cardName.toLowerCase().includes("red")) {
    stat.red_cards += 1
  } else if (cardName.toLowerCase().includes("yellow")) {
    stat.yellow_cards += 1
  }
}

const competitions = await fetchJson(`${RAW_BASE}/competitions.json`)
const targets = competitions.filter(
  (competition) =>
    competition.competition_gender === "female" &&
    INCLUDED_COMPETITIONS.has(competition.competition_name)
)

const statsByKey = new Map()
let matchesChecked = 0
let eventFilesLoaded = 0
const limitEventFetch = createLimiter(
  Number(process.env.STATSBOMB_EVENT_CONCURRENCY || 8)
)

async function processMatchEvents(match, competition, season) {
  const eventsUrl = `${RAW_BASE}/events/${match.match_id}.json`
  const appearanceSets = new Set()
  const startSets = new Set()

  try {
    const events = await fetchJson(eventsUrl)
    eventFilesLoaded += 1

    for (const event of events || []) {
      if (event.type?.name === "Starting XI") {
        applyStartingXi(
          event,
          statsByKey,
          appearanceSets,
          startSets,
          season,
          competition.competition_name
        )
      } else if (event.type?.name === "Substitution") {
        applySubstitution(
          event,
          statsByKey,
          appearanceSets,
          season,
          competition.competition_name
        )
      } else if (event.type?.name === "Shot") {
        applyShot(
          event,
          statsByKey,
          season,
          competition.competition_name
        )
      } else if (event.type?.name === "Pass") {
        applyAssist(
          event,
          statsByKey,
          season,
          competition.competition_name
        )
      } else if (
        event.type?.name === "Bad Behaviour" ||
        event.type?.name === "Foul Committed"
      ) {
        applyCard(
          event,
          statsByKey,
          season,
          competition.competition_name
        )
      }
    }
  } catch (error) {
    console.warn(`Events unavailable for match ${match.match_id}`, error)
  } finally {
    matchesChecked += 1
  }
}

for (const competition of targets) {
  const season = seasonYear(competition.season_name)
  const matchesUrl = `${RAW_BASE}/matches/${competition.competition_id}/${competition.season_id}.json`
  const matches = await fetchJson(matchesUrl)

  await Promise.all(
    matches.map((match) =>
      limitEventFetch(() => processMatchEvents(match, competition, season))
    )
  )

  console.log(
    `${competition.competition_name} ${competition.season_name}: ${matches.length} event files checked`
  )

  await sleep(500)
}

const teamNames = [
  ...new Set([...statsByKey.values()].map((row) => row.team_name)),
]
const playerExternalIds = [
  ...new Set([...statsByKey.values()].map((row) => row.player_external_id)),
]

const allTeams = await fetchAll("teams", "id,name")
const allPlayers = await fetchAll("players", "id,external_id")

const teamNameSet = new Set(teamNames)
const playerExternalIdSet = new Set(playerExternalIds)
const teams = allTeams.filter((team) => teamNameSet.has(team.name))
const players = allPlayers.filter((player) =>
  playerExternalIdSet.has(player.external_id)
)

const teamIdByName = new Map((teams || []).map((team) => [team.name, team.id]))
const playerIdByExternalId = new Map(
  (players || []).map((player) => [player.external_id, player.id])
)

const statRows = [...statsByKey.values()]
  .map((row) => ({
    player_id: playerIdByExternalId.get(row.player_external_id),
    team_id: teamIdByName.get(row.team_name),
    season: row.season,
    competition: row.competition,
    sport: row.sport,
    appearances: row.appearances,
    starts: row.starts,
    minutes: row.minutes,
    goals: row.goals,
    assists: row.assists,
    yellow_cards: row.yellow_cards,
    red_cards: row.red_cards,
    source: row.source,
    updated_at: row.updated_at,
  }))
  .filter((row) => row.player_id && row.team_id)

for (let from = 0; from < statRows.length; from += 100) {
  const chunk = statRows.slice(from, from + 100)

  await withRetry(`player_season_stats ${from}`, async () => {
    const { error } = await supabase
      .from("player_season_stats")
      .upsert(chunk, {
        onConflict: "player_id,team_id,season,competition",
      })

    if (error) throw error
  })
}

const totalsByPlayerId = new Map()

for (const row of statRows) {
  const current =
    totalsByPlayerId.get(row.player_id) || {
      goals: 0,
      assists: 0,
      appearances: 0,
    }

  current.goals += row.goals
  current.assists += row.assists
  current.appearances += row.appearances
  totalsByPlayerId.set(row.player_id, current)
}

for (const [playerId, totals] of totalsByPlayerId) {
  await withRetry(`player totals ${playerId}`, async () => {
    const { error } = await supabase
      .from("players")
      .update({
        goals: totals.goals,
        assists: totals.assists,
        appearances: totals.appearances,
        updated_at: new Date().toISOString(),
      })
      .eq("id", playerId)

    if (error) throw error
  })
}

console.log(
  `Synced ${statRows.length} player season stat rows from ${eventFilesLoaded}/${matchesChecked} StatsBomb event files. Updated ${totalsByPlayerId.size} player totals.`
)
