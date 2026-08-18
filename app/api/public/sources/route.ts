import { NextResponse } from "next/server"
import { fetchQueensArenaOfficialSources } from "@/lib/queensarena-data"
import { getErrorMessage } from "@/lib/errors"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  try {
    const sources =
      await fetchQueensArenaOfficialSources()

    return NextResponse.json({
      success: true,
      source: "queensarena",
      sourceLabel: "QueensArena Official Aggregator",
      generatedAt: new Date().toISOString(),
      sources,
    })
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        source: "queensarena",
        sourceLabel: "QueensArena Official Aggregator",
        generatedAt:
          new Date().toISOString(),
        message: getErrorMessage(error),
        sources: [],
      },
      { status: 200 }
    )
  }
}
