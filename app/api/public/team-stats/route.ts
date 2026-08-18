import {
  NextRequest,
  NextResponse,
} from "next/server"
import { getErrorMessage } from "@/lib/errors"
import { fetchQueensArenaTeamStats } from "@/lib/queensarena-data"

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

    const teamStats =
      await fetchQueensArenaTeamStats({
        limit,
        sport,
        competition,
        season,
      })

    return NextResponse.json({
      success: true,
      source: "queensarena",
      sourceLabel:
        "QueensArena Derived Team Stats",
      generatedAt: new Date().toISOString(),
      teamStats,
    })
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        source: "queensarena",
        sourceLabel:
          "QueensArena Derived Team Stats",
        generatedAt:
          new Date().toISOString(),
        message: getErrorMessage(error),
        teamStats: [],
      },
      { status: 200 }
    )
  }
}
