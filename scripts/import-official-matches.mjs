import { existsSync, readFileSync } from "node:fs"
import { extname, join, resolve } from "node:path"
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

const inputPath = process.argv[2]

if (!inputPath) {
  throw new Error(
    "Usage: node scripts/import-official-matches.mjs <matches.csv|matches.json>"
  )
}

const resolvedInputPath = resolve(process.cwd(), inputPath)

if (!existsSync(resolvedInputPath)) {
  throw new Error(`Input file not found: ${resolvedInputPath}`)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

function parseCsv(text) {
  const rows = []
  let field = ""
  let row = []
  let quoted = false

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]
    const next = text[index + 1]

    if (char === "\"" && quoted && next === "\"") {
      field += "\""
      index += 1
      continue
    }

    if (char === "\"") {
      quoted = !quoted
      continue
    }

    if (char === "," && !quoted) {
      row.push(field)
      field = ""
      continue
    }

    if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") {
        index += 1
      }
      row.push(field)
      field = ""

      if (row.some((value) => value.trim())) {
        rows.push(row)
      }
      row = []
      continue
    }

    field += char
  }

  row.push(field)
  if (row.some((value) => value.trim())) {
    rows.push(row)
  }

  const [headers = [], ...records] = rows
  const keys = headers.map((header) =>
    header.trim().toLowerCase()
  )

  return records.map((record) =>
    Object.fromEntries(
      keys.map((key, index) => [
        key,
        (record[index] || "").trim(),
      ])
    )
  )
}

function parseInput(filePath) {
  const text = readFileSync(filePath, "utf8")
  const extension = extname(filePath).toLowerCase()

  if (extension === ".json") {
    const data = JSON.parse(text)
    return Array.isArray(data) ? data : data.matches || []
  }

  return parseCsv(text)
}

function valueOf(row, ...keys) {
  for (const key of keys) {
    const value = row[key] ?? row[key.toLowerCase()]

    if (value !== undefined && value !== null && String(value).trim()) {
      return String(value).trim()
    }
  }

  return ""
}

function scoreValue(value) {
  if (value === "") return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function toIsoDate(value) {
  if (!value) return null
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  return date.toISOString()
}

function stableExternalId(row) {
  return [
    valueOf(row, "source_slug", "source"),
    valueOf(row, "competition"),
    valueOf(row, "season"),
    valueOf(row, "starts_at", "date", "datetime"),
    valueOf(row, "home_team", "home"),
    valueOf(row, "away_team", "away"),
  ]
    .join("|")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

const rawRows = parseInput(resolvedInputPath)
const now = new Date().toISOString()

const rows = rawRows
  .map((row) => {
    const home = valueOf(row, "home_team", "home")
    const away = valueOf(row, "away_team", "away")
    const startsAt = toIsoDate(
      valueOf(row, "starts_at", "date", "datetime")
    )
    const competition = valueOf(row, "competition")
    const sport = valueOf(row, "sport") || "Football"
    const season = valueOf(row, "season") || "2024"
    const sourceSlug =
      valueOf(row, "source_slug", "source") ||
      "queensarena-official"

    if (!home || !away || !startsAt || !competition) {
      return null
    }

    return {
      external_id:
        valueOf(row, "external_id") ||
        `qa-official-${stableExternalId(row)}`,
      sport,
      home_team: home,
      away_team: away,
      home_score: scoreValue(
        valueOf(row, "home_score", "score_home")
      ),
      away_score: scoreValue(
        valueOf(row, "away_score", "score_away")
      ),
      venue: valueOf(row, "venue"),
      status:
        valueOf(row, "status") ||
        (scoreValue(valueOf(row, "home_score")) === null
          ? "SCHEDULED"
          : "FINISHED"),
      starts_at: startsAt,
      competition,
      source: "QueensArena Official",
      region: valueOf(row, "region", "country"),
      season,
      gender: "women",
      data_status: "verified",
      source_url: valueOf(row, "source_url", "url"),
      updated_at: now,
      source_slug: sourceSlug,
    }
  })
  .filter(Boolean)

const matchRows = rows.map((row) => {
  const matchRow = { ...row }
  delete matchRow.source_slug
  return matchRow
})

if (matchRows.length > 0) {
  const { error } = await supabase
    .from("matches")
    .upsert(matchRows, {
      onConflict: "external_id",
    })

  if (error) throw error
}

const teamRows = new Map()

for (const row of rows) {
  for (const name of [row.home_team, row.away_team]) {
    teamRows.set(`${row.sport}:${name}`, {
      name,
      sport: row.sport,
      country: row.region || null,
      region: row.region || null,
      provider: "QueensArena Official",
      data_status: "verified",
      source_url: row.source_url || null,
      updated_at: now,
    })
  }
}

if (teamRows.size > 0) {
  const { error } = await supabase
    .from("teams")
    .upsert([...teamRows.values()], {
      onConflict: "name",
    })

  if (error) throw error
}

const runRow = {
  source_slug:
    rows[0]?.source_slug || "queensarena-official",
  sport: rows[0]?.sport || "Football",
  competition: rows[0]?.competition || null,
  season: rows[0]?.season || null,
  source_url: rows[0]?.source_url || null,
  input_file: resolvedInputPath,
  status: "completed",
  imported_matches: matchRows.length,
  imported_teams: teamRows.size,
}

const { error: runError } = await supabase
  .from("official_import_runs")
  .insert(runRow)

if (runError) throw runError

console.log(
  `Imported ${matchRows.length} official matches and ${teamRows.size} teams from ${resolvedInputPath}.`
)
