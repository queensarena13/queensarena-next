self.addEventListener("install", () => {
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting()
  }
})

self.addEventListener("push", (event) => {
  const data = event.data
    ? event.data.json()
    : {
        title: "QueensArena",
        body: "Há uma atualização nos jogos.",
      }

  event.waitUntil(
    self.registration.showNotification(
      data.title || "QueensArena",
      {
        body:
          data.body ||
          "Há uma atualização nos jogos.",
        icon: "/queen-logo.png",
        badge: "/queen-logo.png",
        data: {
          url: data.url || "/matches",
        },
      }
    )
  )
})

self.addEventListener(
  "notificationclick",
  (event) => {
    event.notification.close()

    const url =
      event.notification.data?.url || "/matches"

    event.waitUntil(
      self.clients.openWindow(url)
    )
  }
)
