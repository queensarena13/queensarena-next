import {
  NextRequest,
  NextResponse,
} from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-admin"
import { fetchMatches } from "@/lib/providers/matches-provider"
import { upsertMatches } from "@/lib/matches-sync"
import { assertSyncSecret } from "@/lib/sync-auth"
import { getErrorMessage } from "@/lib/errors"
import { logSync } from "@/lib/logger"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    assertSyncSecret(request)

    const season =
      request.nextUrl.searchParams.get(
        "season"
      )
    const supabaseAdmin =
      getSupabaseAdmin()
    const matches = await fetchMatches({
      season,
    })
    const result = await upsertMatches(
      supabaseAdmin,
      matches
    )

    await logSync(
      "MATCHES",
      `${result.upserted} matches upserted into QueensArena Data API.`
    )

    return NextResponse.json({
      success: true,
      source: "queensarena",
      provider: "TheSportsDB",
      fetched: matches.length,
      ...result,
    })
  } catch (error: unknown) {
    const message =
      getErrorMessage(error)

    await logSync("FATAL", message)

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 200 }
    )
  }
}
