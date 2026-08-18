import type { SupabaseClient } from "@supabase/supabase-js"
import { ExternalMatch } from "@/lib/providers/matches-provider"
import { normalizeTeamName, normalizeVenue } from "@/lib/normalizers"
import { validateMatch } from "@/lib/validators"

export async function upsertMatches(
  supabaseAdmin: SupabaseClient,
  matches: ExternalMatch[]
) {
  const rows = matches
    .map((match) => ({
      ...match,
      home_team: normalizeTeamName(
        match.home_team
      ),
      away_team: normalizeTeamName(
        match.away_team
      ),
      venue: normalizeVenue(match.venue),
    }))
    .filter(validateMatch)
    .map((match) => ({
      external_id: match.external_id,
      sport: match.sport,
      home_team: match.home_team,
      away_team: match.away_team,
      home_score: match.home_score,
      away_score: match.away_score,
      venue: match.venue,
      status: match.status,
      starts_at: match.starts_at,
      competition: match.competition,
      source: match.source,
      region: match.region,
    }))

  if (rows.length === 0) {
    return {
      valid: 0,
      upserted: 0,
    }
  }

  const { error } = await supabaseAdmin
    .from("matches")
    .upsert(rows, {
      onConflict: "external_id",
    })

  if (error) {
    throw error
  }

  const dataSources = new Map<
    string,
    {
      provider: string
      sport: string
      competition: string
      season: string
      region: string | null
      enabled: boolean
    }
  >()

  for (const row of rows) {
    const startsAt = row.starts_at
      ? new Date(row.starts_at)
      : null
    const season =
      startsAt && !Number.isNaN(startsAt.getTime())
        ? String(startsAt.getUTCFullYear())
        : "2026"
    const key = [
      row.source,
      row.competition,
      season,
    ].join("|")

    dataSources.set(key, {
      provider: row.source,
      sport: row.sport,
      competition: row.competition,
      season,
      region: row.region || null,
      enabled: true,
    })
  }

  if (dataSources.size > 0) {
    const { error: sourceError } = await supabaseAdmin
      .from("data_sources")
      .upsert([...dataSources.values()], {
        onConflict: "provider,competition,season",
      })

    if (sourceError) {
      throw sourceError
    }
  }

  return {
    valid: rows.length,
    upserted: rows.length,
  }
}
