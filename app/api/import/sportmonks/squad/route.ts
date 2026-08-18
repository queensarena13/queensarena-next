import { NextRequest, NextResponse } from "next/server"
import {
  fetchSportmonksSquad,
} from "@/lib/providers/sportmonks-provider"
import { getSupabaseAdmin } from "@/lib/supabase-admin"
import { getErrorMessage } from "@/lib/errors"
import { assertSyncSecret } from "@/lib/sync-auth"

export async function POST(
  request: NextRequest
) {
  try {
    assertSyncSecret(request)

    const body = await request.json()
    const teamId = String(body.teamId || "")
    const teamName = String(
      body.teamName || ""
    )
    const season = String(
      body.season || ""
    )

    if (!teamId || !teamName || !season) {
      return NextResponse.json(
        {
          success: false,
          message:
            "teamId, teamName and season are required.",
        },
        { status: 400 }
      )
    }

    const supabaseAdmin =
      getSupabaseAdmin()
    const { data: team } =
      await supabaseAdmin
        .from("teams")
        .select("id")
        .eq("name", teamName)
        .single()

    const squad =
      await fetchSportmonksSquad(teamId)

    const rows = squad.map((entry) => {
      const player =
        entry.player || entry

      return {
        external_id: String(player.id),
        provider: "sportmonks",
        team_id: team?.id || null,
        name:
          player.display_name ||
          player.name ||
          "Unknown",
        sport: "Football",
        position: player.position_id
          ? String(player.position_id)
          : null,
        nationality:
          player.nationality_id
            ? String(player.nationality_id)
            : null,
        image_url:
          player.image_path || null,
        season,
        updated_at:
          new Date().toISOString(),
      }
    })

    if (rows.length > 0) {
      const { error } = await supabaseAdmin
        .from("players")
        .upsert(rows, {
          onConflict:
            "provider,external_id",
        })

      if (error) throw error
    }

    return NextResponse.json({
      success: true,
      imported: rows.length,
    })
  } catch (error: unknown) {
    const message =
      getErrorMessage(error)

    return NextResponse.json(
      {
        success: false,
        message,
      },
      {
        status:
          message === "Unauthorized." ? 401 : 500,
      }
    )
  }
}
