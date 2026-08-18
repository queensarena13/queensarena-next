import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { createClient } from "@supabase/supabase-js"
import {
  SPORTS,
  TRACKED_COMPETITIONS,
  canonicalCompetitionDisplayName,
} from "../lib/sports-config.ts"

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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
  )
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

function normalize(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
}

function competitionKey(sport, competition) {
  return `${normalize(sport)}:${normalize(
    canonicalCompetitionDisplayName(competition, sport)
  )}`
}

function sportKeyFromName(name) {
  return SPORTS.find((sport) => sport.name === name)?.key || "football"
}

function seasonFromMatch(match) {
  if (match.season && /^\d{4}$/.test(String(match.season))) {
    return String(match.season)
  }

  const year = new Date(match.starts_at || "").getUTCFullYear()
  return Number.isFinite(year) ? String(year) : null
}

async function fetchAll(table, select) {
  const rows = []
  let from = 0
  const pageSize = 1000

  while (true) {
    const { data, error } = await supabase
      .from(table)
      .select(select)
      .range(from, from + pageSize - 1)

    if (error) throw error
    if (!data || data.length === 0) break

    rows.push(...data)

    if (data.length < pageSize) break
    from += pageSize
  }

  return rows
}

const [matches, sources] = await Promise.all([
  fetchAll(
    "matches",
    "sport,competition,season,starts_at"
  ),
  fetchAll(
    "data_sources",
    "sport,competition,region,country,enabled"
  ),
])

const matchSummary = new Map()

for (const match of matches) {
  if (!match.sport || !match.competition) continue

  const key = competitionKey(match.sport, match.competition)
  const summary =
    matchSummary.get(key) || {
      total: 0,
      seasons: new Map(),
    }
  const season = seasonFromMatch(match)

  summary.total += 1

  if (season) {
    summary.seasons.set(
      season,
      (summary.seasons.get(season) || 0) + 1
    )
  }

  matchSummary.set(key, summary)
}

const catalog = new Map()

for (const competition of TRACKED_COMPETITIONS) {
  catalog.set(
    competitionKey(competition.sport, competition.name),
    {
      name: competition.name,
      sport: competition.sport,
      region: competition.region,
      key: competition.key,
    }
  )
}

for (const source of sources) {
  if (!source.sport || !source.competition) continue

  const name = canonicalCompetitionDisplayName(
    source.competition,
    source.sport
  )
  const key = competitionKey(source.sport, name)

  if (!catalog.has(key)) {
    catalog.set(key, {
      name,
      sport: source.sport,
      region: source.region || source.country || "Global",
      key: `data-${normalize(source.sport).replaceAll(" ", "-")}-${normalize(
        source.region || source.country || "global"
      ).replaceAll(" ", "-")}-${normalize(name).replaceAll(" ", "-")}`,
    })
  }
}

const rows = []
const failures = []

for (const competition of catalog.values()) {
  const summary = matchSummary.get(
    competitionKey(competition.sport, competition.name)
  )

  if (!summary || summary.total === 0) continue

  const latestSeason = [...summary.seasons.keys()].sort(
    (a, b) => Number(b) - Number(a)
  )[0]

  const bestSeason =
    [...summary.seasons.entries()]
      .filter(([, count]) => count >= 10)
      .sort(
        (a, b) => Number(b[0]) - Number(a[0])
      )[0] ||
    [...summary.seasons.entries()].sort(
      (a, b) =>
        b[1] - a[1] ||
        Number(b[0]) - Number(a[0])
    )[0]

  const targetSeason = bestSeason?.[0] || latestSeason
  const targetSeasonMatches = targetSeason
    ? summary.seasons.get(targetSeason) || 0
    : 0

  const href = new URLSearchParams({
    sport: sportKeyFromName(competition.sport),
    region: competition.region,
    competition: competition.key,
    section: "standings",
  })

  if (targetSeason) {
    href.set("season", targetSeason)
  }

  rows.push({
    competition: competition.name,
    sport: competition.sport,
    total: summary.total,
    latestSeason: targetSeason || "missing",
    latestSeasonMatches: targetSeasonMatches,
    href: `/matches?${href.toString()}`,
  })

  if (!targetSeason || targetSeasonMatches === 0) {
    failures.push(
      `${competition.sport} / ${competition.name}: ${summary.total} total, no resolvable latest season`
    )
  }
}

console.log("Competition link coverage")
console.table(
  rows
    .sort((a, b) => b.total - a.total)
    .slice(0, 20)
)

if (failures.length > 0) {
  console.error("\nCompetition link verification failed")
  for (const failure of failures) {
    console.error(`FAIL ${failure}`)
  }
  process.exit(1)
}

console.log(
  `\nCompetition link verification passed for ${rows.length} competition(s) with matches.`
)
