import { apiSafeFetch } from "@/lib/api-safe-fetch"
import { getFootballDataCompetitionIds } from "@/lib/sports-config"

export interface ExternalStanding {
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

interface FootballDataStandingRow {
  position?: number
  playedGames?: number
  won?: number
  draw?: number
  lost?: number
  goalsFor?: number
  goalsAgainst?: number
  points?: number
  team?: {
    name?: string
  }
}

interface FootballDataStandingsResponse {
  competition?: {
    name?: string
  }
  standings?: {
    table?: FootballDataStandingRow[]
  }[]
}

export async function fetchStandings(): Promise<
  ExternalStanding[]
> {
  const apiKey =
    process.env.FOOTBALL_DATA_API_KEY

  if (!apiKey) {
    throw new Error(
      "Missing FOOTBALL_DATA_API_KEY."
    )
  }

  const competitionId =
    process.env
      .FOOTBALL_DATA_STANDINGS_COMPETITION_ID ||
    getFootballDataCompetitionIds()[0]

  if (!competitionId) {
    return []
  }

  const data = (await apiSafeFetch(
    `https://api.football-data.org/v4/competitions/${competitionId}/standings`,
    {
      headers: {
        "X-Auth-Token": apiKey,
      },
    }
  )) as FootballDataStandingsResponse

  const table =
    data.standings?.[0]?.table || []

  return table.map(
    (team): ExternalStanding => ({
      league:
        data.competition?.name ||
        "Women's Football",

      team:
        team.team?.name || "Unknown",

      played:
        team.playedGames || 0,

      won: team.won || 0,

      draw: team.draw || 0,

      lost: team.lost || 0,

      goals_for:
        team.goalsFor || 0,

      goals_against:
        team.goalsAgainst || 0,

      points: team.points || 0,

      position:
        team.position || 0,
    })
  )
}
