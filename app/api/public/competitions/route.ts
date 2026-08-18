import { NextResponse } from "next/server"
import { fetchQueensArenaCompetitions } from "@/lib/queensarena-data"
import { getErrorMessage } from "@/lib/errors"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  try {
    const competitions =
      await fetchQueensArenaCompetitions()

    return NextResponse.json({
      success: true,
      source: "queensarena",
      sourceLabel: "QueensArena Data API",
      generatedAt: new Date().toISOString(),
      competitions,
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
        competitions: [],
      },
      { status: 200 }
    )
  }
}
