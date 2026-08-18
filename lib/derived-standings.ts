import { getSupabaseAdmin } from "@/lib/supabase-admin"
import {
  canonicalCompetitionName,
  canonicalTeamName,
} from "@/lib/text-normalization"

type MatchRow = {
  sport: string | null
  home_team: string | null
  away_team: string | null
  home_score: number | null
  away_score: number | null
  status: string | null
  starts_at: string | null
  competition: string | null
  season: string | null
}

type TeamRow = {
  id: number
  name: string | null
}

type TableRow = {
  team: string
  sport: string
  competition: string
  season: string
  played: number
  won: number
  draw: number
  lost: number
  goals_for: number
  goals_against: number
  points: number
}

type StandingInsertRow = {
  league: string
  team: string
  played: number
  won: number
  draw: number
  lost: number
  goals_for: number
  goals_against: number
  points: number
  position: number
}

type TeamStatsInsertRow = {
  team_id: number
  season: string
  competition: string
  sport: string
  played: number
  won: number
  draw: number
  lost: number
  goals_for: number
  goals_against: number
  points: number
  source: string
  updated_at: string
}

function isFinished(match: MatchRow) {
  return ["FINISHED", "FT"].includes(
    match.status || ""
  )
}

function seasonOf(match: MatchRow) {
  if (match.season) return String(match.season)

  return String(
    new Date(
      match.starts_at || Date.now()
    ).getUTCFullYear()
  )
}

function emptyRow(
  team: string,
  sport: string,
  competition: string,
  season: string
): TableRow {
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

async function fetchAllMatches() {
  const supabase = getSupabaseAdmin()
  const rows: MatchRow[] = []
  const pageSize = 1000

  for (let from = 0; ; from += pageSize) {
    const to = from + pageSize - 1
    const { data, error } = await supabase
      .from("matches")
      .select(
        "sport,home_team,away_team,home_score,away_score,status,starts_at,competition,season"
      )
      .not("competition", "is", null)
      .not("starts_at", "is", null)
      .range(from, to)

    if (error) throw error

    rows.push(...((data || []) as MatchRow[]))

    if (!data || data.length < pageSize) break
  }

  return rows
}

async function fetchTeamIds() {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from("teams")
    .select("id,name")

  if (error) throw error

  const teamIdByName = new Map<string, number>()

  for (const team of (data || []) as TeamRow[]) {
    const name = canonicalTeamName(team.name)

    if (name && !teamIdByName.has(name)) {
      teamIdByName.set(name, team.id)
    }
  }

  return teamIdByName
}

function sortTable(rows: TableRow[]) {
  return rows.sort((a, b) => {
    const goalDiffA =
      a.goals_for - a.goals_against
    const goalDiffB =
      b.goals_for - b.goals_against

    return (
      b.points - a.points ||
      goalDiffB - goalDiffA ||
      b.goals_for - a.goals_for ||
      a.team.localeCompare(b.team)
    )
  })
}

async function insertStandingsInChunks(
  rows: StandingInsertRow[]
) {
  const supabase = getSupabaseAdmin()
  const chunkSize = 500

  for (let index = 0; index < rows.length; index += chunkSize) {
    const chunk = rows.slice(index, index + chunkSize)
    const { error } = await supabase
      .from("standings")
      .insert(chunk)

    if (error) throw error
  }
}

export async function regenerateDerivedStandings() {
  const supabase = getSupabaseAdmin()
  const matches = (await fetchAllMatches()).filter(
    isFinished
  )
  const groups = new Map<string, Map<string, TableRow>>()

  for (const match of matches) {
    const sport = match.sport || "Football"
    const competition =
      canonicalCompetitionName(
        match.competition,
        sport
      ) || "QueensArena"
    const season = seasonOf(match)
    const groupKey = `${sport}|${competition}|${season}`
    const homeTeam = canonicalTeamName(match.home_team)
    const awayTeam = canonicalTeamName(match.away_team)

    if (!homeTeam || !awayTeam) continue

    if (!groups.has(groupKey)) {
      groups.set(groupKey, new Map())
    }

    const table = groups.get(groupKey)
    if (!table) continue

    for (const team of [homeTeam, awayTeam]) {
      if (!table.has(team)) {
        table.set(
          team,
          emptyRow(team, sport, competition, season)
        )
      }
    }

    const home = table.get(homeTeam)
    const away = table.get(awayTeam)

    if (!home || !away) continue

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

  const teamIdByName = await fetchTeamIds()
  const standingsRows: StandingInsertRow[] = []
  const teamStatsRows: TeamStatsInsertRow[] = []
  const now = new Date().toISOString()

  for (const table of groups.values()) {
    sortTable([...table.values()]).forEach(
      (row, index) => {
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

        const teamId = teamIdByName.get(row.team)

        if (teamId) {
          teamStatsRows.push({
            team_id: teamId,
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
        }
      }
    )
  }

  await supabase.from("standings").delete().neq("id", 0)
  await supabase
    .from("team_season_stats")
    .delete()
    .eq("source", "QueensArena Derived")

  if (standingsRows.length > 0) {
    await insertStandingsInChunks(standingsRows)
  }

  if (teamStatsRows.length > 0) {
    const chunkSize = 500

    for (
      let index = 0;
      index < teamStatsRows.length;
      index += chunkSize
    ) {
      const { error } = await supabase
        .from("team_season_stats")
        .upsert(
          teamStatsRows.slice(
            index,
            index + chunkSize
          ),
          {
            onConflict:
              "team_id,season,competition",
          }
        )

      if (error) throw error
    }
  }

  return {
    matches: matches.length,
    standings: standingsRows.length,
    teamStats: teamStatsRows.length,
  }
}
