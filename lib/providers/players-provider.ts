import { apiSafeFetch } from "@/lib/api-safe-fetch"
import { getTheSportsDbUrl } from "@/lib/providers/thesportsdb"
import {
  ExternalTeam,
  fetchTeams,
} from "@/lib/providers/teams-provider"

export interface ExternalPlayer {
  key: string
  external_id: string
  name: string
  sport: string
  position: string | null
  nationality: string | null
  teamName: string
  teamKey: string
  competition: string
  region: string
  photo_url: string | null
  sourceLabel: string
}

interface TheSportsDbPlayer {
  idPlayer: string
  strPlayer?: string | null
  strPosition?: string | null
  strNationality?: string | null
  strThumb?: string | null
  strGender?: string | null
  strTeam?: string | null
}

interface TheSportsDbPlayersResponse {
  player?: TheSportsDbPlayer[] | null
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

async function fetchPlayersForTeam(
  team: ExternalTeam
): Promise<ExternalPlayer[]> {
  try {
    const url = team.external_id
      ? getTheSportsDbUrl(
          `lookup_all_players.php?id=${team.external_id}`
        )
      : getTheSportsDbUrl(
          `searchplayers.php?t=${encodeURIComponent(
            team.name
          )}`
        )
    const data =
      (await apiSafeFetch(url)) as TheSportsDbPlayersResponse

    return (data.player || [])
      .filter((player) => {
        const gender =
          player.strGender?.toLowerCase()
        const teamName =
          player.strTeam?.toLowerCase()

        return (
          Boolean(player.strPlayer) &&
          (!gender || gender === "female") &&
          (!teamName ||
            teamName.includes(
              team.name.toLowerCase()
            ) ||
            team.name
              .toLowerCase()
              .includes(teamName))
        )
      })
      .map((player) => ({
        key: `sportsdb-${player.idPlayer}`,
        external_id: player.idPlayer,
        name: player.strPlayer || "Unknown player",
        sport: team.sport,
        position: player.strPosition || null,
        nationality: player.strNationality || null,
        teamName: team.name,
        teamKey: team.key,
        competition: team.competition,
        region: team.region,
        photo_url: player.strThumb || null,
        sourceLabel: "TheSportsDB",
      }))
  } catch (error) {
    console.warn(
      `TheSportsDB players unavailable for ${team.name}.`,
      error
    )

    return []
  }
}

export async function fetchPlayers({
  teamName,
  limitTeams = 24,
}: {
  teamName?: string
  limitTeams?: number
} = {}): Promise<ExternalPlayer[]> {
  const normalizedTeamName = teamName
    ?.trim()
    .toLowerCase()

  const teams = await fetchTeams()
  const selectedTeams = teams
    .filter((team) =>
      normalizedTeamName
        ? team.name.toLowerCase() === normalizedTeamName
        : true
    )
    .slice(0, normalizedTeamName ? 1 : limitTeams)

  const players = await Promise.all(
    selectedTeams.map((team) =>
      fetchPlayersForTeam(team)
    )
  )

  return players
    .flat()
    .sort((a, b) =>
      `${a.teamName}-${a.name}`.localeCompare(
        `${b.teamName}-${b.name}`
      )
    )
    .map((player) => ({
      ...player,
      key:
        player.key ||
        `api-${slugify(player.teamName)}-${slugify(
          player.name
        )}`,
    }))
}
