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

function decodeHtml(value) {
  return String(value || "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#8211;/g, "-")
    .replace(/\s+/g, " ")
    .trim()
}

function canonicalCompetition(value) {
  const text = decodeHtml(value)

  if (/champions league/i.test(text)) {
    return "EHF Champions League Women"
  }

  if (/european games/i.test(text)) {
    return "European Games Women"
  }

  if (/youth club trophy/i.test(text)) {
    return "EHF Youth Club Trophy Women"
  }

  return text.replace(/\s+W$/, " Women")
}

function startsAt(matchId, dateTime) {
  const year = Number(String(matchId).slice(0, 4)) || new Date().getFullYear()
  const match = String(dateTime || "").match(
    /(\d{2})\.(\d{2}),\s*(\d{1,2}):(\d{2})/
  )

  if (!match) return null

  const [, day, month, hour, minute] = match

  return `${year}-${month}-${day}T${hour.padStart(2, "0")}:${minute}:00Z`
}

function isPlausibleTickerStart(value) {
  const year = new Date(value).getUTCFullYear()
  const currentYear = new Date().getUTCFullYear()

  return year >= currentYear - 1 && year <= currentYear + 1
}

function parseRows(html) {
  const rows = []
  const rowRegex = /<tr id="M_([^"]+)" class="match"[\s\S]*?<\/tr>/g
  let rowMatch

  while ((rowMatch = rowRegex.exec(html))) {
    const id = rowMatch[1]
    const row = rowMatch[0]
    const cells = [
      ...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g),
    ].map((match) => decodeHtml(match[1]))

    if (cells.length < 7) continue

    const [dateTime, place, competition, , homeTeam, , awayTeam] = cells
    const isWomen =
      /\bW\b|women|female/i.test(competition)

    if (!isWomen) continue

    const start = startsAt(id, dateTime)
    if (!start || !homeTeam || !awayTeam) continue
    if (!isPlausibleTickerStart(start)) continue

    rows.push({
      external_id: `ehf-ticker-${id}`,
      sport: "Handball",
      home_team: homeTeam,
      away_team: awayTeam,
      home_score: 0,
      away_score: 0,
      venue: place || "EHF",
      status: "SCHEDULED",
      starts_at: start,
      competition: canonicalCompetition(competition),
      source: "EHF Ticker",
      region: "Europa",
      season: String(new Date(start).getUTCFullYear()),
      data_status: "imported",
      source_url: "https://ticker.ehf.eu/",
      updated_at: new Date().toISOString(),
    })
  }

  return rows
}

const response = await fetch("https://ticker.ehf.eu/", {
  headers: {
    "User-Agent": "QueensArena data importer",
  },
})

if (!response.ok) {
  throw new Error(`EHF Ticker HTTP ${response.status}`)
}

const html = await response.text()
const rows = parseRows(html)

if (rows.length > 0) {
  const { error } = await supabase
    .from("matches")
    .upsert(rows, {
      onConflict: "external_id",
    })

  if (error) throw error
}

const teams = new Map()

for (const row of rows) {
  for (const name of [row.home_team, row.away_team]) {
    teams.set(name, {
      name,
      sport: "Handball",
      country: null,
      region: "Europa",
      provider: "EHF Ticker",
      external_id: null,
      data_status: "imported",
      source_url: "https://ticker.ehf.eu/",
      updated_at: new Date().toISOString(),
    })
  }
}

if (teams.size > 0) {
  const { error } = await supabase
    .from("teams")
    .upsert([...teams.values()], {
      onConflict: "name",
    })

  if (error) throw error
}

const sourceRows = [
  ...new Set(rows.map((row) => row.competition)),
].map((competition) => ({
  provider: "EHF Ticker",
  sport: "Handball",
  competition,
  season: String(new Date().getUTCFullYear()),
  region: "Europa",
  source_url: "https://ticker.ehf.eu/",
  enabled: true,
  coverage_level: "official-ticker",
  reliability: "official-page",
  updated_at: new Date().toISOString(),
}))

if (sourceRows.length > 0) {
  const { error } = await supabase
    .from("data_sources")
    .upsert(sourceRows, {
      onConflict: "provider,competition,season",
    })

  if (error) throw error
}

console.log(
  `Synced ${rows.length} EHF ticker matches and ${teams.size} teams.`
)
