const HIGHLIGHTLY_BASE_URL =
  "https://soccer.highlightly.net"

function getHighlightlyKey() {
  const apiKey = process.env.HIGHLIGHTLY_API_KEY

  if (!apiKey) {
    throw new Error(
      "Missing HIGHLIGHTLY_API_KEY."
    )
  }

  return apiKey
}

async function fetchHighlightly<T>(
  path: string,
  params: Record<string, string | number> = {}
) {
  const query = new URLSearchParams()

  for (const [key, value] of Object.entries(
    params
  )) {
    query.set(key, String(value))
  }

  const response = await fetch(
    `${HIGHLIGHTLY_BASE_URL}${path}?${query.toString()}`,
    {
      headers: {
        "x-rapidapi-key": getHighlightlyKey(),
        "x-rapidapi-host":
          "football-highlights-api.p.rapidapi.com",
      },
      cache: "no-store",
    }
  )

  if (!response.ok) {
    throw new Error(
      `Highlightly HTTP ${response.status}`
    )
  }

  return (await response.json()) as T
}

interface HighlightlyListResponse<T> {
  data?: T[]
}

export interface HighlightlyLeague {
  id: number
  name: string
  logo?: string
  country?: {
    code?: string
    name?: string
    logo?: string
  }
  seasons?: {
    season: number
  }[]
}

export interface HighlightlyTeam {
  id: number
  name: string
  logo?: string
  country?: {
    code?: string
    name?: string
    logo?: string
  }
}

export async function searchHighlightlyLeagues(
  leagueName: string
) {
  const response =
    await fetchHighlightly<
      HighlightlyListResponse<HighlightlyLeague>
    >("/leagues", {
      leagueName,
      limit: 10,
    })

  return response.data || []
}

export async function searchHighlightlyTeams(
  name: string
) {
  const response =
    await fetchHighlightly<
      HighlightlyListResponse<HighlightlyTeam>
    >("/teams", {
      name,
      limit: 10,
    })

  return response.data || []
}

export async function probeHighlightlyCoverage() {
  const leagueQueries = [
    "Liga BPI",
    "NWSL",
    "Women",
    "UEFA Women",
    "Women's Champions League",
    "Futsal",
    "Primeira Liga",
  ]
  const teamQueries = [
    "Benfica",
    "Sporting",
    "Portugal Women",
  ]

  const [leagues, teams] = await Promise.all([
    Promise.all(
      leagueQueries.map(async (query) => ({
        query,
        results:
          await searchHighlightlyLeagues(query),
      }))
    ),
    Promise.all(
      teamQueries.map(async (query) => ({
        query,
        results: await searchHighlightlyTeams(query),
      }))
    ),
  ])

  return {
    generatedAt: new Date().toISOString(),
    provider: "Highlightly",
    leagues,
    teams,
  }
}
