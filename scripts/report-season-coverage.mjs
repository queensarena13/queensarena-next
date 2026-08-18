import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { createClient } from "@supabase/supabase-js"
import { TRACKED_COMPETITIONS } from "../lib/sports-config.ts"

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

function seasonFromDate(value) {
  const year = String(value || "").slice(0, 4)
  return /^\d{4}$/.test(year) ? year : null
}

function seasonOf(match) {
  const season = String(match.season || "")
  return /^\d{4}$/.test(season) ? season : seasonFromDate(match.starts_at)
}

const matches = await fetchAll(
  "matches",
  "sport,competition,season,starts_at,source,status"
)
const sources = await fetchAll(
  "data_sources",
  "sport,competition,season,provider,coverage_level,reliability"
)

const byCompetition = new Map()

for (const match of matches) {
  if (!match.sport || !match.competition) continue

  const key = `${match.sport}|${match.competition}`
  const season = seasonOf(match)

  if (!season) continue

  if (!byCompetition.has(key)) {
    byCompetition.set(key, {
      sport: match.sport,
      competition: match.competition,
      seasons: new Map(),
      sources: new Set(),
      total: 0,
    })
  }

  const entry = byCompetition.get(key)
  entry.total += 1
  entry.seasons.set(season, (entry.seasons.get(season) || 0) + 1)
  if (match.source) entry.sources.add(match.source)
}

const sourceKeys = new Set(
  sources.map((source) => `${source.sport}|${source.competition}|${source.season}`)
)

const tracked = TRACKED_COMPETITIONS.map((competition) => ({
  sport: competition.sport,
  competition: competition.name,
  source: competition.sourceLabel,
})).filter((item) => item.sport && item.competition)

const rows = [...byCompetition.values()]
  .map((entry) => {
    const sortedSeasons = [...entry.seasons.entries()].sort(
      ([a], [b]) => Number(b) - Number(a)
    )
    const weakSeasons = sortedSeasons
      .filter(([, count]) => count > 0 && count < 10)
      .map(([season, count]) => `${season}:${count}`)
    const latest = sortedSeasons[0]

    return {
      sport: entry.sport,
      competition: entry.competition,
      total: entry.total,
      seasons: sortedSeasons.length,
      latest: latest ? `${latest[0]} (${latest[1]})` : "-",
      weak: weakSeasons.slice(0, 4).join(", ") || "-",
      sources: [...entry.sources].join(", "),
    }
  })
  .sort((a, b) => b.total - a.total)

const missingTrackedRows = tracked
  .filter(
    (item) =>
      ![...byCompetition.keys()].some(
        (key) => key === `${item.sport}|${item.competition}`
      )
  )
  .map((item) => ({
    sport: item.sport,
    competition: item.competition,
    source: item.source,
  }))

const sourceOnlyRows = sources
  .filter(
    (source) =>
      !byCompetition.has(`${source.sport}|${source.competition}`) &&
      sourceKeys.has(`${source.sport}|${source.competition}|${source.season}`)
  )
  .slice(0, 20)
  .map((source) => ({
    sport: source.sport,
    competition: source.competition,
    season: source.season,
    provider: source.provider,
    level: source.coverage_level,
  }))

console.log(`Season coverage: ${matches.length} matches`)
console.table(rows.slice(0, 50))

if (missingTrackedRows.length > 0) {
  console.log("\nTracked competitions without matches")
  console.table(missingTrackedRows)
}

if (sourceOnlyRows.length > 0) {
  console.log("\nSources configured but still without matches")
  console.table(sourceOnlyRows)
}
