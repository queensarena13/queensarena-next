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

const apiKey = process.env.API_SPORTS_KEY

if (!apiKey) {
  throw new Error("Missing API_SPORTS_KEY")
}

const searches = [
  {
    sport: "football",
    baseUrl: "https://v3.football.api-sports.io/leagues",
    terms: ["women", "female", "feminine"],
  },
  {
    sport: "handball",
    baseUrl: "https://v1.handball.api-sports.io/leagues",
    terms: ["women", "female", "feminine"],
  },
]

function yearsFromLeague(item) {
  return (item.seasons || [])
    .map((season) => season.year || season.season)
    .filter(Boolean)
    .slice(-6)
}

function leagueName(item) {
  return item.league?.name || item.name || ""
}

function leagueId(item) {
  return item.league?.id || item.id || ""
}

function countryName(item) {
  return item.country?.name || item.country || ""
}

const discovered = new Map()

for (const search of searches) {
  for (const term of search.terms) {
    const url = new URL(search.baseUrl)
    url.searchParams.set("search", term)

    const response = await fetch(url, {
      headers: {
        "x-apisports-key": apiKey,
      },
    })
    const data = await response.json()

    if (!response.ok) {
      console.warn(`${search.sport} ${term} HTTP ${response.status}`)
      continue
    }

    if (data.errors && Object.keys(data.errors).length > 0) {
      console.warn(`${search.sport} ${term}`, data.errors)
      continue
    }

    for (const item of data.response || []) {
      const id = leagueId(item)
      const name = leagueName(item)

      if (!id || !name) continue

      const key = `${search.sport}:${id}`
      const current = discovered.get(key)
      const years = yearsFromLeague(item)

      if (!current || years.length > current.years.length) {
        discovered.set(key, {
          sport: search.sport,
          id,
          name,
          country: countryName(item),
          years,
        })
      }
    }
  }
}

const rows = [...discovered.values()].sort((a, b) =>
  `${a.sport} ${a.country} ${a.name}`.localeCompare(
    `${b.sport} ${b.country} ${b.name}`
  )
)

for (const row of rows) {
  console.log(JSON.stringify(row))
}

console.error(`Discovered ${rows.length} leagues.`)
