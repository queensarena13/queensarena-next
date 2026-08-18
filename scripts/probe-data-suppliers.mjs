import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"

function loadEnvFile(fileName) {
  const envPath = join(process.cwd(), fileName)

  if (!existsSync(envPath)) {
    return
  }

  for (const line of readFileSync(envPath, "utf8").split(
    /\r?\n/
  )) {
    const trimmed = line.trim()

    if (
      !trimmed ||
      trimmed.startsWith("#") ||
      !trimmed.includes("=")
    ) {
      continue
    }

    const [name, ...parts] = trimmed.split("=")
    const value = parts.join("=").trim()

    if (!process.env[name]) {
      process.env[name] = value.replace(
        /^["']|["']$/g,
        ""
      )
    }
  }
}

loadEnvFile(".env.local")
loadEnvFile(".env.vercel.local")

function summarizeApiSportsLeague(item) {
  return {
    id: item.league?.id || item.id,
    name: item.league?.name || item.name,
    type: item.league?.type || item.type,
    country:
      item.country?.name ||
      item.country ||
      item.league?.country,
    seasons: (item.seasons || [])
      .slice(-4)
      .map((season) => season.year || season.season),
  }
}

async function apiSportsFootball(search) {
  const key = process.env.API_SPORTS_KEY

  if (!key) {
    return { missing: true }
  }

  const url = new URL(
    "https://v3.football.api-sports.io/leagues"
  )
  url.searchParams.set("search", search)
  const response = await fetch(url, {
    headers: {
      "x-apisports-key": key,
    },
  })
  const json = await response.json()

  return {
    status: response.status,
    errors: json.errors || null,
    results: json.results || 0,
    sample: (json.response || [])
      .slice(0, 6)
      .map(summarizeApiSportsLeague),
  }
}

async function apiSportsHandball(search) {
  const key = process.env.API_SPORTS_KEY

  if (!key) {
    return { missing: true }
  }

  const url = new URL(
    "https://v1.handball.api-sports.io/leagues"
  )
  url.searchParams.set("search", search)
  const response = await fetch(url, {
    headers: {
      "x-apisports-key": key,
    },
  })
  const json = await response.json()

  return {
    status: response.status,
    errors: json.errors || null,
    results: json.results || 0,
    sample: (json.response || [])
      .slice(0, 6)
      .map(summarizeApiSportsLeague),
  }
}

async function sportmonksLeagues(search) {
  const token = process.env.SPORTMONKS_API_TOKEN

  if (!token) {
    return { missing: true }
  }

  const all = []

  for (let page = 1; page <= 3; page += 1) {
    const url = new URL(
      "https://api.sportmonks.com/v3/football/leagues"
    )
    url.searchParams.set(
      "include",
      "country;currentSeason;seasons"
    )
    url.searchParams.set("per_page", "50")
    url.searchParams.set("page", String(page))

    const response = await fetch(url, {
      headers: {
        Authorization: token,
        Accept: "application/json",
      },
    })
    const json = await response.json()

    if (!response.ok) {
      return {
        status: response.status,
        errors: json.message || json.errors || json,
      }
    }

    all.push(...(json.data || []))

    if (!json.pagination?.has_more) {
      break
    }
  }

  const normalized = search.toLowerCase()
  const matches = all.filter((league) =>
    [
      league.name,
      league.country?.name,
      league.type,
      league.sub_type,
    ]
      .filter(Boolean)
      .some((value) =>
        String(value)
          .toLowerCase()
          .includes(normalized)
      )
  )

  return {
    status: 200,
    scanned: all.length,
    results: matches.length,
    sample: matches.slice(0, 8).map((league) => ({
      id: league.id,
      name: league.name,
      country: league.country?.name || null,
      currentSeason:
        league.currentSeason?.id ||
        league.currentseason?.id ||
        null,
      seasons: (league.seasons || [])
        .slice(-4)
        .map((season) => season.name),
    })),
  }
}

async function highlightlyLeagues(search) {
  const key = process.env.HIGHLIGHTLY_API_KEY

  if (!key) {
    return { missing: true }
  }

  const url = new URL(
    "https://soccer.highlightly.net/leagues"
  )
  url.searchParams.set("leagueName", search)
  url.searchParams.set("limit", "10")
  const response = await fetch(url, {
    headers: {
      "x-rapidapi-key": key,
      "x-rapidapi-host":
        "football-highlights-api.p.rapidapi.com",
    },
  })
  const json = await response.json()
  const data = json.data || []

  return {
    status: response.status,
    results: data.length,
    sample: data.slice(0, 6).map((league) => ({
      id: league.id,
      name: league.name,
      country: league.country?.name || null,
      seasons: (league.seasons || [])
        .slice(-4)
        .map((season) => season.season),
    })),
  }
}

const checks = [
  ["API-SPORTS Football", "Liga BPI", () => apiSportsFootball("Liga BPI")],
  ["API-SPORTS Football", "NWSL", () => apiSportsFootball("NWSL")],
  ["API-SPORTS Football", "Women Champions", () => apiSportsFootball("Women Champions")],
  ["API-SPORTS Football", "Futsal Women", () => apiSportsFootball("Futsal Women")],
  ["API-SPORTS Handball", "Portugal Women", () => apiSportsHandball("Portugal Women")],
  ["API-SPORTS Handball", "Champions League Women", () => apiSportsHandball("Champions League Women")],
  ["Sportmonks", "women", () => sportmonksLeagues("women")],
  ["Sportmonks", "portugal", () => sportmonksLeagues("portugal")],
  ["Sportmonks", "champions", () => sportmonksLeagues("champions")],
  ["Highlightly", "Liga BPI", () => highlightlyLeagues("Liga BPI")],
  ["Highlightly", "NWSL", () => highlightlyLeagues("NWSL")],
  ["Highlightly", "Women", () => highlightlyLeagues("Women")],
]

const report = []

for (const [provider, query, run] of checks) {
  try {
    report.push({
      provider,
      query,
      result: await run(),
    })
  } catch (error) {
    report.push({
      provider,
      query,
      error:
        error instanceof Error
          ? error.message
          : String(error),
    })
  }
}

console.log(JSON.stringify(report, null, 2))
