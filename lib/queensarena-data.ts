import { supabase } from "@/lib/supabase"
import { getSupabaseAdmin } from "@/lib/supabase-admin"
import { ExternalMatch } from "@/lib/providers/matches-provider"
import {
  canonicalCompetitionName,
  canonicalLeagueName,
  canonicalTeamName,
  competitionAliasesForFilter,
  inferCountryFromTeam,
  leagueAliasesForFilter,
  normalizeDisplayText,
} from "@/lib/text-normalization"

type MatchRow = {
  external_id: string | null
  sport: string
  home_team: string
  away_team: string
  home_score: number | null
  away_score: number | null
  venue: string | null
  status: string
  starts_at: string | null
  competition: string | null
  season: string | null
  source: string | null
  region: string | null
  data_status: string | null
  source_url: string | null
  updated_at: string | null
}

type FetchQueensArenaMatchesOptions = {
  limit?: number
  season?: string | null
  view?: string | null
  sport?: string | null
  competition?: string | null
}

export type QueensArenaOfficialSource = {
  slug: string
  name: string
  sport: string
  country: string | null
  region: string | null
  competition: string | null
  season: string | null
  source_url: string
  source_type: string
  ingestion_method: string
  rights_status: string
  priority: number
  status: string
  notes: string | null
  updated_at: string | null
}

export type QueensArenaStanding = {
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

export type QueensArenaTeamSeasonStat = {
  team_id: number
  team_name?: string | null
  season: string
  competition: string | null
  sport: string
  played: number
  won: number
  draw: number
  lost: number
  goals_for: number
  goals_against: number
  points: number
  source: string | null
  updated_at: string | null
}

export type QueensArenaPlayerSeasonStat = {
  player_id: number
  player_name?: string | null
  team_id: number | null
  team_name?: string | null
  season: string
  competition: string | null
  sport: string
  appearances: number
  starts: number
  minutes: number
  goals: number
  assists: number
  yellow_cards: number
  red_cards: number
  saves: number
  source: string | null
  updated_at: string | null
}

type FilterableQuery = {
  gte(column: string, value: string): MatchRowsQuery
  lt(column: string, value: string): MatchRowsQuery
  eq(
    column: string,
    value: string
  ): MatchRowsQuery
  in(
    column: string,
    values: string[]
  ): MatchRowsQuery
}

type MatchRowsQuery = FilterableQuery &
  PromiseLike<{
    data: unknown[] | null
    error: unknown
  }>

function getDataClient() {
  try {
    return getSupabaseAdmin()
  } catch {
    return supabase
  }
}

function getSeasonRange(season: string) {
  const year = Number(season)

  if (!Number.isFinite(year)) {
    return null
  }

  return {
    from: `${year}-01-01T00:00:00.000Z`,
    to: `${year + 1}-01-01T00:00:00.000Z`,
  }
}

function toExternalMatch(row: MatchRow): ExternalMatch {
  const fallbackId = [
    row.competition,
    row.home_team,
    row.away_team,
    row.starts_at,
  ]
    .filter(Boolean)
    .join("-")

  const statusMap: Record<string, string> = {
    FT: "FINISHED",
    UPCOMING: "SCHEDULED",
    NS: "SCHEDULED",
  }
  const status =
    statusMap[row.status] ||
    row.status ||
    "SCHEDULED"

  return {
    external_id: row.external_id || fallbackId,
    sport: row.sport || "Football",
    home_team: canonicalTeamName(row.home_team),
    away_team: canonicalTeamName(row.away_team),
    home_score: row.home_score || 0,
    away_score: row.away_score || 0,
    venue: normalizeDisplayText(
      row.venue || row.competition || ""
    ),
    status,
    starts_at:
      row.starts_at || new Date().toISOString(),
    competition:
      canonicalCompetitionName(
        row.competition,
        row.sport
      ) ||
      "QueensArena",
    source: row.source || "QueensArena",
    region: row.region || "",
    data_status: row.data_status || "verified",
    source_url: row.source_url || null,
    updated_at: row.updated_at || null,
  }
}

function filterByView(
  matches: ExternalMatch[],
  view?: string | null
) {
  const now = Date.now()
  const recentCutoff = now - 120 * 24 * 60 * 60 * 1000
  const upcomingGrace = now - 6 * 60 * 60 * 1000

  if (view === "live") {
    return matches.filter((match) => {
      const startsAt = new Date(match.starts_at).getTime()
      return (
        ["LIVE", "HALFTIME"].includes(match.status) &&
        Number.isFinite(startsAt) &&
        startsAt >= upcomingGrace
      )
    })
  }

  if (view === "recent") {
    return matches.filter((match) => {
      const startsAt = new Date(match.starts_at).getTime()
      return (
        match.status === "FINISHED" &&
        Number.isFinite(startsAt) &&
        startsAt >= recentCutoff &&
        startsAt <= now
      )
    })
  }

  if (view === "upcoming") {
    return matches.filter((match) => {
      const startsAt = new Date(match.starts_at).getTime()
      return (
        match.status === "SCHEDULED" &&
        Number.isFinite(startsAt) &&
        startsAt >= upcomingGrace
      )
    })
  }

  return matches
}

function sortMatches(matches: ExternalMatch[]) {
  const statusRank: Record<string, number> = {
    LIVE: 0,
    HALFTIME: 0,
    SCHEDULED: 1,
    POSTPONED: 2,
    FINISHED: 3,
    CANCELLED: 4,
  }

  return matches.sort((a, b) => {
    const rankA = statusRank[a.status] ?? 5
    const rankB = statusRank[b.status] ?? 5

    if (rankA !== rankB) {
      return rankA - rankB
    }

    const timeA = new Date(a.starts_at).getTime()
    const timeB = new Date(b.starts_at).getTime()

    if (a.status === "FINISHED") {
      return timeB - timeA
    }

    return timeA - timeB
  })
}

function isMissingColumnError(error: unknown) {
  const message =
    error instanceof Error
      ? error.message
      : JSON.stringify(error || "")

  return (
    message.includes("column") ||
    message.includes("schema cache")
  )
}

function applyMatchFilters(
  query: MatchRowsQuery,
  {
    range,
    sport,
    competition,
    season,
  }: {
    range: ReturnType<typeof getSeasonRange>
    sport?: string | null
    competition?: string | null
    season?: string | null
  }
) {
  let filteredQuery: MatchRowsQuery = query

  if (range) {
    filteredQuery = filteredQuery
      .gte("starts_at", range.from)
      .lt("starts_at", range.to)
  } else if (season) {
    filteredQuery = filteredQuery.eq(
      "season",
      season
    )
  }

  if (sport) {
    filteredQuery = filteredQuery.eq(
      "sport",
      sport
    )
  }

  if (competition) {
    const competitionAliases =
      competitionAliasesForFilter(
        competition,
        sport
      )

    filteredQuery =
      competitionAliases.length > 1
        ? filteredQuery.in(
            "competition",
            competitionAliases
          )
        : filteredQuery.eq(
            "competition",
            competition
          )
  }

  return filteredQuery
}

async function fetchMatchRows(
  client: ReturnType<typeof getDataClient>,
  columns: string,
  {
    requested,
    range,
    season,
    sport,
    competition,
  }: {
    requested: number
    range: ReturnType<typeof getSeasonRange>
    season?: string | null
    sport?: string | null
    competition?: string | null
  }
) {
  const pageSize = 1000
  const rows: MatchRow[] = []

  for (
    let offset = 0;
    offset < requested;
    offset += pageSize
  ) {
    const to = Math.min(
      offset + pageSize - 1,
      requested - 1
    )
    let query = client
      .from("matches")
      .select(columns)
      .not("starts_at", "is", null)
      .not("competition", "is", null)
      .not("source", "is", null)
      .order("starts_at", {
        ascending: true,
        nullsFirst: false,
      })
      .range(offset, to) as unknown as MatchRowsQuery

    query = applyMatchFilters(query, {
      range,
      sport,
      competition,
      season,
    })

    const { data, error } = await query

    if (error) {
      return {
        data: null,
        error,
      }
    }

    rows.push(...((data || []) as MatchRow[]))

    if (!data || data.length < pageSize) {
      break
    }
  }

  return {
    data: rows,
    error: null,
  }
}

export async function fetchQueensArenaMatches({
  limit = 100,
  season,
  view,
  sport,
  competition,
}: FetchQueensArenaMatchesOptions = {}) {
  const client = getDataClient()
  const requested = Math.max(limit * 3, limit)

  const range = season
    ? getSeasonRange(season)
    : null

  const response = await fetchMatchRows(
    client,
    "external_id,sport,home_team,away_team,home_score,away_score,venue,status,starts_at,competition,season,source,region,data_status,source_url,updated_at",
    {
      requested,
      range,
      season,
      sport,
      competition,
    }
  )
  let data = response.data as MatchRow[] | null
  const error = response.error

  if (error) {
    if (!isMissingColumnError(error)) {
      throw error
    }

    const fallback = await fetchMatchRows(
      client,
        "external_id,sport,home_team,away_team,home_score,away_score,venue,status,starts_at,competition,source,region"
      ,
      {
        requested,
        range,
        season,
        sport,
        competition,
      }
    )
    if (fallback.error) throw fallback.error
    data = fallback.data as MatchRow[] | null
  }

  return sortMatches(
    filterByView(
      (data || []).map((row) =>
        toExternalMatch(row as MatchRow)
      ),
      view
    )
  ).slice(0, limit)
}

export async function fetchQueensArenaCompetitions() {
  const client = getDataClient()
  const { data, error } = await client
    .from("data_sources")
    .select(
      "provider,sport,competition,season,country,region,source_url,coverage_level,reliability,provider_league_id,provider_season_id,enabled,updated_at"
    )
    .eq("enabled", true)
    .order("competition", {
      ascending: true,
    })

  if (error) {
    if (!isMissingColumnError(error)) {
      throw error
    }

    const fallback = await client
      .from("data_sources")
      .select(
        "provider,sport,competition,season,provider_league_id,provider_season_id,enabled,updated_at"
      )
      .eq("enabled", true)
      .order("competition", {
        ascending: true,
      })

    if (fallback.error) throw fallback.error
    return fallback.data || []
  }

  return data || []
}

export async function fetchQueensArenaOfficialSources() {
  const client = getDataClient()
  const { data, error } = await client
    .from("official_sources")
    .select(
      "slug,name,sport,country,region,competition,season,source_url,source_type,ingestion_method,rights_status,priority,status,notes,updated_at"
    )
    .order("priority", {
      ascending: false,
    })
    .order("name", {
      ascending: true,
    })

  if (error) {
    if (isMissingColumnError(error)) {
      const fallback = await client
        .from("data_sources")
        .select(
          "provider,sport,competition,season,country,region,source_url,coverage_level,reliability,provider_league_id,notes,updated_at"
        )
        .eq("provider", "QueensArena Official")
        .order("competition", {
          ascending: true,
        })

      if (fallback.error) {
        return []
      }

      return (fallback.data || []).map(
        (source, index) => ({
          slug:
            source.provider_league_id ||
            `queensarena-official-${index}`,
          name: source.provider,
          sport: normalizeDisplayText(source.sport),
          country: source.country
            ? normalizeDisplayText(source.country)
            : null,
          region: source.region
            ? normalizeDisplayText(source.region)
            : null,
          competition: canonicalCompetitionName(
            source.competition,
            source.sport
          ),
          season: source.season,
          source_url: source.source_url || "#",
          source_type: "official_site",
          ingestion_method:
            source.coverage_level ||
            "manual_review",
          rights_status: "needs_review",
          priority: 50,
          status: "watchlist",
          notes: source.notes
            ? normalizeDisplayText(source.notes)
            : null,
          updated_at: source.updated_at || null,
        })
      )
    }

    throw error
  }

  return (data || []).map((source) => ({
    ...source,
    sport: normalizeDisplayText(source.sport),
    country: source.country
      ? normalizeDisplayText(source.country)
      : null,
    region: source.region
      ? normalizeDisplayText(source.region)
      : null,
    competition: canonicalCompetitionName(
      source.competition,
      source.sport
    ),
    notes: source.notes
      ? normalizeDisplayText(source.notes)
      : null,
  })) as QueensArenaOfficialSource[]
}

export async function fetchQueensArenaTeams({
  limit = 100,
  sport,
}: {
  limit?: number
  sport?: string | null
} = {}) {
  const client = getDataClient()
  let query = client
    .from("teams")
    .select(
      "id,name,sport,country,region,logo_url,provider,external_id,data_status,source_url,updated_at"
    )
    .order("name", {
      ascending: true,
    })
    .limit(limit)

  if (sport) {
    query = query.eq("sport", sport)
  }

  const response = await query
  let data = response.data as
    | Array<{
        country?: string | null
        region?: string | null
      }>
    | null
  const error = response.error

  if (error) {
    if (!isMissingColumnError(error)) {
      throw error
    }

    let fallbackQuery = client
      .from("teams")
      .select("id,name,sport")
      .order("name", {
        ascending: true,
      })
      .limit(limit)

    if (sport) {
      fallbackQuery = fallbackQuery.eq("sport", sport)
    }

    const fallback = await fallbackQuery
    if (fallback.error) throw fallback.error
    data = fallback.data as
      | Array<{
          country?: string | null
          region?: string | null
        }>
      | null
  }

  const byTeam = new Map<string, Record<string, unknown>>()

  for (const team of data || []) {
    const rawName =
      "name" in team ? String(team.name || "") : ""
    const sport =
      "sport" in team ? String(team.sport || "") : ""
    const name = normalizeDisplayText(
      canonicalTeamName(rawName)
    )
    const country =
      team.country ||
      inferCountryFromTeam(rawName, sport) ||
      team.region ||
      null
    const key = `${sport.toLowerCase()}:${name.toLowerCase()}`
    const existing = byTeam.get(key)

    byTeam.set(key, {
      ...team,
      ...existing,
      name,
      country:
        (existing?.country as string | null | undefined) ||
        country,
      region:
        (existing?.region as string | null | undefined) ||
        team.region ||
        country,
      logo_url:
        (existing?.logo_url as string | null | undefined) ||
        ("logo_url" in team
          ? team.logo_url
          : null),
    })
  }

  return [...byTeam.values()].sort((a, b) =>
    String(a.name || "").localeCompare(
      String(b.name || "")
    )
  )
}

export async function fetchQueensArenaPlayers({
  limit = 100,
  sport,
}: {
  limit?: number
  sport?: string | null
} = {}) {
  const client = getDataClient()

  const rows: unknown[] = []
  const pageSize = 1000

  for (
    let offset = 0;
    offset < limit;
    offset += pageSize
  ) {
    const to = Math.min(
      offset + pageSize - 1,
      limit - 1
    )

    let query = client
      .from("players")
      .select(
        "id,name,sport,position,nationality,age,goals,assists,appearances,image_url,season,provider,external_id,data_status,source_url,updated_at,teams(name)"
      )
      .order("name", {
        ascending: true,
      })
      .range(offset, to)

    if (sport) {
      query = query.eq("sport", sport)
    }

    const response = await query
    let data = response.data as unknown[] | null
    const error = response.error

    if (error) {
      if (!isMissingColumnError(error)) {
        throw error
      }

      let fallbackQuery = client
        .from("players")
        .select(
          "id,name,sport,position,nationality,age,goals,assists,appearances,teams(name)"
        )
        .order("name", {
          ascending: true,
        })
        .range(offset, to)

      if (sport) {
        fallbackQuery = fallbackQuery.eq("sport", sport)
      }

      const fallback = await fallbackQuery
      if (fallback.error) throw fallback.error
      data = fallback.data as unknown[] | null
    }

    if (!data || data.length === 0) break
    rows.push(...data)
    if (data.length < pageSize) break
  }

  return rows.map((player) => {
    if (
      player &&
      typeof player === "object" &&
      "name" in player
    ) {
      return {
        ...player,
        name: normalizeDisplayText(
          String(player.name || "")
        ),
      }
    }

    return player
  })
}

export async function fetchQueensArenaStandings({
  limit = 500,
  league,
}: {
  limit?: number
  league?: string | null
} = {}) {
  const client = getDataClient()
  const rows: QueensArenaStanding[] = []
  const pageSize = 1000
  const leagueSport =
    canonicalLeagueName(league || "").startsWith(
      "Liga BPI"
    )
      ? "Football"
      : canonicalLeagueName(
            league || ""
          ).startsWith(
            "Campeonato Nacional 1.ª Divisão Feminina de Andebol"
          )
        ? "Handball"
        : null

  for (
    let offset = 0;
    offset < limit;
    offset += pageSize
  ) {
    const to = Math.min(
      offset + pageSize - 1,
      limit - 1
    )
    let query = client
      .from("standings")
      .select(
        "league,team,played,won,draw,lost,goals_for,goals_against,points,position"
      )
      .order("league", {
        ascending: true,
      })
      .order("position", {
        ascending: true,
      })
      .range(offset, to)

    if (league) {
      const aliases = leagueAliasesForFilter(league)

      query =
        aliases.length > 1
          ? query.in("league", aliases)
          : query.eq("league", league)
    }

    const { data, error } = await query

    if (error) {
      if (isMissingColumnError(error)) {
        return []
      }

      throw error
    }

    rows.push(
      ...((data || []) as QueensArenaStanding[]).map(
        (row) => ({
          ...row,
          league: canonicalLeagueName(
            row.league,
            leagueSport
          ),
          team: canonicalTeamName(row.team),
        })
      )
    )

    if (!data || data.length < pageSize) {
      break
    }
  }

  return rows
}

export async function fetchQueensArenaTeamStats({
  limit = 1000,
  sport,
  competition,
  season,
}: {
  limit?: number
  sport?: string | null
  competition?: string | null
  season?: string | null
} = {}) {
  const client = getDataClient()
  const pageSize = 1000
  const rows: QueensArenaTeamSeasonStat[] = []

  for (
    let offset = 0;
    offset < limit;
    offset += pageSize
  ) {
    const to = Math.min(
      offset + pageSize - 1,
      limit - 1
    )
    let query = client
      .from("team_season_stats")
      .select(
        "team_id,season,competition,sport,played,won,draw,lost,goals_for,goals_against,points,source,updated_at,teams(name)"
      )
      .order("competition", {
        ascending: true,
      })
      .order("points", {
        ascending: false,
      })
      .range(offset, to)

    if (sport) {
      query = query.eq("sport", sport)
    }

    if (competition) {
      const aliases = competitionAliasesForFilter(
        competition,
        sport
      )

      query =
        aliases.length > 1
          ? query.in("competition", aliases)
          : query.eq("competition", competition)
    }

    if (season) {
      query = query.eq("season", season)
    }

    const { data, error } = await query

    if (error) {
      if (isMissingColumnError(error)) {
        return []
      }

      throw error
    }

    rows.push(
      ...((data || []).map((row) => {
        const team = Array.isArray(row.teams)
          ? row.teams[0]
          : row.teams

        return {
          ...row,
          competition: canonicalCompetitionName(
            row.competition,
            row.sport
          ),
          team_name:
        team &&
        typeof team === "object" &&
        "name" in team
          ? canonicalTeamName(String(team.name || ""))
          : null,
        }
      }) as QueensArenaTeamSeasonStat[])
    )

    if (!data || data.length < pageSize) {
      break
    }
  }

  return rows
}

export async function fetchQueensArenaPlayerStats({
  limit = 1000,
  sport,
  competition,
  season,
}: {
  limit?: number
  sport?: string | null
  competition?: string | null
  season?: string | null
} = {}) {
  const client = getDataClient()
  const pageSize = 1000
  const rows: QueensArenaPlayerSeasonStat[] = []

  for (
    let offset = 0;
    offset < limit;
    offset += pageSize
  ) {
    const to = Math.min(
      offset + pageSize - 1,
      limit - 1
    )
    let query = client
      .from("player_season_stats")
      .select(
        "player_id,team_id,season,competition,sport,appearances,starts,minutes,goals,assists,yellow_cards,red_cards,saves,source,updated_at,players(name),teams(name)"
      )
      .order("competition", {
        ascending: true,
      })
      .order("goals", {
        ascending: false,
      })
      .range(offset, to)

    if (sport) {
      query = query.eq("sport", sport)
    }

    if (competition) {
      const aliases = competitionAliasesForFilter(
        competition,
        sport
      )

      query =
        aliases.length > 1
          ? query.in("competition", aliases)
          : query.eq("competition", competition)
    }

    if (season) {
      query = query.eq("season", season)
    }

    const { data, error } = await query

    if (error) {
      if (isMissingColumnError(error)) {
        return []
      }

      throw error
    }

    rows.push(
      ...((data || []).map((row) => {
        const player = Array.isArray(row.players)
          ? row.players[0]
          : row.players
        const team = Array.isArray(row.teams)
          ? row.teams[0]
          : row.teams

        return {
          ...row,
          competition: canonicalCompetitionName(
            row.competition,
            row.sport
          ),
          player_name:
            player &&
            typeof player === "object" &&
            "name" in player
              ? normalizeDisplayText(
                  String(player.name || "")
                )
              : null,
          team_name:
            team &&
            typeof team === "object" &&
            "name" in team
              ? canonicalTeamName(
                  String(team.name || "")
                )
              : null,
        }
      }) as QueensArenaPlayerSeasonStat[])
    )

    if (!data || data.length < pageSize) {
      break
    }
  }

  return rows
}

