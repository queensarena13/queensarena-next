import { TeamDetail } from "@/components/team-detail"
import {
  findTrackedTeamByName,
  TRACKED_TEAMS,
} from "@/lib/sports-config"
import { fetchQueensArenaTeams } from "@/lib/queensarena-data"

interface Props {
  params: Promise<{
    name: string
  }>
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

export default async function TeamPage({
  params,
}: Props) {
  const { name } = await params
  const rawName = decodeURIComponent(name)
  const trackedTeam =
    TRACKED_TEAMS.find(
      (team) => team.key === rawName
    ) || findTrackedTeamByName(rawName)
  const publicTeams = trackedTeam
    ? []
    : await fetchQueensArenaTeams({
        limit: 3000,
      })
  const publicTeam = publicTeams.find((team) => {
    const teamName =
      "name" in team ? String(team.name || "") : ""

    return (
      teamName === rawName ||
      slugify(teamName) === rawName
    )
  })
  const publicTeamName =
    publicTeam && "name" in publicTeam
      ? String(publicTeam.name || rawName)
      : rawName
  const publicTeamSport =
    publicTeam && "sport" in publicTeam
      ? String(publicTeam.sport || "Sport")
      : "Sport"
  const publicTeamRegion =
    publicTeam && "region" in publicTeam
      ? String(publicTeam.region || "Global")
      : "Global"
  const publicTeamLogo =
    publicTeam && "logo_url" in publicTeam
      ? String(publicTeam.logo_url || "")
      : ""

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-6 text-white lg:px-8">
      <TeamDetail
        teamKey={trackedTeam?.key || rawName}
        teamName={trackedTeam?.name || publicTeamName}
        sport={trackedTeam?.sport || publicTeamSport}
        competition={
          trackedTeam?.competition || "QueensArena"
        }
        region={trackedTeam?.region || publicTeamRegion}
        logoUrl={publicTeamLogo}
      />
    </main>
  )
}
