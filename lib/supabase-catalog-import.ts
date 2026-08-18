import { fetchPlayers } from "@/lib/providers/players-provider"
import { fetchTeams } from "@/lib/providers/teams-provider"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

function providerKey(value?: string | null) {
  return (value || "queensarena")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

function currentSeason() {
  return String(new Date().getFullYear())
}

export async function importCatalogToSupabase({
  limitTeams = 32,
}: {
  limitTeams?: number
} = {}) {
  const supabaseAdmin = getSupabaseAdmin()
  const now = new Date().toISOString()

  const teams = await fetchTeams()
  const teamRows = teams.map((team) => ({
    external_id: team.external_id || team.key,
    provider: team.external_id
      ? providerKey(team.sourceLabel)
      : "queensarena",
    name: team.name,
    sport: team.sport,
    country: team.region,
    region: team.region,
    logo_url: team.badge_url || null,
    updated_at: now,
  }))

  const { data: importedTeams, error: teamsError } =
    await supabaseAdmin
      .from("teams")
      .upsert(teamRows, {
        onConflict: "provider,external_id",
      })
      .select("id, name")

  if (teamsError) {
    throw teamsError
  }

  const teamIdByName = new Map(
    (importedTeams || []).map((team) => [
      team.name,
      team.id,
    ])
  )

  const players = await fetchPlayers({
    limitTeams,
  })
  const season = currentSeason()
  const playerRows = players.map((player) => ({
    external_id: player.external_id || player.key,
    provider: providerKey(player.sourceLabel),
    team_id:
      teamIdByName.get(player.teamName) || null,
    name: player.name,
    sport: player.sport,
    position: player.position,
    nationality: player.nationality,
    image_url: player.photo_url,
    season,
    updated_at: now,
  }))

  let importedPlayers: {
    id: number
    external_id: string | null
    provider: string | null
    team_id: number | null
  }[] = []

  if (playerRows.length > 0) {
    const { data, error } = await supabaseAdmin
      .from("players")
      .upsert(playerRows, {
        onConflict: "provider,external_id",
      })
      .select("id, external_id, provider, team_id")

    if (error) {
      throw error
    }

    importedPlayers = data || []
  }

  const rosterRows = importedPlayers
    .filter((player) => player.team_id)
    .map((player) => ({
      player_id: player.id,
      team_id: player.team_id,
      season,
      competition: null,
      provider: player.provider,
      external_id: player.external_id,
      active: true,
      updated_at: now,
    }))

  if (rosterRows.length > 0) {
    const { error } = await supabaseAdmin
      .from("roster_memberships")
      .upsert(rosterRows, {
        onConflict:
          "player_id,team_id,season,competition",
      })

    if (error) {
      throw error
    }
  }

  return {
    teams: teamRows.length,
    players: playerRows.length,
    rosters: rosterRows.length,
  }
}
