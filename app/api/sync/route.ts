import {
  NextRequest,
  NextResponse,
} from "next/server"

import { addToQueue } from "@/lib/queue"

import {
  fetchMatches,
  ExternalMatch,
} from "@/lib/providers/matches-provider"

import { logSync } from "@/lib/logger"
import { getErrorMessage } from "@/lib/errors"
import { assertSyncSecret } from "@/lib/sync-auth"

export async function GET(request: NextRequest) {
  try {
    assertSyncSecret(request)

    await logSync(
      "INFO",
      "Sync process started."
    )

    const matches: ExternalMatch[] =
      await fetchMatches()

    for (const match of matches) {
      await addToQueue(
        "MATCH_SYNC",
        match
      )
    }

    await logSync(
      "QUEUE",
      `${matches.length} matches queued.`
    )

    return NextResponse.json({
      success: true,
      queued: matches.length,
    })
  } catch (error: unknown) {
    const message =
      getErrorMessage(error)

    console.error("SYNC ERROR:", error)

    await logSync(
      "FATAL",
      message
    )

    return NextResponse.json({
      success: false,
      message,
    })
  }
}
