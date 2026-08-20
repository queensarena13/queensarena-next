export const notificationsEnabledKey =
  "queensarena-notifications-enabled"

function urlBase64ToUint8Array(
  base64String: string
) {
  const padding = "=".repeat(
    (4 - (base64String.length % 4)) % 4
  )
  const base64 = `${base64String}${padding}`
    .replace(/-/g, "+")
    .replace(/_/g, "/")
  const rawData = window.atob(base64)

  return Uint8Array.from(
    [...rawData].map((char) =>
      char.charCodeAt(0)
    )
  )
}

export async function subscribeToPush() {
  if (
    typeof window === "undefined" ||
    !("serviceWorker" in navigator) ||
    !("PushManager" in window)
  ) {
    return false
  }

  const vapidPublicKey =
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

  if (!vapidPublicKey) {
    return false
  }

  const registration =
    await navigator.serviceWorker.ready
  const existing =
    await registration.pushManager.getSubscription()
  const subscription =
    existing ||
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey:
        urlBase64ToUint8Array(vapidPublicKey),
    }))

  const { createClient } = await import("@supabase/supabase-js")
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const sessionClient =
    supabaseUrl && supabaseAnonKey
      ? createClient(supabaseUrl, supabaseAnonKey, {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
          },
        })
      : null
  const { data: { session } } = sessionClient
    ? await sessionClient.auth.getSession()
    : { data: { session: null } }

  const response = await fetch("/api/push/subscribe", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(session?.access_token
        ? { Authorization: `Bearer ${session.access_token}` }
        : {}),
    },
    body: JSON.stringify(subscription),
  })

  if (!response.ok) return false

  return true
}

export async function notifyAppUpdate(
  title: string,
  body: string,
  url = "/matches"
) {
  if (
    typeof window === "undefined" ||
    !("Notification" in window) ||
    Notification.permission !== "granted" ||
    window.localStorage.getItem(
      notificationsEnabledKey
    ) !== "true"
  ) {
    return
  }

  const registration =
    "serviceWorker" in navigator
      ? await navigator.serviceWorker.ready.catch(
          () => null
        )
      : null

  if (registration) {
    await registration.showNotification(title, {
      body,
      icon: "/queen-logo.png",
      badge: "/queen-logo.png",
      data: { url },
    })
    return
  }

  new Notification(title, {
    body,
    icon: "/queen-logo.png",
  })
}
