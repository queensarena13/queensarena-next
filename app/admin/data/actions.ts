"use server"

import { revalidatePath } from "next/cache"
import { isRedirectError } from "next/dist/client/components/redirect-error"
import { redirect } from "next/navigation"
import {
  fetchSportmonksSquad,
  fetchSportmonksTeams,
} from "@/lib/providers/sportmonks-provider"
import { getSupabaseAdmin } from "@/lib/supabase-admin"
import { getErrorMessage } from "@/lib/errors"

function toText(value: FormDataEntryValue | null) {
  return String(value || "").trim()
}

function toOptionalText(value: FormDataEntryValue | null) {
  const text = toText(value)
  return text || null
}

function toNumberOrNull(value: FormDataEntryValue | null) {
  const text = toText(value)
  if (!text) return null

  const number = Number(text)
  return Number.isFinite(number) ? number : null
}

function toScore(value: FormDataEntryValue | null) {
  return toNumberOrNull(value) ?? 0
}

function makeManualExternalId(parts: string[]) {
  return `qa:${parts
    .filter(Boolean)
    .join(":")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")}`
}

function parseCsv(text: string) {
  const rows: string[][] = []
  let field = ""
  let row: string[] = []
  let quoted = false

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]
    const next = text[index + 1]

    if (char === "\"" && quoted && next === "\"") {
      field += "\""
      index += 1
      continue
    }

    if (char === "\"") {
      quoted = !quoted
      continue
    }

    if (char === "," && !quoted) {
      row.push(field)
      field = ""
      continue
    }

    if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") {
        index += 1
      }

      row.push(field)
      field = ""

      if (row.some((value) => value.trim())) {
        rows.push(row)
      }

      row = []
      continue
    }

    field += char
  }

  row.push(field)
  if (row.some((value) => value.trim())) {
    rows.push(row)
  }

  const [headers = [], ...records] = rows
  const keys = headers.map((header) =>
    header.trim().toLowerCase()
  )

  return records.map((record) =>
    Object.fromEntries(
      keys.map((key, index) => [
        key,
        (record[index] || "").trim(),
      ])
    )
  )
}

function rowValue(
  row: Record<string, string>,
  ...keys: string[]
) {
  for (const key of keys) {
    const value = row[key] || row[key.toLowerCase()]

    if (value?.trim()) {
      return value.trim()
    }
  }

  return ""
}

function toIsoDateOrNull(value: string) {
  if (!value) return null

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return null
  }

  return date.toISOString()
}

function redirectWithResult(
  type: "success" | "error",
  message: string
) {
  const params = new URLSearchParams({
    type,
    message,
  })

  redirect(`/admin/data?${params.toString()}`)
}

function revalidateDataPaths() {
  revalidatePath("/")
  revalidatePath("/matches")
  revalidatePath("/teams")
  revalidatePath("/leagues")
  revalidatePath("/players")
  revalidatePath("/stats")
  revalidatePath("/data-status")
  revalidatePath("/admin/data")
  revalidatePath("/admin/data-quality")
}

export async function upsertManualCompetitionAction(
  formData: FormData
) {
  try {
    const sport = toText(formData.get("sport"))
    const competition = toText(formData.get("competition"))
    const season = toText(formData.get("season"))
    const country = toOptionalText(formData.get("country"))
    const region = toOptionalText(formData.get("region"))
    const sourceUrl = toOptionalText(
      formData.get("sourceUrl")
    )
    const notes = toOptionalText(formData.get("notes"))

    if (!sport || !competition || !season) {
      throw new Error(
        "Preenche modalidade, competição e época."
      )
    }

    const now = new Date().toISOString()
    const supabaseAdmin = getSupabaseAdmin()
    const dataStatus = sourceUrl ? "verified" : "editorial"

    const { error: sourceError } =
      await supabaseAdmin.from("data_sources").upsert(
        {
          provider: "queensarena",
          sport,
          competition,
          season,
          country,
          region,
          source_url: sourceUrl,
          coverage_level: "manual",
          reliability: sourceUrl
            ? "official"
            : "editorial",
          enabled: true,
          notes,
          updated_at: now,
        },
        {
          onConflict: "provider,competition,season",
        }
      )

    if (sourceError) throw sourceError

    const { error: leagueError } =
      await supabaseAdmin.from("leagues").upsert(
        {
          name: competition,
          sport,
          country,
          region,
          season,
          provider: "queensarena",
          external_id: makeManualExternalId([
            "competition",
            sport,
            competition,
            season,
          ]),
          data_status: dataStatus,
          source_url: sourceUrl,
          updated_at: now,
        },
        { onConflict: "name" }
      )

    if (leagueError) throw leagueError

    revalidateDataPaths()
    redirectWithResult(
      "success",
      "Competição guardada na QueensArena Data API."
    )
  } catch (error: unknown) {
    if (isRedirectError(error)) throw error
    redirectWithResult("error", getErrorMessage(error))
  }
}

export async function upsertManualTeamAction(
  formData: FormData
) {
  try {
    const name = toText(formData.get("name"))
    const sport = toText(formData.get("sport"))
    const country = toOptionalText(formData.get("country"))
    const region = toOptionalText(formData.get("region"))
    const logoUrl = toOptionalText(formData.get("logoUrl"))
    const sourceUrl = toOptionalText(
      formData.get("sourceUrl")
    )

    if (!name || !sport) {
      throw new Error("Preenche equipa e modalidade.")
    }

    const now = new Date().toISOString()
    const { error } = await getSupabaseAdmin()
      .from("teams")
      .upsert(
        {
          name,
          sport,
          country,
          region: region || country,
          logo_url: logoUrl,
          provider: "queensarena",
          external_id: makeManualExternalId([
            "team",
            sport,
            name,
          ]),
          data_status: sourceUrl ? "verified" : "editorial",
          source_url: sourceUrl,
          updated_at: now,
        },
        { onConflict: "name" }
      )

    if (error) throw error

    revalidateDataPaths()
    redirectWithResult(
      "success",
      "Equipa guardada na QueensArena Data API."
    )
  } catch (error: unknown) {
    if (isRedirectError(error)) throw error
    redirectWithResult("error", getErrorMessage(error))
  }
}

export async function createManualPlayerAction(
  formData: FormData
) {
  try {
    const name = toText(formData.get("name"))
    const teamName = toText(formData.get("teamName"))
    const sport = toText(formData.get("sport"))
    const position = toOptionalText(formData.get("position"))
    const nationality = toOptionalText(
      formData.get("nationality")
    )
    const season = toOptionalText(formData.get("season"))
    const sourceUrl = toOptionalText(
      formData.get("sourceUrl")
    )

    if (!name || !sport) {
      throw new Error("Preenche jogadora e modalidade.")
    }

    const supabaseAdmin = getSupabaseAdmin()
    const now = new Date().toISOString()
    let teamId: number | null = null

    if (teamName) {
      const { data: team, error: teamError } =
        await supabaseAdmin
          .from("teams")
          .select("id")
          .eq("name", teamName)
          .maybeSingle()

      if (teamError) throw teamError
      teamId = team?.id || null
    }

    const { error } = await supabaseAdmin
      .from("players")
      .insert({
        name,
        team_id: teamId,
        sport,
        position,
        nationality,
        season,
        provider: "queensarena",
        external_id: makeManualExternalId([
          "player",
          sport,
          name,
          teamName,
          season || "",
        ]),
        data_status: sourceUrl ? "verified" : "editorial",
        source_url: sourceUrl,
        updated_at: now,
      })

    if (error) throw error

    revalidateDataPaths()
    redirectWithResult(
      "success",
      "Jogadora adicionada à QueensArena Data API."
    )
  } catch (error: unknown) {
    if (isRedirectError(error)) throw error
    redirectWithResult("error", getErrorMessage(error))
  }
}

export async function upsertManualMatchAction(
  formData: FormData
) {
  try {
    const sport = toText(formData.get("sport"))
    const competition = toText(formData.get("competition"))
    const season = toOptionalText(formData.get("season"))
    const region = toOptionalText(formData.get("region"))
    const homeTeam = toText(formData.get("homeTeam"))
    const awayTeam = toText(formData.get("awayTeam"))
    const startsAt = toText(formData.get("startsAt"))
    const status =
      toText(formData.get("status")) || "SCHEDULED"
    const venue = toOptionalText(formData.get("venue"))
    const sourceUrl = toOptionalText(
      formData.get("sourceUrl")
    )

    if (
      !sport ||
      !competition ||
      !homeTeam ||
      !awayTeam ||
      !startsAt
    ) {
      throw new Error(
        "Preenche modalidade, competição, equipas e data."
      )
    }

    if (homeTeam === awayTeam) {
      throw new Error(
        "A equipa da casa e a equipa visitante têm de ser diferentes."
      )
    }

    const now = new Date().toISOString()
    const startsAtIso = new Date(startsAt).toISOString()
    const externalId = makeManualExternalId([
      "match",
      sport,
      competition,
      homeTeam,
      awayTeam,
      startsAtIso,
    ])
    const supabaseAdmin = getSupabaseAdmin()

    const { error } = await supabaseAdmin
      .from("matches")
      .upsert(
        {
          external_id: externalId,
          sport,
          home_team: homeTeam,
          away_team: awayTeam,
          home_score: toScore(formData.get("homeScore")),
          away_score: toScore(formData.get("awayScore")),
          venue,
          status,
          starts_at: startsAtIso,
          competition,
          season,
          source: "queensarena",
          region,
          data_status: sourceUrl ? "verified" : "editorial",
          source_url: sourceUrl,
          updated_at: now,
        },
        { onConflict: "external_id" }
      )

    if (error) throw error

    const { error: logError } = await supabaseAdmin
      .from("data_import_batches")
      .insert({
        provider: "queensarena",
        sport,
        competition,
        season,
        source_url: sourceUrl,
        status: "completed",
        imported_count: 1,
      })

    if (logError) throw logError

    revalidateDataPaths()
    redirectWithResult(
      "success",
      "Jogo guardado na QueensArena Data API."
    )
  } catch (error: unknown) {
    if (isRedirectError(error)) throw error
    redirectWithResult("error", getErrorMessage(error))
  }
}

export async function importOfficialMatchesCsvAction(
  formData: FormData
) {
  try {
    const csv = toText(formData.get("csv"))

    if (!csv) {
      throw new Error("Cola o CSV oficial antes de importar.")
    }

    const parsedRows = parseCsv(csv)
    const now = new Date().toISOString()
    const rows = parsedRows
      .map((row) => {
        const sport =
          rowValue(row, "sport") || "Football"
        const competition = rowValue(
          row,
          "competition"
        )
        const season =
          rowValue(row, "season") || "2024"
        const region = rowValue(
          row,
          "region",
          "country"
        )
        const homeTeam = rowValue(
          row,
          "home_team",
          "home"
        )
        const awayTeam = rowValue(
          row,
          "away_team",
          "away"
        )
        const startsAt = toIsoDateOrNull(
          rowValue(
            row,
            "starts_at",
            "date",
            "datetime"
          )
        )
        const sourceUrl = rowValue(
          row,
          "source_url",
          "url"
        )

        if (
          !competition ||
          !homeTeam ||
          !awayTeam ||
          !startsAt
        ) {
          return null
        }

        const externalId =
          rowValue(row, "external_id") ||
          makeManualExternalId([
            "official",
            sport,
            competition,
            season,
            homeTeam,
            awayTeam,
            startsAt,
          ])

        const hasScore =
          rowValue(row, "home_score", "score_home") !==
            "" ||
          rowValue(row, "away_score", "score_away") !==
            ""

        return {
          external_id: externalId,
          sport,
          home_team: homeTeam,
          away_team: awayTeam,
          home_score: toScore(
            rowValue(row, "home_score", "score_home")
          ),
          away_score: toScore(
            rowValue(row, "away_score", "score_away")
          ),
          venue: rowValue(row, "venue") || null,
          status:
            rowValue(row, "status") ||
            (hasScore ? "FINISHED" : "SCHEDULED"),
          starts_at: startsAt,
          competition,
          season,
          source: "QueensArena Official",
          region: region || null,
          gender: "women",
          data_status: "verified",
          source_url: sourceUrl || null,
          updated_at: now,
        }
      })
      .filter((row) => row !== null)

    if (rows.length === 0) {
      throw new Error(
        "Nenhuma linha válida encontrada no CSV."
      )
    }

    const supabaseAdmin = getSupabaseAdmin()

    const { error } = await supabaseAdmin
      .from("matches")
      .upsert(rows, {
        onConflict: "external_id",
      })

    if (error) throw error

    const teamRows = new Map<
      string,
      {
        name: string
        sport: string
        country: string | null
        region: string | null
        provider: string
        data_status: string
        updated_at: string
      }
    >()

    for (const row of rows) {
      if (!row) continue

      for (const name of [
        row.home_team,
        row.away_team,
      ]) {
        teamRows.set(`${row.sport}:${name}`, {
          name,
          sport: row.sport,
          country: row.region,
          region: row.region,
          provider: "QueensArena Official",
          data_status: "verified",
          updated_at: now,
        })
      }
    }

    if (teamRows.size > 0) {
      const { error: teamError } =
        await supabaseAdmin.from("teams").upsert(
          [...teamRows.values()],
          {
            onConflict: "name",
          }
        )

      if (teamError) throw teamError
    }

    const firstRow = rows[0]
    const { error: logError } = await supabaseAdmin
      .from("data_import_batches")
      .insert({
        provider: "QueensArena Official",
        sport: firstRow?.sport || "Football",
        competition:
          firstRow?.competition || "Official import",
        season: firstRow?.season || null,
        source_url: firstRow?.source_url || null,
        status: "completed",
        imported_count: rows.length,
      })

    if (logError) throw logError

    revalidateDataPaths()
    redirectWithResult(
      "success",
      `Importados ${rows.length} jogos oficiais e ${teamRows.size} equipas.`
    )
  } catch (error: unknown) {
    if (isRedirectError(error)) throw error
    redirectWithResult("error", getErrorMessage(error))
  }
}

export async function importOfficialCatalogCsvAction(
  formData: FormData
) {
  try {
    const csv = toText(formData.get("csv"))

    if (!csv) {
      throw new Error("Cola o CSV oficial antes de importar.")
    }

    const parsedRows = parseCsv(csv)
    const now = new Date().toISOString()
    const supabaseAdmin = getSupabaseAdmin()
    const teamRows = parsedRows
      .map((row) => {
        const entityType = rowValue(
          row,
          "entity_type",
          "type"
        ).toLowerCase()
        const explicitTeamName = rowValue(
          row,
          "team_name"
        )

        if (
          entityType !== "team" &&
          !explicitTeamName
        ) {
          return null
        }

        const name =
          explicitTeamName || rowValue(row, "name")
        const sport =
          rowValue(row, "sport") || "Football"
        const country =
          rowValue(row, "country") || null
        const region =
          rowValue(row, "region") || country
        const season =
          rowValue(row, "season") || ""

        if (!name || !sport) return null

        return {
          external_id:
            rowValue(row, "external_id") ||
            makeManualExternalId([
              "official-team",
              sport,
              name,
              season,
            ]),
          provider: "QueensArena Official",
          name,
          sport,
          country,
          region,
          data_status: "verified",
          source_url:
            rowValue(row, "source_url", "url") ||
            null,
          updated_at: now,
        }
      })
      .filter((row) => row !== null)

    if (teamRows.length > 0) {
      const { error } = await supabaseAdmin
        .from("teams")
        .upsert(teamRows, {
          onConflict: "name",
        })

      if (error) throw error
    }

    const { data: teams, error: teamsError } =
      await supabaseAdmin
        .from("teams")
        .select("id,name")

    if (teamsError) throw teamsError

    const teamIdByName = new Map(
      (teams || []).map((team) => [
        String(team.name),
        Number(team.id),
      ])
    )

    const playerRows = parsedRows
      .map((row) => {
        const entityType = rowValue(
          row,
          "entity_type",
          "type"
        ).toLowerCase()

        if (entityType !== "player") {
          return null
        }

        const name =
          rowValue(row, "player_name") ||
          rowValue(row, "name")
        const teamName = rowValue(row, "team")
        const sport =
          rowValue(row, "sport") || "Football"
        const season =
          rowValue(row, "season") || null

        if (!name || !sport) return null

        return {
          external_id:
            rowValue(row, "external_id") ||
            makeManualExternalId([
              "official-player",
              sport,
              name,
              teamName,
              season || "",
            ]),
          provider: "QueensArena Official",
          team_id:
            teamIdByName.get(teamName) || null,
          name,
          sport,
          position:
            rowValue(row, "position") || null,
          nationality:
            rowValue(row, "nationality") ||
            rowValue(row, "country") ||
            null,
          age: toNumberOrNull(rowValue(row, "age")),
          goals:
            toNumberOrNull(rowValue(row, "goals")) ||
            0,
          assists:
            toNumberOrNull(rowValue(row, "assists")) ||
            0,
          appearances:
            toNumberOrNull(
              rowValue(row, "appearances")
            ) || 0,
          image_url:
            rowValue(row, "image_url") || null,
          season,
          data_status: "verified",
          source_url:
            rowValue(row, "source_url", "url") ||
            null,
          updated_at: now,
        }
      })
      .filter((row) => row !== null)

    if (playerRows.length > 0) {
      const { data: existing, error: existingError } =
        await supabaseAdmin
          .from("players")
          .select("external_id")
          .eq("provider", "QueensArena Official")

      if (existingError) throw existingError

      const existingIds = new Set(
        (existing || []).map((item) =>
          String(item.external_id)
        )
      )
      const newPlayerRows = playerRows.filter(
        (row) => !existingIds.has(row.external_id)
      )

      if (newPlayerRows.length > 0) {
        const { error } = await supabaseAdmin
          .from("players")
          .insert(newPlayerRows)

        if (error) throw error
      }
    }

    if (
      teamRows.length === 0 &&
      playerRows.length === 0
    ) {
      throw new Error(
        "Nenhuma equipa ou jogadora válida encontrada no CSV."
      )
    }

    revalidateDataPaths()
    redirectWithResult(
      "success",
      `Importadas ${teamRows.length} equipas e ${playerRows.length} jogadoras oficiais.`
    )
  } catch (error: unknown) {
    if (isRedirectError(error)) throw error
    redirectWithResult("error", getErrorMessage(error))
  }
}

export async function importSportmonksTeamsAction(
  formData: FormData
) {
  try {
    const seasonId = toText(formData.get("seasonId"))
    const season = toText(formData.get("season"))
    const competition = toText(formData.get("competition"))
    const region = toText(formData.get("region")) || "Europe"

    if (!seasonId || !season || !competition) {
      redirectWithResult(
        "error",
        "Preenche o ID da época, a época e a competição."
      )
    }

    const teams = await fetchSportmonksTeams(seasonId)
    const supabaseAdmin = getSupabaseAdmin()
    const now = new Date().toISOString()

    const rows = teams.map((team) => ({
      external_id: String(team.id),
      provider: "sportmonks",
      name: team.name,
      sport: "Football",
      country: region,
      region,
      logo_url: team.image_path || null,
      data_status: "imported",
      updated_at: now,
    }))

    let importedTeams: {
      id: number
      name: string
    }[] = []

    if (rows.length > 0) {
      const { data, error } = await supabaseAdmin
        .from("teams")
        .upsert(rows, {
          onConflict: "provider,external_id",
        })
        .select("id, name")

      if (error) throw error

      importedTeams = data || []
    }

    if (importedTeams.length > 0) {
      const teamStatsRows = importedTeams.map((team) => ({
        team_id: team.id,
        season,
        competition,
        sport: "Football",
        source: "sportmonks",
        updated_at: now,
      }))

      const { error: statsError } = await supabaseAdmin
        .from("team_season_stats")
        .upsert(teamStatsRows, {
          onConflict: "team_id,season,competition",
        })

      if (statsError) throw statsError
    }

    const { error: sourceError } =
      await supabaseAdmin.from("data_sources").upsert(
        {
          provider: "sportmonks",
          sport: "Football",
          competition,
          season,
          provider_season_id: seasonId,
          enabled: true,
          updated_at: now,
        },
        {
          onConflict: "provider,competition,season",
        }
      )

    if (sourceError) throw sourceError

    revalidateDataPaths()

    redirectWithResult(
      "success",
      `Importadas ${rows.length} equipas e preparada a época.`
    )
  } catch (error: unknown) {
    if (isRedirectError(error)) throw error
    redirectWithResult("error", getErrorMessage(error))
  }
}

export async function importSportmonksSquadAction(
  formData: FormData
) {
  try {
    const teamId = toText(formData.get("teamId"))
    const teamName = toText(formData.get("teamName"))
    const season = toText(formData.get("season"))
    const competition = toText(formData.get("competition"))

    if (!teamId || !teamName || !season) {
      redirectWithResult(
        "error",
        "Preenche o ID da equipa, o nome da equipa e a época."
      )
    }

    const supabaseAdmin = getSupabaseAdmin()
    const { data: team } = await supabaseAdmin
      .from("teams")
      .select("id")
      .eq("name", teamName)
      .maybeSingle()

    const squad = await fetchSportmonksSquad(teamId)
    const now = new Date().toISOString()
    const rows = squad.map((entry) => {
      const player = entry.player || entry

      return {
        external_id: String(player.id),
        provider: "sportmonks",
        team_id: team?.id || null,
        name:
          player.display_name ||
          player.name ||
          "Unknown",
        sport: "Football",
        position: player.position_id
          ? String(player.position_id)
          : null,
        nationality: player.nationality_id
          ? String(player.nationality_id)
          : null,
        image_url: player.image_path || null,
        season,
        data_status: "imported",
        updated_at: now,
      }
    })

    let importedPlayers: {
      id: number
      external_id: string | null
    }[] = []

    if (rows.length > 0) {
      const { data, error } = await supabaseAdmin
        .from("players")
        .upsert(rows, {
          onConflict: "provider,external_id",
        })
        .select("id, external_id")

      if (error) throw error

      importedPlayers = data || []
    }

    if (team?.id && importedPlayers.length > 0) {
      const membershipRows = importedPlayers.map(
        (player) => ({
          player_id: player.id,
          team_id: team.id,
          season,
          competition: competition || null,
          provider: "sportmonks",
          external_id: player.external_id,
          active: true,
          updated_at: now,
        })
      )

      const { error: rosterError } = await supabaseAdmin
        .from("roster_memberships")
        .upsert(membershipRows, {
          onConflict:
            "player_id,team_id,season,competition",
        })

      if (rosterError) throw rosterError

      const statsRows = importedPlayers.map((player) => ({
        player_id: player.id,
        team_id: team.id,
        season,
        competition: competition || null,
        sport: "Football",
        source: "sportmonks",
        updated_at: now,
      }))

      const { error: statsError } = await supabaseAdmin
        .from("player_season_stats")
        .upsert(statsRows, {
          onConflict:
            "player_id,team_id,season,competition",
        })

      if (statsError) throw statsError
    }

    revalidateDataPaths()

    redirectWithResult(
      "success",
      `Importadas ${rows.length} jogadoras e criado o plantel da época.`
    )
  } catch (error: unknown) {
    if (isRedirectError(error)) throw error
    redirectWithResult("error", getErrorMessage(error))
  }
}
