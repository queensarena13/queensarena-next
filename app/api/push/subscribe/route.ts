import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getSupabaseAdmin } from "@/lib/supabase-admin"
import { getErrorMessage } from "@/lib/errors"

function getAuthClient(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const authorization = request.headers.get("authorization")

  if (!supabaseUrl || !supabaseAnonKey) return null

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: authorization ? { Authorization: authorization } : {},
    },
  })
}

export async function POST(request: NextRequest) {
  try {
    const subscription = await request.json()

    if (
      !subscription?.endpoint ||
      !subscription?.keys?.p256dh ||
      !subscription?.keys?.auth
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid push subscription." },
        { status: 400 }
      )
    }

    const authClient = getAuthClient(request)
    const { data: { user } } = authClient
      ? await authClient.auth.getUser()
      : { data: { user: null } }

    const client = getSupabaseAdmin()
    const { error } = await client.from("push_subscriptions").upsert(
      {
        endpoint: subscription.endpoint,
        subscription,
        user_id: user?.id ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "endpoint" }
    )

    if (error) throw error

    return NextResponse.json({ success: true, authenticated: Boolean(user) })
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, message: getErrorMessage(error) },
      { status: 500 }
    )
  }
}
