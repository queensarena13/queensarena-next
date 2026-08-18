import { NextRequest } from "next/server"

function isDevelopment() {
  return process.env.NODE_ENV !== "production"
}

export function assertSyncSecret(
  request: NextRequest
) {
  const syncSecret =
    process.env.PUSH_BROADCAST_SECRET ||
    process.env.SYNC_SECRET
  const cronSecret =
    process.env.CRON_SECRET

  if (!syncSecret && !cronSecret) {
    if (isDevelopment()) return

    throw new Error(
      "Missing CRON_SECRET, PUSH_BROADCAST_SECRET or SYNC_SECRET."
    )
  }

  const receivedHeader =
    request.headers.get("x-sync-secret") ||
    request.headers.get("x-push-secret")
  const authorization =
    request.headers.get("authorization")

  const cronAuthorized =
    cronSecret &&
    authorization === `Bearer ${cronSecret}`
  const headerAuthorized =
    syncSecret && receivedHeader === syncSecret

  if (!cronAuthorized && !headerAuthorized) {
    throw new Error("Unauthorized.")
  }
}
