import { NextRequest, NextResponse } from "next/server"
import {
  fetchSportmonksTeams,
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
    const seasonId = String(
      body.seasonId || ""
    )
    const season = String(
      body.season || ""
    )
    const competition = String(
      body.competition || ""
    )
    const region = String(
      body.region || "Europe"
    )

    if (!seasonId || !season || !competition) {
      return NextResponse.json(
        {
          success: false,
          message:
            "seasonId, season and competition are required.",
        },
        { status: 400 }
      )
    }

    const teams =
      await fetchSportmonksTeams(seasonId)
    const supabaseAdmin =
      getSupabaseAdmin()

    const rows = teams.map((team) => ({
      external_id: String(team.id),
      provider: "sportmonks",
      name: team.name,
      sport: "Football",
      country: region,
      region,
      logo_url: team.image_path || null,
      updated_at:
        new Date().toISOString(),
    }))

    if (rows.length > 0) {
      const { error } = await supabaseAdmin
        .from("teams")
        .upsert(rows, {
          onConflict:
            "provider,external_id",
        })

      if (error) throw error
    }

    await supabaseAdmin
      .from("data_sources")
      .upsert(
        {
          provider: "sportmonks",
          sport: "Football",
          competition,
          season,
          provider_season_id: seasonId,
          enabled: true,
          updated_at:
            new Date().toISOString(),
        },
        {
          onConflict:
            "provider,competition,season",
        }
      )

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
