import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { createClient } from "@supabase/supabase-js"

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

const thresholds = {
  matches: 9200,
  teams: 800,
  players: 3000,
  data_sources: 580,
  roster_memberships: 2000,
  player_season_stats: 4000,
  standings: 1400,
  team_season_stats: 1400,
}

const badEncoding =
  /\uFFFD|ï¿½|Ã[\u0080-\u00bf¡-¿]|Â[\u0080-\u00bf¡-¿]/
const genericCompetitionNames = new Set([
  "1a Divisao - Women",
  "1a Divisao Women",
  "1º Liga Feminina",
  "1ª Liga Feminina",
  "Liga Feminina",
  "Campeonato Nacional",
])
const demoPlayerNames = new Set([
  "Marta Silva",
  "Ana Costa",
  "Jessica Moore",
])

async function countRows(table) {
  const { count, error } = await supabase
    .from(table)
    .select("*", {
      count: "exact",
      head: true,
    })

  if (error) throw error

  return count || 0
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

function rowText(row, keys) {
  return keys
    .map((key) => row[key])
    .filter((value) => value !== null && value !== undefined)
    .join(" ")
}

const failures = []
const warnings = []
const counts = {}

for (const [table, minimum] of Object.entries(thresholds)) {
  counts[table] = await countRows(table)

  if (counts[table] < minimum) {
    failures.push(
      `${table}: ${counts[table]}/${minimum} rows`
    )
  }
}

const matches = await fetchAll(
  "matches",
  "id,sport,competition,venue,home_team,away_team,region,status,source,season,starts_at"
)
const sources = await fetchAll(
  "data_sources",
  "id,provider,sport,competition,region,country,coverage_level,reliability"
)
const teams = await fetchAll(
  "teams",
  "id,name,sport,country,region,provider"
)
const players = await fetchAll(
  "players",
  "id,name,sport,position,nationality,provider"
)

const matchGeneric = matches.filter((row) =>
  genericCompetitionNames.has(row.competition)
)
const sourceGeneric = sources.filter((row) =>
  genericCompetitionNames.has(row.competition)
)

if (matchGeneric.length > 0) {
  failures.push(
    `matches with generic competition names: ${matchGeneric.length}`
  )
}

if (sourceGeneric.length > 0) {
  failures.push(
    `data_sources with generic competition names: ${sourceGeneric.length}`
  )
}

const currentYear = new Date().getUTCFullYear()
const maxScheduledYear = currentYear + 2
const implausibleFutureMatches = matches.filter((row) => {
  const startYear = new Date(row.starts_at || "").getUTCFullYear()
  const seasonYear = Number(row.season || 0)

  return startYear > maxScheduledYear || seasonYear > maxScheduledYear
})

if (implausibleFutureMatches.length > 0) {
  failures.push(
    `matches scheduled beyond ${maxScheduledYear}: ${implausibleFutureMatches.length}`
  )
}

const encodedRows = [
  ...matches.map((row) => ({
    table: "matches",
    id: row.id,
    text: rowText(row, [
      "sport",
      "competition",
      "venue",
      "home_team",
      "away_team",
      "region",
    ]),
  })),
  ...sources.map((row) => ({
    table: "data_sources",
    id: row.id,
    text: rowText(row, [
      "provider",
      "sport",
      "competition",
      "region",
      "country",
    ]),
  })),
  ...teams.map((row) => ({
    table: "teams",
    id: row.id,
    text: rowText(row, [
      "name",
      "sport",
      "country",
      "region",
      "provider",
    ]),
  })),
  ...players.map((row) => ({
    table: "players",
    id: row.id,
    text: rowText(row, [
      "name",
      "sport",
      "position",
      "nationality",
      "provider",
    ]),
  })),
].filter((row) => badEncoding.test(row.text))

if (encodedRows.length > 0) {
  failures.push(
    `rows with broken encoding markers: ${encodedRows.length}`
  )
}

const demoPlayers = players.filter((row) => demoPlayerNames.has(row.name))

if (demoPlayers.length > 0) {
  failures.push(`demo player rows still present: ${demoPlayers.length}`)
}

const sports = new Set(matches.map((row) => row.sport).filter(Boolean))

for (const requiredSport of ["Football", "Handball"]) {
  if (!sports.has(requiredSport)) {
    failures.push(`missing sport in matches: ${requiredSport}`)
  }
}

for (const requiredSport of ["Futsal", "Beach Handball"]) {
  if (!sources.some((row) => row.sport === requiredSport)) {
    warnings.push(`missing source coverage for ${requiredSport}`)
  }
}

console.log("Data quality counts")
console.table(counts)

if (warnings.length > 0) {
  console.log("\nWarnings")
  for (const warning of warnings) {
    console.log(`WARN ${warning}`)
  }
}

if (failures.length > 0) {
  console.error("\nData quality failed")
  for (const failure of failures) {
    console.error(`FAIL ${failure}`)
  }

  if (encodedRows.length > 0) {
    console.error("\nEncoding samples")
    for (const row of encodedRows.slice(0, 10)) {
      console.error(`${row.table}#${row.id}: ${row.text}`)
    }
  }

  process.exit(1)
}

console.log("\nData quality passed.")
