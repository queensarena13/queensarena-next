import {
  NextRequest,
  NextResponse,
} from "next/server"
import { fetchQueensArenaMatches } from "@/lib/queensarena-data"
import { getErrorMessage } from "@/lib/errors"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(
  request: NextRequest
) {
  try {
    const limit = Number(
      request.nextUrl.searchParams.get(
        "limit"
      ) || "100"
    )
    const season =
      request.nextUrl.searchParams.get(
        "season"
      )
    const view =
      request.nextUrl.searchParams.get(
        "view"
      ) || "upcoming"
    const sport =
      request.nextUrl.searchParams.get(
        "sport"
      )
    const competition =
      request.nextUrl.searchParams.get(
        "competition"
      )

    const matches =
      await fetchQueensArenaMatches({
        limit,
        season,
        view,
        sport,
        competition,
      })

    return NextResponse.json({
      success: true,
      source: "queensarena",
      sourceLabel: "QueensArena Data API",
      generatedAt: new Date().toISOString(),
      matches,
    })
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        source: "queensarena",
        sourceLabel: "QueensArena Data API",
        generatedAt:
          new Date().toISOString(),
        message: getErrorMessage(error),
        matches: [],
      },
      { status: 200 }
    )
  }
}
