import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

export const dynamic = "force-dynamic"

const allowedSports = new Set([
  "Futebol",
  "Futsal",
  "Andebol",
  "Andebol de praia",
  "Voleibol",
  "Basquetebol",
  "Tenis",
  "Atletismo",
  "Rugby",
  "Hoquei em patins",
])

const requestTimes = new Map<string, number>()

function getClientKey(request: NextRequest) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  )
}

function isLimited(key: string) {
  const now = Date.now()
  const previous = requestTimes.get(key) || 0

  if (now - previous < 10_000) {
    return true
  }

  requestTimes.set(key, now)
  return false
}

export async function POST(request: NextRequest) {
  try {
    const clientKey = getClientKey(request)

    if (isLimited(clientKey)) {
      return NextResponse.json(
        {
          success: false,
          message: "Tenta novamente dentro de alguns segundos.",
        },
        { status: 429 }
      )
    }

    const payload = (await request.json()) as {
      selectedSports?: unknown
      otherSport?: unknown
      email?: unknown
      locale?: unknown
    }

    const selectedSports = Array.isArray(payload.selectedSports)
      ? payload.selectedSports
          .filter((sport): sport is string => typeof sport === "string")
          .map((sport) => sport.trim())
          .filter((sport) => allowedSports.has(sport))
          .slice(0, 6)
      : []

    const otherSport =
      typeof payload.otherSport === "string"
        ? payload.otherSport.trim().slice(0, 80)
        : ""

    if (selectedSports.length === 0 && !otherSport) {
      return NextResponse.json(
        {
          success: false,
          message: "Escolhe pelo menos uma modalidade.",
        },
        { status: 400 }
      )
    }

    const email =
      typeof payload.email === "string"
        ? payload.email.trim().slice(0, 180)
        : ""

    const supabase = getSupabaseAdmin()
    const row = {
      selected_sports: selectedSports,
      other_sport: otherSport || null,
      email: email || null,
      locale:
        typeof payload.locale === "string"
          ? payload.locale.slice(0, 32)
          : null,
      user_agent: request.headers.get("user-agent")?.slice(0, 500) || null,
    }

    const { error } = await supabase.from("sports_poll_responses").insert(row)

    if (error) {
      console.warn("Sports poll response not stored.", error.message)
      await supabase.from("analytics_events").insert({
        event_type: "sports_poll_response",
        path: `/feedback?sports=${encodeURIComponent(
          selectedSports.join(",")
        )}`,
        referrer: otherSport || null,
        language: row.locale,
        viewport: null,
        user_agent: row.user_agent,
      })
    }

    return NextResponse.json({
      success: true,
      message: "Voto registado. Obrigado.",
    })
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Nao foi possivel registar agora.",
      },
      { status: 500 }
    )
  }
}
