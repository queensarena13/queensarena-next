import { NextRequest, NextResponse } from "next/server"
import {
  ExternalMatch,
  fetchMatches,
} from "@/lib/providers/matches-provider"
import { getErrorMessage } from "@/lib/errors"
import { getTheSportsDbLeagues } from "@/lib/sports-config"
import { fetchQueensArenaMatches } from "@/lib/queensarena-data"
import {
  canonicalCompetitionName,
  competitionAliasesForFilter,
} from "@/lib/text-normalization"

export const dynamic = "force-dynamic"
export const revalidate = 0

function filterMatches(
  matches: ExternalMatch[],
  view: string | null,
  sport?: string | null,
  competition?: string | null
) {
  let filtered = matches

  if (sport) {
    filtered = filtered.filter(
      (match) => match.sport === sport
    )
  }

  if (competition) {
    const aliases = competitionAliasesForFilter(
      competition,
      sport
    ).map((item) =>
      canonicalCompetitionName(item, sport)
    )

    filtered = filtered.filter(
      (match) =>
        aliases.includes(
          canonicalCompetitionName(
            match.competition,
            match.sport
          )
        )
    )
  }

  if (view === "live") {
    return filtered.filter((match) =>
      ["LIVE", "HALFTIME"].includes(
        match.status
      )
    )
  }

  if (view === "recent") {
    return filtered
      .filter(
        (match) =>
          match.status === "FINISHED"
      )
      .sort(
        (a, b) =>
          new Date(
            b.starts_at
          ).getTime() -
          new Date(a.starts_at).getTime()
      )
  }

  if (view === "upcoming") {
    return filtered
      .filter(
        (match) =>
          match.status === "SCHEDULED"
      )
      .sort(
        (a, b) =>
          new Date(
            a.starts_at
          ).getTime() -
          new Date(b.starts_at).getTime()
      )
  }

  return filtered
}

export async function GET(
  request: NextRequest
) {
  try {
    const view =
      request.nextUrl.searchParams.get(
        "view"
      )

    const limit = Number(
      request.nextUrl.searchParams.get(
        "limit"
      ) || "20"
    )

    const season =
      request.nextUrl.searchParams.get(
        "season"
      )
    const sport =
      request.nextUrl.searchParams.get("sport")
    const competition =
      request.nextUrl.searchParams.get(
        "competition"
      )

    let queensArenaMatches: ExternalMatch[] = []

    try {
      queensArenaMatches =
        await fetchQueensArenaMatches({
          season,
          view,
          limit,
          sport,
          competition,
        })
    } catch (error) {
      console.warn(
        "QueensArena Data API unavailable, falling back to provider.",
        error
      )
    }

    const matches =
      queensArenaMatches.length > 0
        ? queensArenaMatches
        : filterMatches(
            await fetchMatches({ season }),
            view,
            sport,
            competition
          ).slice(0, limit)

    const source =
      queensArenaMatches.length > 0
        ? "queensarena"
        : "thesportsdb"

    return NextResponse.json(
      {
        success: true,
        source,
        sourceLabel:
          source === "queensarena"
            ? "QueensArena Data API"
            : "TheSportsDB",
        generatedAt: new Date().toISOString(),
        competitionsChecked:
          getTheSportsDbLeagues().map(
            (league) => league.name
          ),
        matches,
      },
      {
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    )
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        source: "thesportsdb",
        sourceLabel: "TheSportsDB",
        generatedAt:
          new Date().toISOString(),
        competitionsChecked:
          getTheSportsDbLeagues().map(
            (league) => league.name
          ),
        message: getErrorMessage(error),
        matches: [],
      },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    )
  }
}
