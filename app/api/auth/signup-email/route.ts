import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

function normalizeEmail(value: unknown) {
  return typeof value === "string"
    ? value.trim().toLowerCase()
    : ""
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: unknown
      status?: unknown
    }
    const email = normalizeEmail(body.email)
    const status =
      typeof body.status === "string"
        ? body.status.slice(0, 40)
        : "submitted"

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Invalid email." },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdmin()
    const { error } = await supabase
      .from("signup_emails")
      .upsert(
        {
          email,
          status,
          last_seen_at: new Date().toISOString(),
        },
        {
          onConflict: "email",
        }
      )

    if (error) {
      console.warn("Signup email audit not stored.", error.message)

      await supabase.from("analytics_events").insert({
        event_type: "signup_email",
        path: `/login?signup_status=${encodeURIComponent(status)}`,
        referrer: email,
        language: null,
        viewport: null,
        user_agent: request.headers.get("user-agent")?.slice(0, 500) || null,
      })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unexpected error.",
      },
      { status: 500 }
    )
  }
}
