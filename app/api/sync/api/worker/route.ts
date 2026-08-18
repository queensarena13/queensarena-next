import {
  NextRequest,
  NextResponse,
} from "next/server"
import { getErrorMessage } from "@/lib/errors"
import { logSync } from "@/lib/logger"
import {
  normalizeTeamName,
  normalizeVenue,
} from "@/lib/normalizers"
import { publishNotification } from "@/lib/server-notifications"
import { getSupabaseAdmin } from "@/lib/supabase-admin"
import { assertSyncSecret } from "@/lib/sync-auth"
import { validateMatch } from "@/lib/validators"

function getMatchNotification(
  previous: {
    home_score: number
    away_score: number
    status: string
  },
  next: {
    home_team: string
    away_team: string
    home_score: number
    away_score: number
    status: string
    competition?: string
    external_id: string
  }
) {
  const scoreChanged =
    previous.home_score !== next.home_score ||
    previous.away_score !== next.away_score
  const statusChanged =
    previous.status !== next.status

  if (!scoreChanged && !statusChanged) {
    return null
  }

  const score = `${next.home_team} ${next.home_score}-${next.away_score} ${next.away_team}`
  const title =
    next.status === "FINISHED"
      ? "Resultado final"
      : next.status === "LIVE"
        ? "Jogo em direto"
        : scoreChanged
          ? "Atualização de marcador"
          : "Atualização de jogo"

  return {
    title,
    message: `${score} - ${
      next.competition || "QueensArena"
    }`,
    url: `/matches/${encodeURIComponent(
      next.external_id
    )}`,
  }
}

export async function GET(request: NextRequest) {
  try {
    assertSyncSecret(request)

    const supabaseAdmin =
      getSupabaseAdmin()

    const { data: jobs } = await supabaseAdmin
      .from("sync_queue")
      .select("*")
      .eq("status", "PENDING")
      .limit(20)

    if (!jobs || jobs.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No pending jobs.",
      })
    }

    let processed = 0

    for (const job of jobs) {
      try {
        const rawMatch = job.payload
        const match = {
          ...rawMatch,
          home_team: normalizeTeamName(
            rawMatch.home_team
          ),
          away_team: normalizeTeamName(
            rawMatch.away_team
          ),
          venue: normalizeVenue(
            rawMatch.venue
          ),
        }

        const valid =
          validateMatch(match)

        if (!valid) {
          await supabaseAdmin
            .from("sync_queue")
            .update({
              status: "INVALID",
            })
            .eq("id", job.id)

          continue
        }

        const { data: existingMatch } =
          await supabaseAdmin
            .from("matches")
            .select("*")
            .eq(
              "external_id",
              match.external_id
            )
            .single()

        if (existingMatch) {
          const notification =
            getMatchNotification(
              existingMatch,
              match
            )

          await supabaseAdmin
            .from("matches")
            .update({
              sport: match.sport,
              home_score:
                match.home_score,
              away_score:
                match.away_score,
              venue: match.venue,
              status: match.status,
              starts_at:
                match.starts_at,
              competition:
                match.competition,
              source: match.source,
              region: match.region,
            })
            .eq("id", existingMatch.id)

          if (notification) {
            await publishNotification(
              supabaseAdmin,
              notification
            )
          }
        } else {
          await supabaseAdmin
            .from("matches")
            .insert({
              external_id:
                match.external_id,
              sport: match.sport,
              home_team:
                match.home_team,
              away_team:
                match.away_team,
              home_score:
                match.home_score,
              away_score:
                match.away_score,
              venue: match.venue,
              status: match.status,
              starts_at:
                match.starts_at,
              competition:
                match.competition,
              source: match.source,
              region: match.region,
            })
        }

        await supabaseAdmin
          .from("sync_queue")
          .update({
            status: "DONE",
          })
          .eq("id", job.id)

        processed++
      } catch (error) {
        console.error(error)

        await supabaseAdmin
          .from("sync_queue")
          .update({
            status: "FAILED",
            attempts:
              (job.attempts || 0) + 1,
          })
          .eq("id", job.id)
      }
    }

    await logSync(
      "WORKER",
      `${processed} jobs processed.`
    )

    return NextResponse.json({
      success: true,
      processed,
    })
  } catch (error: unknown) {
    const message = getErrorMessage(error)

    console.error(error)

    await logSync(
      "FATAL",
      `Worker crashed: ${message}`
    )

    return NextResponse.json({
      success: false,
      message,
    })
  }
}
