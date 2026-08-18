import {
  NextRequest,
  NextResponse,
} from "next/server"
import { getErrorMessage } from "@/lib/errors"
import { fetchQueensArenaPlayerStats } from "@/lib/queensarena-data"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(
  request: NextRequest
) {
  try {
    const limit = Number(
      request.nextUrl.searchParams.get(
        "limit"
      ) || "1000"
    )
    const sport =
      request.nextUrl.searchParams.get(
        "sport"
      )
    const competition =
      request.nextUrl.searchParams.get(
        "competition"
      )
    const season =
      request.nextUrl.searchParams.get(
        "season"
      )

    const playerStats =
      await fetchQueensArenaPlayerStats({
        limit,
        sport,
        competition,
        season,
      })

    return NextResponse.json({
      success: true,
      source: "queensarena",
      sourceLabel:
        "QueensArena Derived Player Stats",
      generatedAt: new Date().toISOString(),
      playerStats,
    })
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        source: "queensarena",
        sourceLabel:
          "QueensArena Derived Player Stats",
        generatedAt:
          new Date().toISOString(),
        message: getErrorMessage(error),
        playerStats: [],
      },
      { status: 200 }
    )
  }
}
