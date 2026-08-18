import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

export const dynamic = "force-dynamic"

const allowedEvents = new Set([
  "page_view",
  "ad_slot_view",
  "favorite_team",
  "notification_open",
])

export async function POST(request: NextRequest) {
  try {
    const payload =
      (await request.json()) as Record<
        string,
        unknown
      >
    const eventType =
      typeof payload.eventType === "string"
        ? payload.eventType
        : "page_view"

    if (!allowedEvents.has(eventType)) {
      return NextResponse.json(
        { success: false },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdmin()
    const { error } = await supabase
      .from("analytics_events")
      .insert({
        event_type: eventType,
        path:
          typeof payload.path === "string"
            ? payload.path.slice(0, 300)
            : null,
        referrer:
          typeof payload.referrer === "string"
            ? payload.referrer.slice(0, 500)
            : null,
        language:
          typeof payload.language === "string"
            ? payload.language.slice(0, 32)
            : null,
        viewport:
          typeof payload.viewport === "string"
            ? payload.viewport.slice(0, 32)
            : null,
        user_agent:
          request.headers
            .get("user-agent")
            ?.slice(0, 500) || null,
      })

    if (error) {
      console.warn(
        "Analytics event not stored.",
        error.message
      )
    }

    return NextResponse.json({
      success: true,
    })
  } catch {
    return NextResponse.json({
      success: true,
    })
  }
}
