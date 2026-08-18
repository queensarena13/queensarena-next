import { NextRequest, NextResponse } from "next/server"
import { getErrorMessage } from "@/lib/errors"
import { fetchSportmonksLeagues } from "@/lib/providers/sportmonks-provider"

export const dynamic = "force-dynamic"
export const revalidate = 0

const preferredTerms = [
  "women",
  "femin",
  "nwsl",
  "liga bpi",
  "portugal",
  "champions league",
  "euro",
]

function isPreferredLeague(name: string) {
  const normalized = name.toLowerCase()

  return preferredTerms.some((term) =>
    normalized.includes(term)
  )
}

export async function GET(
  request: NextRequest
) {
  try {
    const search =
      request.nextUrl.searchParams.get(
        "search"
      ) || undefined

    const leagues =
      await fetchSportmonksLeagues(search)
    const preferred = search
      ? leagues
      : leagues.filter((league) =>
          isPreferredLeague(league.name)
        )
    const filtered = preferred.length
      ? preferred
      : leagues

    return NextResponse.json({
      success: true,
      generatedAt: new Date().toISOString(),
      total: leagues.length,
      preferred: preferred.length,
      returned: filtered.length,
      leagues: filtered.slice(0, 80).map((league) => ({
        id: league.id,
        name: league.name,
        country: league.country?.name || null,
        currentSeason:
          league.currentSeason ||
          league.currentseason ||
          null,
        seasons: (league.seasons || [])
          .slice()
          .sort((a, b) =>
            b.name.localeCompare(a.name)
          )
          .slice(0, 8),
      })),
    })
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        message: getErrorMessage(error),
      },
      { status: 200 }
    )
  }
}
