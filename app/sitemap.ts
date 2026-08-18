import type { MetadataRoute } from "next"

const baseUrl = "https://queensarena-next.vercel.app"

const routes = [
  "",
  "/matches",
  "/teams",
  "/players",
  "/stats",
  "/leagues",
  "/about",
  "/sources",
  "/watch",
  "/data-partnerships",
  "/editorial-policy",
  "/privacy",
  "/account-deletion",
  "/cookies",
  "/terms",
  "/contact",
  "/advertise",
  "/install",
]

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency:
      route === "" || route === "/matches"
        ? "hourly"
        : "weekly",
    priority: route === "" ? 1 : 0.7,
  }))
}
