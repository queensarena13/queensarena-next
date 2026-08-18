import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"

function loadEnvFile(fileName) {
  const envPath = join(process.cwd(), fileName)

  if (!existsSync(envPath)) return

  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim()

    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
      continue
    }

    const [name, ...parts] = trimmed.split("=")
    const value = parts.join("=").trim().replace(/^["']|["']$/g, "")

    if (!process.env[name]) {
      process.env[name] = value
    }
  }
}

loadEnvFile(".env.local")
loadEnvFile(".env.vercel.local")

const key = process.env.API_SPORTS_KEY

if (!key) {
  throw new Error("Missing API_SPORTS_KEY")
}

const targets = [
  {
    sport: "football",
    league: 254,
    season: 2026,
    name: "NWSL Women",
  },
  {
    sport: "football",
    league: 254,
    season: 2025,
    name: "NWSL Women",
  },
  {
    sport: "football",
    league: 641,
    season: 2025,
    name: "NWSL Women - Challenge Cup",
  },
  {
    sport: "football",
    league: 1119,
    season: 2024,
    name: "NWSL - Liga MXF Summer Cup",
  },
  {
    sport: "football",
    league: 1217,
    season: 2026,
    name: "FIFA Women Champions Cup",
  },
  {
    sport: "handball",
    league: 132,
    season: 2025,
    name: "Champions League Women",
  },
  {
    sport: "handball",
    league: 132,
    season: 2024,
    name: "Champions League Women",
  },
  {
    sport: "handball",
    league: 132,
    season: 2023,
    name: "Champions League Women",
  },
]

function getUrl(target) {
  const base =
    target.sport === "football"
      ? "https://v3.football.api-sports.io/fixtures"
      : "https://v1.handball.api-sports.io/games"
  const url = new URL(base)
  url.searchParams.set("league", String(target.league))
  url.searchParams.set("season", String(target.season))
  return url
}

for (const target of targets) {
  const response = await fetch(getUrl(target), {
    headers: {
      "x-apisports-key": key,
    },
  })
  const data = await response.json()
  const events = data.response || []

  console.log(
    JSON.stringify({
      ...target,
      status: response.status,
      results: data.results || 0,
      count: events.length,
      errors: data.errors || null,
      first: events[0] || null,
    })
  )
}
