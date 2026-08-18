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

const TEAM_ALIASES = new Map(
  Object.entries({
    "benfica w": "SL Benfica",
    "benfica women": "SL Benfica",
    "sl benfica w": "SL Benfica",
    "sporting w": "Sporting CP",
    "sporting women": "Sporting CP",
    "sporting cp w": "Sporting CP",
    "sporting cp women": "Sporting CP",
    "braga w": "SC Braga",
    "sc braga w": "SC Braga",
    "sc braga women": "SC Braga",
    "maritimo w": "CS Marítimo",
    "cs maritimo w": "CS Marítimo",
    "cs marítimo w": "CS Marítimo",
    "damaiense w": "SF Damaiense",
    "sf damaiense w": "SF Damaiense",
    "torreense w": "SCU Torreense",
    "scu torreense w": "SCU Torreense",
    "racing power w": "Racing Power FC",
    "racing power fc w": "Racing Power FC",
    "valadares gaia w": "Valadares Gaia FC",
    "vitoria sc w": "Vitória SC",
    "vitória sc w": "Vitória SC",
    "gyor w": "Győri Audi ETO KC Women",
    "gyori audi eto kc w": "Győri Audi ETO KC Women",
    "győri audi eto kc w": "Győri Audi ETO KC Women",
    "csm bucuresti w": "CSM București Women",
    "csm bucurești w": "CSM București Women",
    "kristiansand w": "Vipers Kristiansand Women",
    "esbjerg w": "Team Esbjerg Women",
    "brest bretagne w": "Brest Bretagne Handball Women",
  })
)

function normalizeTeamNameKey(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\b(feminino|feminina)\b/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
}

function canonicalTeamName(value) {
  const text = String(value || "").trim()
  if (!text) return text

  return TEAM_ALIASES.get(normalizeTeamNameKey(text)) || text
}

async function fetchAllMatches() {
  const rows = []
  const pageSize = 1000

  for (let from = 0; ; from += pageSize) {
    const to = from + pageSize - 1
    const { data, error } = await supabase
      .from("matches")
      .select(
        "sport,home_team,away_team,home_score,away_score,status,starts_at,competition,season,region"
      )
      .not("competition", "is", null)
      .not("starts_at", "is", null)
      .range(from, to)

    if (error) throw error

    rows.push(...(data || []))

    if (!data || data.length < pageSize) {
      break
    }
  }

  return rows
}

function seasonOf(match) {
  if (match.season) return String(match.season)
  return String(new Date(match.starts_at).getUTCFullYear())
}

function isFinished(match) {
  return ["FINISHED", "FT"].includes(match.status)
}

function tableRow(team, sport, competition, season) {
  return {
    team,
    sport,
    competition,
    season,
    played: 0,
    won: 0,
    draw: 0,
    lost: 0,
    goals_for: 0,
    goals_against: 0,
    points: 0,
  }
}

const matches = (await fetchAllMatches()).filter(isFinished)
const groups = new Map()

for (const match of matches) {
  const competition = match.competition || "QueensArena"
  const season = seasonOf(match)
  const groupKey = `${match.sport}|${competition}|${season}`

  if (!groups.has(groupKey)) {
    groups.set(groupKey, new Map())
  }

  const table = groups.get(groupKey)
  const homeTeam = canonicalTeamName(match.home_team)
  const awayTeam = canonicalTeamName(match.away_team)

  for (const team of [homeTeam, awayTeam]) {
    if (!table.has(team)) {
      table.set(
        team,
        tableRow(team, match.sport, competition, season)
      )
    }
  }

  const home = table.get(homeTeam)
  const away = table.get(awayTeam)
  const homeScore = Number(match.home_score || 0)
  const awayScore = Number(match.away_score || 0)

  home.played += 1
  away.played += 1
  home.goals_for += homeScore
  home.goals_against += awayScore
  away.goals_for += awayScore
  away.goals_against += homeScore

  if (homeScore > awayScore) {
    home.won += 1
    away.lost += 1
    home.points += 3
  } else if (awayScore > homeScore) {
    away.won += 1
    home.lost += 1
    away.points += 3
  } else {
    home.draw += 1
    away.draw += 1
    home.points += 1
    away.points += 1
  }
}

const standingsRows = []
const teamStatsRows = []
const now = new Date().toISOString()

for (const table of groups.values()) {
  const sorted = [...table.values()].sort((a, b) => {
    const goalDiffA = a.goals_for - a.goals_against
    const goalDiffB = b.goals_for - b.goals_against

    return (
      b.points - a.points ||
      goalDiffB - goalDiffA ||
      b.goals_for - a.goals_for ||
      a.team.localeCompare(b.team)
    )
  })

  sorted.forEach((row, index) => {
    standingsRows.push({
      league: `${row.competition} ${row.season}`,
      team: row.team,
      played: row.played,
      won: row.won,
      draw: row.draw,
      lost: row.lost,
      goals_for: row.goals_for,
      goals_against: row.goals_against,
      points: row.points,
      position: index + 1,
    })

    teamStatsRows.push({
      team_name: row.team,
      season: row.season,
      competition: row.competition,
      sport: row.sport,
      played: row.played,
      won: row.won,
      draw: row.draw,
      lost: row.lost,
      goals_for: row.goals_for,
      goals_against: row.goals_against,
      points: row.points,
      source: "QueensArena Derived",
      updated_at: now,
    })
  })
}

const { data: teams, error: teamsError } = await supabase
  .from("teams")
  .select("id,name")

if (teamsError) throw teamsError

const teamIdByName = new Map(
  (teams || []).map((team) => [canonicalTeamName(team.name), team.id])
)
const resolvedTeamStats = teamStatsRows
  .map((row) => {
    const teamId = teamIdByName.get(row.team_name)
    if (!teamId) return null

    const stats = { ...row }
    delete stats.team_name
    return {
      ...stats,
      team_id: teamId,
    }
  })
  .filter(Boolean)

await supabase.from("standings").delete().neq("id", 0)
await supabase
  .from("team_season_stats")
  .delete()
  .eq("source", "QueensArena Derived")

if (standingsRows.length > 0) {
  const { error } = await supabase
    .from("standings")
    .insert(standingsRows)

  if (error) throw error
}

if (resolvedTeamStats.length > 0) {
  const { error } = await supabase
    .from("team_season_stats")
    .upsert(resolvedTeamStats, {
      onConflict: "team_id,season,competition",
    })

  if (error) throw error
}

console.log(
  `Generated ${standingsRows.length} standings rows and ${resolvedTeamStats.length} team season stats from ${matches.length} finished matches.`
)
