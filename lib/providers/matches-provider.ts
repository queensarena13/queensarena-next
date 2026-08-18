import { apiSafeFetch } from "@/lib/api-safe-fetch"
import { fetchApiSportsMatches } from "@/lib/providers/api-sports-provider"
import { fetchStatscoreMatches } from "@/lib/providers/statscore-provider"
import { getTheSportsDbUrl } from "@/lib/providers/thesportsdb"
import { getTheSportsDbLeagues } from "@/lib/sports-config"

export interface ExternalMatch {
  external_id: string
  sport: string
  home_team: string
  away_team: string
  home_score: number
  away_score: number
  venue: string
  status: string
  starts_at: string
  competition: string
  source: string
  region: string
  data_status?: string | null
  source_url?: string | null
  updated_at?: string | null
}

interface TrackedLeague {
  id: string
  name: string
  sport: string
  region: string
}

interface TheSportsDbEvent {
  idEvent: string
  strLeague?: string
  strHomeTeam?: string
  strAwayTeam?: string
  intHomeScore?: string | null
  intAwayScore?: string | null
  strStatus?: string | null
  strVenue?: string | null
  strTimestamp?: string | null
  dateEvent?: string | null
  strTime?: string | null
}

interface TheSportsDbEventsResponse {
  events?: TheSportsDbEvent[] | null
}

interface FetchMatchesOptions {
  season?: string | null
}

function isCurrentSeason(season?: string | null) {
  if (!season) return false

  const year = Number(season)

  return (
    Number.isFinite(year) &&
    year >= new Date().getFullYear()
  )
}

function normalizeStatus(status?: string | null) {
  const normalized =
    status?.toLowerCase() || ""

  if (
    normalized.includes("live") ||
    normalized.includes("in play")
  ) {
    return "LIVE"
  }

  if (normalized.includes("half")) {
    return "HALFTIME"
  }

  if (
    normalized.includes("finish") ||
    normalized.includes("ended") ||
    normalized === "ft"
  ) {
    return "FINISHED"
  }

  if (normalized.includes("cancel")) {
    return "CANCELLED"
  }

  if (normalized.includes("postpon")) {
    return "POSTPONED"
  }

  return "SCHEDULED"
}

function getStartsAt(event: TheSportsDbEvent) {
  if (event.strTimestamp) {
    return event.strTimestamp
  }

  const date = event.dateEvent || ""
  const time = event.strTime || "00:00:00"

  return `${date}T${time}`
}

function normalizeCompetitionName(
  value: string
) {
  return value
    .replaceAll("Womens", "Women's")
    .replace(
      "American NWSL",
      "NWSL"
    )
}

function hasScore(event: TheSportsDbEvent) {
  return (
    event.intHomeScore !== null &&
    event.intHomeScore !== undefined &&
    event.intAwayScore !== null &&
    event.intAwayScore !== undefined
  )
}

function toExternalMatch(
  event: TheSportsDbEvent,
  league: TrackedLeague
): ExternalMatch {
  const competition =
    normalizeCompetitionName(
      event.strLeague || league.name
    )
  const startsAt = getStartsAt(event)
  const hasStatusText = Boolean(
    event.strStatus?.trim()
  )
  const status = normalizeStatus(
    event.strStatus
  )
  const startedAtMs =
    new Date(startsAt).getTime()
  const nowMs = Date.now()
  const elapsedMs = nowMs - startedAtMs
  const liveWindowMs =
    league.sport === "Handball"
      ? 90 * 60 * 1000
      : 150 * 60 * 1000
  const likelyLive =
    status === "SCHEDULED" &&
    elapsedMs >= 0 &&
    elapsedMs <= liveWindowMs
  const likelyFinished =
    status === "SCHEDULED" &&
    elapsedMs > liveWindowMs &&
    (!hasStatusText || hasScore(event))
  const resolvedStatus = likelyLive
    ? "LIVE"
    : likelyFinished
    ? "FINISHED"
    : status

  return {
    external_id: event.idEvent,
    sport: league.sport,
    home_team:
      event.strHomeTeam || "Unknown",
    away_team:
      event.strAwayTeam || "Unknown",
    home_score: Number(
      event.intHomeScore || 0
    ),
    away_score: Number(
      event.intAwayScore || 0
    ),
    venue: event.strVenue || competition,
    status: resolvedStatus,
    starts_at: startsAt,
    competition,
    source: "TheSportsDB",
    region: league.region,
  }
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

function uniqueMatches(matches: ExternalMatch[]) {
  const byId = new Map<string, ExternalMatch>()

  for (const match of matches) {
    byId.set(match.external_id, match)
  }

  return [...byId.values()]
}

async function fetchLeagueEvents(
  league: TrackedLeague,
  type: "next" | "past"
) {
  const endpoint =
    type === "next"
      ? "eventsnextleague.php"
      : "eventspastleague.php"

  try {
    const data =
      (await apiSafeFetch(
        getTheSportsDbUrl(
          `${endpoint}?id=${league.id}`
        )
      )) as TheSportsDbEventsResponse

    return data.events || []
  } catch (error) {
    console.warn(
      "TheSportsDB unavailable.",
      error
    )

    return []
  }
}

function getSeasonCandidates(
  season: string
) {
  const year = Number(season)

  if (!Number.isFinite(year)) {
    return [season]
  }

  return [
    season,
    `${year}-${year + 1}`,
    `${year - 1}-${year}`,
  ]
}

async function fetchLeagueSeasonEvents(
  league: TrackedLeague,
  season: string
) {
  for (const candidate of getSeasonCandidates(
    season
  )) {
    try {
      const data =
        (await apiSafeFetch(
          getTheSportsDbUrl(
            `eventsseason.php?id=${league.id}&s=${candidate}`
          )
        )) as TheSportsDbEventsResponse

      if (data.events?.length) {
        return data.events
      }
    } catch (error) {
      console.warn(
        "TheSportsDB season unavailable.",
        error
      )
    }
  }

  return []
}

async function fetchSeasonMatches(
  leagues: TrackedLeague[],
  season: string
) {
  const eventGroups = await Promise.all(
    leagues.map((league) =>
      fetchLeagueSeasonEvents(
        league,
        season
      ).then((events) =>
        events.map((event) =>
          toExternalMatch(event, league)
        )
      )
    )
  )

  return eventGroups.flat()
}

async function fetchNextAndPastMatches(
  leagues: TrackedLeague[]
) {
  const eventGroups = await Promise.all(
    leagues.flatMap((league) => [
      fetchLeagueEvents(league, "next").then(
        (events) =>
          events.map((event) =>
            toExternalMatch(event, league)
          )
      ),
      fetchLeagueEvents(league, "past").then(
        (events) =>
          events.map((event) =>
            toExternalMatch(event, league)
          )
      ),
    ])
  )

  return eventGroups.flat()
}

export async function fetchMatches(
  options: FetchMatchesOptions = {}
): Promise<ExternalMatch[]> {
  const leagues =
    getTheSportsDbLeagues()
  const statscoreMatches =
    await fetchStatscoreMatches()

  if (options.season) {
    const seasonMatches =
      await fetchSeasonMatches(
        leagues,
        options.season
      )
    const liveMatches = isCurrentSeason(
      options.season
    )
      ? await fetchNextAndPastMatches(
          leagues
        )
      : []

    return sortMatches(
      uniqueMatches([
        ...statscoreMatches,
        ...seasonMatches,
        ...liveMatches,
      ])
    )
  }

  const currentSeason = String(
    new Date().getFullYear()
  )
  const [liveMatches, seasonMatches] =
    await Promise.all([
      fetchNextAndPastMatches(leagues),
      fetchSeasonMatches(
        leagues,
        currentSeason
      ),
    ])
  const apiSportsMatches =
    await fetchApiSportsMatches()

  return sortMatches(
    uniqueMatches([
      ...statscoreMatches,
      ...liveMatches,
      ...seasonMatches,
      ...apiSportsMatches,
    ])
  )
}
