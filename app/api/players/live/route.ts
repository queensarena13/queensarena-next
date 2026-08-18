import { NextRequest, NextResponse } from "next/server"
import { getErrorMessage } from "@/lib/errors"
import { fetchPlayers } from "@/lib/providers/players-provider"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(request: NextRequest) {
  const teamName =
    request.nextUrl.searchParams.get("teamName") ||
    undefined

  try {
    const players = await fetchPlayers({
      teamName,
    })

    return NextResponse.json({
      success: true,
      source: "mixed",
      sourceLabel: "QueensArena + TheSportsDB",
      generatedAt: new Date().toISOString(),
      players,
    })
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        source: "mixed",
        sourceLabel: "QueensArena + TheSportsDB",
        generatedAt: new Date().toISOString(),
        message: getErrorMessage(error),
        players: [],
      },
      { status: 200 }
    )
  }
}
