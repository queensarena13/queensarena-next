import type { SupabaseClient } from "@supabase/supabase-js"
import webpush from "web-push"

interface PushSubscriptionRow {
  id: number
  subscription: webpush.PushSubscription
}

interface PublishNotificationOptions {
  title: string
  message: string
  url?: string
}

function configureWebPush() {
  const publicKey =
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY

  if (!publicKey || !privateKey) {
    return false
  }

  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT ||
      "mailto:queensarena13@gmail.com",
    publicKey,
    privateKey
  )

  return true
}

function isExpiredPushError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "statusCode" in error &&
    [404, 410].includes(
      Number(
        (error as { statusCode?: number })
          .statusCode
      )
    )
  )
}

export async function publishNotification(
  supabaseAdmin: SupabaseClient,
  {
    title,
    message,
    url = "/matches",
  }: PublishNotificationOptions
) {
  await supabaseAdmin
    .from("notifications")
    .insert({
      title,
      message,
    })

  if (!configureWebPush()) {
    return {
      sent: 0,
      failed: 0,
      skipped: true,
    }
  }

  const { data, error } = await supabaseAdmin
    .from("push_subscriptions")
    .select("id, subscription")

  if (error) {
    throw error
  }

  const subscriptions =
    (data || []) as PushSubscriptionRow[]
  let sent = 0
  let failed = 0

  await Promise.all(
    subscriptions.map(async (row) => {
      try {
        await webpush.sendNotification(
          row.subscription,
          JSON.stringify({
            title,
            body: message,
            url,
          })
        )
        sent += 1
      } catch (error) {
        failed += 1

        if (isExpiredPushError(error)) {
          await supabaseAdmin
            .from("push_subscriptions")
            .delete()
            .eq("id", row.id)
        }
      }
    })
  )

  return {
    sent,
    failed,
    skipped: false,
  }
}
