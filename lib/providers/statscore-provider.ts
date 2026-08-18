import type { ExternalMatch } from "@/lib/providers/matches-provider"

type StatscoreCompetition = {
  id: string
  name: string
  sport: string
  region: string
  season?: string
}

type StatscoreTeam = {
  id?: string | number
  name?: string
  short_name?: string
}

type StatscoreStatus = {
  name?: string
  type?: string
  code?: string | number
}

type StatscoreEvent = {
  id?: string | number
  event_id?: string | number
  uuid?: string
  name?: string
  start_date?: string
  start_time?: string
  date?: string
  time?: string
  start_at?: string
  start_time_utc?: string
  venue?: string | { name?: string }
  status?: string | StatscoreStatus
  home_team?: StatscoreTeam
  away_team?: StatscoreTeam
  participants?: StatscoreTeam[]
  home_score?: number | string
  away_score?: number | string
  score?: {
    home?: number | string
    away?: number | string
  }
  result?: {
    home?: number | string
    away?: number | string
  }
}

type StatscoreEnvelope =
  | {
      data?: unknown
      api?: {
        data?: unknown
      }
    }
  | unknown[]

const DEFAULT_BASE_URL =
  "https://api.statscore.com"

function getStatscoreToken() {
  return process.env.STATSCORE_API_KEY
}

function getStatscoreBaseUrl() {
  return (
    process.env.STATSCORE_BASE_URL ||
    DEFAULT_BASE_URL
  ).replace(/\/$/, "")
}

function getStatscoreCompetitions() {
  const raw =
    process.env.STATSCORE_COMPETITIONS_JSON

  if (!raw) {
    return []
  }

  try {
    const parsed = JSON.parse(raw) as unknown

    if (!Array.isArray(parsed)) {
      console.warn(
        "STATSCORE_COMPETITIONS_JSON must be an array."
      )
      return []
    }

    return parsed.filter(
      (
        item
      ): item is StatscoreCompetition => {
        const candidate =
          item as Partial<StatscoreCompetition>

        return Boolean(
          candidate.id &&
            candidate.name &&
            candidate.sport &&
            candidate.region
        )
      }
    )
  } catch (error) {
    console.warn(
      "Invalid STATSCORE_COMPETITIONS_JSON.",
      error
    )
    return []
  }
}

function unwrapEvents(
  payload: StatscoreEnvelope
): StatscoreEvent[] {
  if (Array.isArray(payload)) {
    return payload as StatscoreEvent[]
  }

  const envelope = payload as {
    data?: unknown
    api?: {
      data?: unknown
    }
  }
  const data =
    envelope.data || envelope.api?.data

  if (Array.isArray(data)) {
    return data as StatscoreEvent[]
  }

  if (
    data &&
    typeof data === "object" &&
    "events" in data &&
    Array.isArray(
      (data as { events?: unknown }).events
    )
  ) {
    return (data as { events: StatscoreEvent[] })
      .events
  }

  if (
    data &&
    typeof data === "object" &&
    "matches" in data &&
    Array.isArray(
      (data as { matches?: unknown }).matches
    )
  ) {
    return (data as { matches: StatscoreEvent[] })
      .matches
  }

  return []
}

function normalizeStatus(
  status?: string | StatscoreStatus
) {
  const value =
    typeof status === "string"
      ? status
      : [
          status?.name,
          status?.type,
          status?.code,
        ]
          .filter(Boolean)
          .join(" ")

  const normalized = value.toLowerCase()

  if (
    normalized.includes("live") ||
    normalized.includes("inprogress") ||
    normalized.includes("in progress")
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

  if (normalized.includes("postpon")) {
    return "POSTPONED"
  }

  if (normalized.includes("cancel")) {
    return "CANCELLED"
  }

  return "SCHEDULED"
}

function getStartsAt(event: StatscoreEvent) {
  if (event.start_time_utc) {
    return event.start_time_utc
  }

  if (event.start_at) {
    return event.start_at
  }

  if (event.start_date) {
    return event.start_time
      ? `${event.start_date}T${event.start_time}`
      : event.start_date
  }

  if (event.date) {
    return event.time
      ? `${event.date}T${event.time}`
      : event.date
  }

  return ""
}

function getVenue(event: StatscoreEvent) {
  if (typeof event.venue === "string") {
    return event.venue
  }

  return event.venue?.name || ""
}

function getTeamName(
  team?: StatscoreTeam
) {
  return team?.name || team?.short_name || ""
}

function getHomeTeam(event: StatscoreEvent) {
  return (
    getTeamName(event.home_team) ||
    getTeamName(event.participants?.[0])
  )
}

function getAwayTeam(event: StatscoreEvent) {
  return (
    getTeamName(event.away_team) ||
    getTeamName(event.participants?.[1])
  )
}

function toScore(value: unknown) {
  const score = Number(value)

  return Number.isFinite(score) ? score : 0
}

function toExternalMatch(
  event: StatscoreEvent,
  competition: StatscoreCompetition
): ExternalMatch | null {
  const id =
    event.id || event.event_id || event.uuid
  const home = getHomeTeam(event)
  const away = getAwayTeam(event)
  const startsAt = getStartsAt(event)

  if (!id || !home || !away || !startsAt) {
    return null
  }

  return {
    external_id: `statscore-${id}`,
    sport: competition.sport,
    home_team: home,
    away_team: away,
    home_score: toScore(
      event.home_score ??
        event.score?.home ??
        event.result?.home
    ),
    away_score: toScore(
      event.away_score ??
        event.score?.away ??
        event.result?.away
    ),
    venue: getVenue(event) || competition.name,
    status: normalizeStatus(event.status),
    starts_at: startsAt,
    competition: competition.name,
    source: "STATSCORE",
    region: competition.region,
  }
}

async function fetchStatscoreCompetitionMatches(
  competition: StatscoreCompetition
) {
  const token = getStatscoreToken()

  if (!token) {
    return []
  }

  const baseUrl = getStatscoreBaseUrl()
  const pathTemplate =
    process.env.STATSCORE_MATCHES_PATH ||
    "/matches"
  const hasCompetitionPathParam =
    pathTemplate.includes("{competitionId}")
  const path = pathTemplate.replace(
    "{competitionId}",
    encodeURIComponent(competition.id)
  )
  const url = new URL(`${baseUrl}${path}`)

  if (!hasCompetitionPathParam) {
    url.searchParams.set(
      "competition_id",
      competition.id
    )
  }

  if (competition.season) {
    url.searchParams.set(
      "season",
      competition.season
    )
  }

  const authHeader =
    process.env.STATSCORE_AUTH_HEADER ||
    "Authorization"
  const authPrefix =
    process.env.STATSCORE_AUTH_PREFIX ||
    "Bearer"
  const response = await fetch(url, {
    headers: {
      [authHeader]: `${authPrefix} ${token}`,
      Accept: "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(
      `STATSCORE ${competition.name} HTTP ${response.status}`
    )
  }

  const payload =
    (await response.json()) as StatscoreEnvelope

  return unwrapEvents(payload)
    .map((event) =>
      toExternalMatch(event, competition)
    )
    .filter(
      (match): match is ExternalMatch =>
        Boolean(match)
    )
}

export function isStatscoreConfigured() {
  return Boolean(
    getStatscoreToken() &&
      getStatscoreCompetitions().length > 0
  )
}

export async function fetchStatscoreMatches() {
  const competitions =
    getStatscoreCompetitions()

  if (!getStatscoreToken() || competitions.length === 0) {
    return []
  }

  const groups = await Promise.all(
    competitions.map(async (competition) => {
      try {
        return await fetchStatscoreCompetitionMatches(
          competition
        )
      } catch (error) {
        console.warn(
          `STATSCORE fetch failed for ${competition.name}.`,
          error
        )
        return []
      }
    })
  )

  return groups.flat()
}
