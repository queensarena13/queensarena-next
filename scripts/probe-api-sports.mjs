import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"

function loadLocalEnv() {
  const envPath = join(process.cwd(), ".env.local")

  if (!existsSync(envPath)) {
    return
  }

  const lines = readFileSync(envPath, "utf8").split(
    /\r?\n/
  )

  for (const line of lines) {
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

loadLocalEnv()

const key =
  process.env.API_SPORTS_KEY ||
  process.env.APISPORTS_KEY ||
  process.env.API_FOOTBALL_KEY

if (!key) {
  console.error(
    "Missing API_SPORTS_KEY. Add it to .env.local or the current shell."
  )
  process.exit(1)
}

const footballBase =
  "https://v3.football.api-sports.io"
const handballBase =
  "https://v1.handball.api-sports.io"

const targets = [
  {
    sport: "football",
    label: "Liga BPI / Portugal women",
    base: footballBase,
    endpoint: "/leagues",
    params: {
      search: "Liga BPI",
    },
  },
  {
    sport: "football",
    label: "Taça de Portugal Feminina",
    base: footballBase,
    endpoint: "/leagues",
    params: {
      search: "Taca Portugal Women",
    },
  },
  {
    sport: "football",
    label: "UEFA Women's Champions League",
    base: footballBase,
    endpoint: "/leagues",
    params: {
      search: "Women Champions League",
    },
  },
  {
    sport: "football",
    label: "NWSL",
    base: footballBase,
    endpoint: "/leagues",
    params: {
      search: "NWSL",
    },
  },
  {
    sport: "football",
    label: "Women's Futsal",
    base: footballBase,
    endpoint: "/leagues",
    params: {
      search: "Futsal Women",
    },
  },
  {
    sport: "handball",
    label: "Portuguese women's handball",
    base: handballBase,
    endpoint: "/leagues",
    params: {
      search: "Portugal Women",
    },
  },
  {
    sport: "handball",
    label: "EHF Champions League Women",
    base: handballBase,
    endpoint: "/leagues",
    params: {
      search: "Champions League Women",
    },
  },
]

function toUrl({ base, endpoint, params }) {
  const url = new URL(`${base}${endpoint}`)

  for (const [name, value] of Object.entries(
    params
  )) {
    url.searchParams.set(name, value)
  }

  return url
}

async function request(target) {
  const url = toUrl(target)
  const response = await fetch(url, {
    headers: {
      "x-apisports-key": key,
    },
  })
  const data = await response.json()

  return {
    label: target.label,
    sport: target.sport,
    status: response.status,
    errors: data.errors || null,
    results: data.results || 0,
    sample: (data.response || [])
      .slice(0, 5)
      .map((item) => ({
        id: item.league?.id || item.id,
        name: item.league?.name || item.name,
        type: item.league?.type || item.type,
        country:
          item.country?.name ||
          item.country ||
          item.league?.country,
        seasons: (item.seasons || [])
          .slice(-3)
          .map((season) => season.year || season.season),
      })),
  }
}

const results = []

for (const target of targets) {
  try {
    results.push(await request(target))
  } catch (error) {
    results.push({
      label: target.label,
      sport: target.sport,
      status: "failed",
      error:
        error instanceof Error
          ? error.message
          : String(error),
    })
  }
}

console.log(JSON.stringify(results, null, 2))
