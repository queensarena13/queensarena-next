import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-admin"
import { supabase } from "@/lib/supabase"
import { getErrorMessage } from "@/lib/errors"

export async function POST(
  request: NextRequest
) {
  try {
    const subscription =
      await request.json()

    if (
      !subscription?.endpoint ||
      !subscription?.keys?.p256dh ||
      !subscription?.keys?.auth
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid push subscription.",
        },
        { status: 400 }
      )
    }

    const client =
      process.env.SUPABASE_SERVICE_ROLE_KEY
        ? getSupabaseAdmin()
        : supabase

    const { error } = await client
      .from("push_subscriptions")
      .upsert(
        {
          endpoint: subscription.endpoint,
          subscription,
          updated_at:
            new Date().toISOString(),
        },
        {
          onConflict: "endpoint",
        }
      )

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
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
