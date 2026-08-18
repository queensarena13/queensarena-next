import {
  NextRequest,
  NextResponse,
} from "next/server"
import { getErrorMessage } from "@/lib/errors"
import { logSync } from "@/lib/logger"
import { importCatalogToSupabase } from "@/lib/supabase-catalog-import"
import { assertSyncSecret } from "@/lib/sync-auth"

export async function GET(request: NextRequest) {
  try {
    assertSyncSecret(request)

    const result =
      await importCatalogToSupabase()

    await logSync(
      "INFO",
      `Catalog sync imported ${result.teams} teams, ${result.players} players and ${result.rosters} roster links.`
    )

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error: unknown) {
    const message = getErrorMessage(error)

    await logSync(
      "FATAL",
      `Catalog sync failed: ${message}`
    )

    return NextResponse.json(
      {
        success: false,
        message,
      },
      {
        status:
          message === "Unauthorized."
            ? 401
            : 200,
      }
    )
  }
}
