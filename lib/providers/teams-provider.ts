import { apiSafeFetch } from "@/lib/api-safe-fetch"
import { getTheSportsDbUrl } from "@/lib/providers/thesportsdb"
import {
  findTrackedTeamByName,
  getTheSportsDbLeagues,
  TRACKED_TEAMS,
} from "@/lib/sports-config"
import { fetchMatches } from "@/lib/providers/matches-provider"

export interface ExternalTeam {
  key: string
  external_id?: string
  name: string
  sport: string
  region: string
  competition: string
  badge_url?: string | null
  sourceLabel: string
  sourceStatus: string
  matches_count?: number
  upcoming_count?: number
  finished_count?: number
  last_match_at?: string | null
}

interface TheSportsDbTeam {
  idTeam: string
  strTeam?: string | null
  strTeamBadge?: string | null
  strSport?: string | null
  strLeague?: string | null
}

interface TheSportsDbTeamsResponse {
  teams?: TheSportsDbTeam[] | null
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

function normalizeCompetitionName(value: string) {
  return value
    .replaceAll("Womens", "Women's")
    .replace("American NWSL", "NWSL")
}

function isClearlyWomenTeamName(value: string) {
  const normalized = value.toLowerCase()

  return [
    "women",
    "femen",
    "femin",
    "pride",
    "reign",
    "thorns",
    "wave",
    "dash",
    "spirit",
    "royals",
    "courage",
    "gotham",
    "angel city",
    "racing louisville",
    "chicago stars",
    "kansas city current",
    "bay fc",
  ].some((token) => normalized.includes(token))
}

async function fetchTeamsForLeague(league: {
  id: string
  name: string
  sport: string
  region: string
}) {
  try {
    const data =
      (await apiSafeFetch(
        getTheSportsDbUrl(
          `lookup_all_teams.php?id=${league.id}`
        )
      )) as TheSportsDbTeamsResponse

    return (data.teams || [])
      .filter((team) => {
        const name = team.strTeam || ""
        return (
          Boolean(findTrackedTeamByName(name)) ||
          isClearlyWomenTeamName(name)
        )
      })
      .map((team) => {
        const name = team.strTeam || "Unknown"
        const tracked = findTrackedTeamByName(name)

        return {
          key:
            tracked?.key ||
            `api-${league.id}-${slugify(name)}`,
          external_id: team.idTeam,
          name,
          sport: league.sport,
          region: league.region,
          competition: normalizeCompetitionName(
            team.strLeague || league.name
          ),
          badge_url: team.strTeamBadge || null,
          sourceLabel: "TheSportsDB",
          sourceStatus: "live-api",
        } satisfies ExternalTeam
      })
  } catch (error) {
    console.warn(
      "TheSportsDB teams unavailable.",
      error
    )

    return []
  }
}

export async function fetchTeams(): Promise<
  ExternalTeam[]
> {
  const [apiTeams, matches] = await Promise.all([
    Promise.all(
      getTheSportsDbLeagues().map((league) =>
        fetchTeamsForLeague(league)
      )
    ).then((groups) => groups.flat()),
    fetchMatches(),
  ])

  const manualTeams = TRACKED_TEAMS.map((team) => ({
    key: team.key,
    name: team.name,
    sport: team.sport,
    region: team.region,
    competition: team.competition,
    badge_url: null,
    sourceLabel: team.sourceLabel,
    sourceStatus: team.sourceStatus,
  }))

  const byKey = new Map<string, ExternalTeam>()

  for (const team of manualTeams) {
    byKey.set(team.key, team)
  }

  for (const team of apiTeams) {
    byKey.set(team.key, {
      ...byKey.get(team.key),
      ...team,
    })
  }

  for (const match of matches) {
    for (const teamName of [
      match.home_team,
      match.away_team,
    ]) {
      const tracked = findTrackedTeamByName(teamName)
      const key =
        tracked?.key ||
        `match-${slugify(teamName)}`
      const existing = byKey.get(key)

      byKey.set(key, {
        key,
        name: tracked?.name || teamName,
        sport: tracked?.sport || match.sport,
        region: tracked?.region || match.region,
        competition:
          tracked?.competition ||
          match.competition,
        badge_url: existing?.badge_url || null,
        sourceLabel:
          existing?.sourceLabel ||
          match.source,
        sourceStatus:
          existing?.sourceStatus ||
          "live-api",
        external_id: existing?.external_id,
        matches_count:
          (existing?.matches_count || 0) + 1,
        upcoming_count:
          (existing?.upcoming_count || 0) +
          (match.status === "SCHEDULED" ? 1 : 0),
        finished_count:
          (existing?.finished_count || 0) +
          (match.status === "FINISHED" ? 1 : 0),
        last_match_at:
          !existing?.last_match_at ||
          new Date(match.starts_at).getTime() >
            new Date(
              existing.last_match_at
            ).getTime()
            ? match.starts_at
            : existing.last_match_at,
      })
    }
  }

  return [...byKey.values()].sort((a, b) =>
    a.name.localeCompare(b.name)
  )
}
