import {
  NextRequest,
  NextResponse,
} from "next/server"

import { getSupabaseAdmin } from "@/lib/supabase-admin"

import { logSync } from "@/lib/logger"
import { assertSyncSecret } from "@/lib/sync-auth"

export async function GET(request: NextRequest) {
  try {
    assertSyncSecret(request)

    const supabaseAdmin =
      getSupabaseAdmin()

    // DELETE OLD LOGS
    await supabaseAdmin
      .from("sync_logs")
      .delete()
      .lt(
        "created_at",
        new Date(
          Date.now() -
            1000 *
              60 *
              60 *
              24 *
              7
        ).toISOString()
      )

    // DELETE OLD NOTIFICATIONS
    await supabaseAdmin
      .from("notifications")
      .delete()
      .lt(
        "created_at",
        new Date(
          Date.now() -
            1000 *
              60 *
              60 *
              24 *
              3
        ).toISOString()
      )

    await logSync(
      "CLEANUP",
      "Old data cleaned."
    )

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json({
      success: false,
      error,
    })
  }
}
