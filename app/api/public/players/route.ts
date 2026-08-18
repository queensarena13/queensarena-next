import {
  NextRequest,
  NextResponse,
} from "next/server"
import { fetchQueensArenaPlayers } from "@/lib/queensarena-data"
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
    const sport =
      request.nextUrl.searchParams.get(
        "sport"
      )
    const players =
      await fetchQueensArenaPlayers({
        limit,
        sport,
      })

    return NextResponse.json({
      success: true,
      source: "queensarena",
      sourceLabel: "QueensArena Data API",
      generatedAt: new Date().toISOString(),
      players,
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
        players: [],
      },
      { status: 200 }
    )
  }
}
