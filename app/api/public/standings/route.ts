import {
  NextRequest,
  NextResponse,
} from "next/server"
import { getErrorMessage } from "@/lib/errors"
import { fetchQueensArenaStandings } from "@/lib/queensarena-data"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(
  request: NextRequest
) {
  try {
    const limit = Number(
      request.nextUrl.searchParams.get(
        "limit"
      ) || "500"
    )
    const league =
      request.nextUrl.searchParams.get(
        "league"
      )

    const standings =
      await fetchQueensArenaStandings({
        limit,
        league,
      })

    return NextResponse.json({
      success: true,
      source: "queensarena",
      sourceLabel: "QueensArena Derived Standings",
      generatedAt: new Date().toISOString(),
      standings,
    })
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        source: "queensarena",
        sourceLabel:
          "QueensArena Derived Standings",
        generatedAt:
          new Date().toISOString(),
        message: getErrorMessage(error),
        standings: [],
      },
      { status: 200 }
    )
  }
}
