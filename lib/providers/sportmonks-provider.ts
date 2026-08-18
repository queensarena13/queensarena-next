import { apiSafeFetch } from "@/lib/api-safe-fetch"

const SPORTMONKS_BASE_URL =
  "https://api.sportmonks.com/v3/football"

interface SportmonksResponse<T> {
  data?: T[]
  pagination?: {
    current_page?: number
    has_more?: boolean
  }
}

export interface SportmonksTeam {
  id: number
  name: string
  image_path?: string | null
  country_id?: number | null
}

export interface SportmonksPlayer {
  id: number
  display_name?: string
  name?: string
  image_path?: string | null
  position_id?: number | null
  nationality_id?: number | null
  player?: {
    id?: number
    display_name?: string
    name?: string
    image_path?: string | null
    position_id?: number | null
    nationality_id?: number | null
  }
  details?: {
    type_id?: number
    value?: {
      total?: number
    }
  }[]
}

export interface SportmonksLeague {
  id: number
  name: string
  type?: string | null
  sub_type?: string | null
  image_path?: string | null
  country?: {
    id?: number
    name?: string
  } | null
  currentseason?: {
    id?: number
    name?: string
  } | null
  currentSeason?: {
    id?: number
    name?: string
  } | null
  seasons?: {
    id: number
    name: string
    is_current?: boolean
    starting_at?: string | null
    ending_at?: string | null
  }[]
}

function getToken() {
  const token =
    process.env.SPORTMONKS_API_TOKEN

  if (!token) {
    throw new Error(
      "Missing SPORTMONKS_API_TOKEN."
    )
  }

  return token
}

export async function fetchSportmonksTeams(
  seasonId: string
) {
  const data = (await apiSafeFetch(
    `${SPORTMONKS_BASE_URL}/teams/seasons/${seasonId}`,
    {
      headers: {
        Authorization: getToken(),
        Accept: "application/json",
      },
    }
  )) as SportmonksResponse<SportmonksTeam>

  return data.data || []
}

export async function fetchSportmonksLeagues(
  search?: string
) {
  const leagues: SportmonksLeague[] = []
  let page = 1
  let hasMore = true

  while (hasMore && page <= 8) {
    const params = new URLSearchParams({
      include: "country;currentSeason;seasons",
      per_page: "50",
      page: String(page),
    })

    const data = (await apiSafeFetch(
      `${SPORTMONKS_BASE_URL}/leagues?${params.toString()}`,
      {
        headers: {
          Authorization: getToken(),
          Accept: "application/json",
        },
      }
    )) as SportmonksResponse<SportmonksLeague>

    leagues.push(...(data.data || []))
    hasMore = Boolean(
      data.pagination?.has_more
    )
    page += 1
  }

  const normalizedSearch =
    search?.trim().toLowerCase()

  if (!normalizedSearch) {
    return leagues
  }

  return leagues.filter((league) =>
    [
      league.name,
      league.country?.name,
      league.type,
      league.sub_type,
    ]
      .filter(Boolean)
      .some((value) =>
        String(value)
          .toLowerCase()
          .includes(normalizedSearch)
      )
  )
}

export async function fetchSportmonksFixtures(
  seasonId: string
) {
  const data = (await apiSafeFetch(
    `${SPORTMONKS_BASE_URL}/fixtures/seasons/${seasonId}`,
    {
      headers: {
        Authorization: getToken(),
        Accept: "application/json",
      },
    }
  )) as SportmonksResponse<Record<string, unknown>>

  return data.data || []
}

export async function fetchSportmonksSquad(
  teamId: string
) {
  const data = (await apiSafeFetch(
    `${SPORTMONKS_BASE_URL}/squads/teams/${teamId}?include=player`,
    {
      headers: {
        Authorization: getToken(),
        Accept: "application/json",
      },
    }
  )) as SportmonksResponse<SportmonksPlayer>

  return data.data || []
}
