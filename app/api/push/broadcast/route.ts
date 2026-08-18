import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-admin"
import { getErrorMessage } from "@/lib/errors"
import { publishNotification } from "@/lib/server-notifications"

export async function POST(
  request: NextRequest
) {
  try {
    const secret =
      request.headers.get("x-push-secret")

    if (
      !process.env.PUSH_BROADCAST_SECRET ||
      secret !==
        process.env.PUSH_BROADCAST_SECRET
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 }
      )
    }

    const payload = await request.json()
    const title =
      payload.title || "QueensArena"
    const body =
      payload.body ||
      "Há uma atualização nos jogos."
    const url = payload.url || "/matches"

    const result = await publishNotification(
      getSupabaseAdmin(),
      {
        title,
        message: body,
        url,
      }
    )

    return NextResponse.json({
      success: true,
      sent: result.sent,
      failed: result.failed,
      skipped: result.skipped,
    })
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        message: getErrorMessage(error),
      },
      { status: 500 }
    )
  }
}
