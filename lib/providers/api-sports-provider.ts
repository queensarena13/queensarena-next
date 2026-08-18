import type { ExternalMatch } from "@/lib/providers/matches-provider"

const FOOTBALL_BASE_URL =
  "https://v3.football.api-sports.io"
const HANDBALL_BASE_URL =
  "https://v1.handball.api-sports.io"

type ApiSportsLeague = {
  id: string
  name: string
  sport: string
  region: string
  season: string
  baseUrl: string
  endpoint: "fixtures" | "games"
}

const apiSportsLeagues: ApiSportsLeague[] = [
  {
    id: "254",
    name: "NWSL",
    sport: "Football",
    region: "EUA",
    season: "2026",
    baseUrl: FOOTBALL_BASE_URL,
    endpoint: "fixtures",
  },
  {
    id: "1119",
    name: "NWSL - Liga MXF Summer Cup",
    sport: "Football",
    region: "EUA",
    season: "2024",
    baseUrl: FOOTBALL_BASE_URL,
    endpoint: "fixtures",
  },
  {
    id: "132",
    name: "EHF Champions League Women",
    sport: "Handball",
    region: "Europa",
    season: "2025",
    baseUrl: HANDBALL_BASE_URL,
    endpoint: "games",
  },
  {
    id: "132",
    name: "EHF Champions League Women",
    sport: "Handball",
    region: "Europa",
    season: "2024",
    baseUrl: HANDBALL_BASE_URL,
    endpoint: "games",
  },
  {
    id: "132",
    name: "EHF Champions League Women",
    sport: "Handball",
    region: "Europa",
    season: "2023",
    baseUrl: HANDBALL_BASE_URL,
    endpoint: "games",
  },
]

type FootballFixture = {
  fixture?: {
    id?: number
    date?: string
    venue?: {
      name?: string | null
      city?: string | null
    } | null
    status?: {
      short?: string | null
      long?: string | null
    } | null
  }
  league?: {
    name?: string | null
    country?: string | null
  }
  teams?: {
    home?: {
      name?: string | null
    } | null
    away?: {
      name?: string | null
    } | null
  }
  goals?: {
    home?: number | null
    away?: number | null
  }
}

type HandballGame = {
  id?: number
  date?: string
  status?: {
    short?: string | null
    long?: string | null
  } | null
  country?: {
    name?: string | null
  } | null
  league?: {
    name?: string | null
  } | null
  teams?: {
    home?: {
      name?: string | null
    } | null
    away?: {
      name?: string | null
    } | null
  }
  scores?: {
    home?: number | null
    away?: number | null
  }
}

type ApiSportsResponse<T> = {
  errors?: unknown
  response?: T[]
}

function getApiSportsKey() {
  return process.env.API_SPORTS_KEY
}

function normalizeStatus(
  short?: string | null,
  long?: string | null
) {
  const value = `${short || ""} ${long || ""}`.toLowerCase()

  if (
    ["1h", "2h", "live"].some((status) =>
      value.includes(status)
    )
  ) {
    return "LIVE"
  }

  if (value.includes("ht")) {
    return "HALFTIME"
  }

  if (
    value.includes("ft") ||
    value.includes("finish")
  ) {
    return "FINISHED"
  }

  if (value.includes("postpon")) {
    return "POSTPONED"
  }

  if (value.includes("cancel")) {
    return "CANCELLED"
  }

  return "SCHEDULED"
}

function venueName(
  venue?: NonNullable<
    FootballFixture["fixture"]
  >["venue"]
) {
  return [venue?.name, venue?.city]
    .filter(Boolean)
    .join(", ")
}

async function fetchApiSports<T>(
  league: ApiSportsLeague
) {
  const key = getApiSportsKey()

  if (!key) {
    return []
  }

  const url = new URL(
    `${league.baseUrl}/${league.endpoint}`
  )
  url.searchParams.set("league", league.id)
  url.searchParams.set("season", league.season)

  const response = await fetch(url, {
    headers: {
      "x-apisports-key": key,
    },
  })
  const data =
    (await response.json()) as ApiSportsResponse<T>

  if (!response.ok) {
    throw new Error(
      `API-SPORTS ${league.name} HTTP ${response.status}`
    )
  }

  if (
    data.errors &&
    Object.keys(data.errors).length > 0
  ) {
    console.warn(
      `API-SPORTS unavailable for ${league.name}.`,
      data.errors
    )
    return []
  }

  return data.response || []
}

function footballToMatch(
  fixture: FootballFixture,
  league: ApiSportsLeague
): ExternalMatch | null {
  const id = fixture.fixture?.id
  const home = fixture.teams?.home?.name
  const away = fixture.teams?.away?.name
  const startsAt = fixture.fixture?.date

  if (!id || !home || !away || !startsAt) {
    return null
  }

  return {
    external_id: `api-sports-football-${id}`,
    sport: league.sport,
    home_team: home,
    away_team: away,
    home_score: fixture.goals?.home ?? 0,
    away_score: fixture.goals?.away ?? 0,
    venue:
      venueName(fixture.fixture?.venue) ||
      fixture.league?.name ||
      league.name,
    status: normalizeStatus(
      fixture.fixture?.status?.short,
      fixture.fixture?.status?.long
    ),
    starts_at: startsAt,
    competition:
      fixture.league?.name || league.name,
    source: "API-SPORTS",
    region:
      fixture.league?.country ||
      league.region,
  }
}

function handballToMatch(
  game: HandballGame,
  league: ApiSportsLeague
): ExternalMatch | null {
  const home = game.teams?.home?.name
  const away = game.teams?.away?.name

  if (!game.id || !home || !away || !game.date) {
    return null
  }

  return {
    external_id: `api-sports-handball-${game.id}`,
    sport: league.sport,
    home_team: home,
    away_team: away,
    home_score: game.scores?.home ?? 0,
    away_score: game.scores?.away ?? 0,
    venue: game.league?.name || league.name,
    status: normalizeStatus(
      game.status?.short,
      game.status?.long
    ),
    starts_at: game.date,
    competition: game.league?.name || league.name,
    source: "API-SPORTS",
    region: game.country?.name || league.region,
  }
}

export async function fetchApiSportsMatches() {
  const matches: ExternalMatch[] = []

  for (const league of apiSportsLeagues) {
    try {
      if (league.endpoint === "fixtures") {
        const fixtures =
          await fetchApiSports<FootballFixture>(league)

        matches.push(
          ...fixtures
            .map((fixture) =>
              footballToMatch(fixture, league)
            )
            .filter(
              (match): match is ExternalMatch =>
                Boolean(match)
            )
        )
      } else {
        const games =
          await fetchApiSports<HandballGame>(league)

        matches.push(
          ...games
            .map((game) =>
              handballToMatch(game, league)
            )
            .filter(
              (match): match is ExternalMatch =>
                Boolean(match)
            )
        )
      }
    } catch (error) {
      console.warn(
        `API-SPORTS fetch failed for ${league.name}.`,
        error
      )
    }
  }

  return matches
}
