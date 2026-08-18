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
const inputPath = process.argv[2]

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
  )
}

if (!inputPath) {
  throw new Error(
    "Usage: node scripts/import-official-catalog.mjs <catalog.csv|catalog.json>"
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
    return Array.isArray(data) ? data : data.items || []
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

function numberOrNull(value) {
  if (!value) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function stableId(parts) {
  return `qa-official-${parts
    .filter(Boolean)
    .join(":")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")}`
}

const rawRows = parseInput(resolvedInputPath)
const now = new Date().toISOString()
const teamRows = []
const playerRows = []

for (const row of rawRows) {
  const entityType = valueOf(row, "entity_type", "type").toLowerCase()
  const name = valueOf(row, "name", "team_name", "player_name")
  const sport = valueOf(row, "sport") || "Football"
  const season = valueOf(row, "season") || null
  const country = valueOf(row, "country") || null
  const region = valueOf(row, "region") || country
  const sourceUrl = valueOf(row, "source_url", "url") || null

  if (!name) continue

  if (entityType === "team" || valueOf(row, "team_name")) {
    teamRows.push({
      external_id:
        valueOf(row, "external_id") ||
        stableId(["team", sport, name, season || ""]),
      provider: "QueensArena Official",
      name,
      sport,
      country,
      region,
      logo_url: valueOf(row, "logo_url") || null,
      data_status: "verified",
      source_url: sourceUrl,
      updated_at: now,
    })
    continue
  }

  playerRows.push({
    external_id:
      valueOf(row, "external_id") ||
      stableId([
        "player",
        sport,
        name,
        valueOf(row, "team"),
        season || "",
      ]),
    provider: "QueensArena Official",
    name,
    sport,
    position: valueOf(row, "position") || null,
    nationality: valueOf(row, "nationality") || country,
    age: numberOrNull(valueOf(row, "age")),
    goals: numberOrNull(valueOf(row, "goals")) || 0,
    assists: numberOrNull(valueOf(row, "assists")) || 0,
    appearances:
      numberOrNull(valueOf(row, "appearances")) || 0,
    image_url: valueOf(row, "image_url") || null,
    season,
    data_status: "verified",
    source_url: sourceUrl,
    updated_at: now,
  })
}

if (teamRows.length > 0) {
  const { error } = await supabase
    .from("teams")
    .upsert(teamRows, {
      onConflict: "name",
    })

  if (error) throw error
}

if (playerRows.length > 0) {
  const { data: existing, error: existingError } =
    await supabase
      .from("players")
      .select("external_id")
      .eq("provider", "QueensArena Official")

  if (existingError) throw existingError

  const existingIds = new Set(
    (existing || []).map((item) => item.external_id)
  )
  const newRows = playerRows.filter(
    (row) => !existingIds.has(row.external_id)
  )

  if (newRows.length > 0) {
    const { error } = await supabase
      .from("players")
      .insert(newRows)

    if (error) throw error
  }
}

console.log(
  `Imported ${teamRows.length} official teams and ${playerRows.length} official players from ${resolvedInputPath}.`
)
