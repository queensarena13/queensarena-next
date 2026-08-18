import {
  NextRequest,
  NextResponse,
} from "next/server"
import { regenerateDerivedStandings } from "@/lib/derived-standings"
import { getErrorMessage } from "@/lib/errors"
import { logSync } from "@/lib/logger"
import { assertSyncSecret } from "@/lib/sync-auth"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    assertSyncSecret(request)

    const result =
      await regenerateDerivedStandings()

    await logSync(
      "STANDINGS",
      `Regenerated ${result.standings} standings and ${result.teamStats} team stats from ${result.matches} finished matches.`
    )

    return NextResponse.json({
      success: true,
      source: "QueensArena Derived",
      ...result,
    })
  } catch (error: unknown) {
    const message = getErrorMessage(error)

    await logSync(
      "FATAL",
      `Standings sync failed: ${message}`
    )

    return NextResponse.json(
      {
        success: false,
        message,
      },
      {
        status:
          message === "Unauthorized." ? 401 : 200,
      }
    )
  }
}
