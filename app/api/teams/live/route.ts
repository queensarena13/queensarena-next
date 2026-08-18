import { NextResponse } from "next/server"
import { fetchTeams } from "@/lib/providers/teams-provider"
import { getErrorMessage } from "@/lib/errors"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  try {
    const teams = await fetchTeams()

    return NextResponse.json({
      success: true,
      source: "mixed",
      sourceLabel: "QueensArena + TheSportsDB",
      generatedAt: new Date().toISOString(),
      teams,
    })
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        source: "mixed",
        sourceLabel: "QueensArena + TheSportsDB",
        generatedAt: new Date().toISOString(),
        message: getErrorMessage(error),
        teams: [],
      },
      { status: 200 }
    )
  }
}
