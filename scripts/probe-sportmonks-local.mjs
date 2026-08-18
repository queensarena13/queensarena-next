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
loadEnvFile(".env.vercel.pull")

const token = process.env.SPORTMONKS_API_TOKEN

if (!token) {
  throw new Error("Missing SPORTMONKS_API_TOKEN")
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      Authorization: token,
      Accept: "application/json",
    },
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      JSON.stringify({
        status: response.status,
        message: data.message,
        errors: data.errors,
      })
    )
  }

  return data
}

async function fetchLeagues() {
  const leagues = []

  for (let page = 1; page <= 8; page += 1) {
    const params = new URLSearchParams({
      include: "country;currentSeason;seasons",
      per_page: "50",
      page: String(page),
    })
    const data = await fetchJson(
      `https://api.sportmonks.com/v3/football/leagues?${params.toString()}`
    )

    leagues.push(...(data.data || []))

    if (!data.pagination?.has_more) break
  }

  return leagues
}

const leagues = await fetchLeagues()
const terms =
  /women|femin|nwsl|liga bpi|champions league|euro/i

const hits = leagues
  .filter((league) =>
    terms.test(
      [
        league.name,
        league.country?.name,
        league.type,
        league.sub_type,
      ]
        .filter(Boolean)
        .join(" ")
    )
  )
  .slice(0, 60)
  .map((league) => ({
    id: league.id,
    name: league.name,
    country: league.country?.name || null,
    currentSeason:
      league.currentSeason || league.currentseason || null,
    seasons: (league.seasons || [])
      .slice()
      .sort((a, b) => b.name.localeCompare(a.name))
      .slice(0, 8)
      .map((season) => ({
        id: season.id,
        name: season.name,
      })),
  }))

console.log(
  JSON.stringify(
    {
      total: leagues.length,
      hits: hits.length,
      leagues: hits,
    },
    null,
    2
  )
)
