import { NextResponse } from "next/server"
import { analyseMatchData } from "@/lib/data-quality"
import { getErrorMessage } from "@/lib/errors"
import { fetchMatches } from "@/lib/providers/matches-provider"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  try {
    const matches = await fetchMatches()
    const report = analyseMatchData(matches)

    return NextResponse.json(
      {
        success: true,
        ...report,
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
        checkedAt: new Date().toISOString(),
        message: getErrorMessage(error),
      },
      { status: 200 }
    )
  }
}
