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
    .replace(/\\u0027/g, "'")
    .replace(/\\u2014/g, "-")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim()
}

function seasonFromDate(value) {
  const year = String(value || "").slice(0, 4)
  return /^\d{4}$/.test(year) ? year : String(new Date().getUTCFullYear())
}

function sportFromTitle(title) {
  return /beach handball/i.test(title) ? "Beach Handball" : "Handball"
}

function shouldTrack(title) {
  return (
    /women|women's|womens|female/i.test(title) ||
    /beach handball/i.test(title) ||
    /men's and women's/i.test(title)
  )
}

const response = await fetch("https://www.ihf.info/", {
  headers: {
    "User-Agent": "QueensArena data importer",
  },
})

if (!response.ok) {
  throw new Error(`IHF HTTP ${response.status}`)
}

const html = await response.text()
const defaultDateIndex = html.lastIndexOf('"defaultDate"')
const eventsIndex =
  defaultDateIndex > -1
    ? html.lastIndexOf('[{"title"', defaultDateIndex)
    : -1

if (eventsIndex === -1 || defaultDateIndex === -1) {
  throw new Error("Could not find IHF calendar events.")
}

const eventsJson = html.slice(
  eventsIndex,
  html.lastIndexOf("]", defaultDateIndex) + 1
)

const events = JSON.parse(eventsJson)
const rowsByKey = new Map()

for (const row of events
  .map((event) => ({
    title: decodeHtml(event.title),
    start: event.start,
    url: event.url,
    id: event.id,
  }))
  .filter((event) => event.title && shouldTrack(event.title))
  .map((event) => ({
    provider: "IHF",
    sport: sportFromTitle(event.title),
    competition: event.title,
    season: seasonFromDate(event.start),
    country: null,
    region: "Mundo",
    provider_league_id: String(event.id || event.url || event.title),
    provider_season_id: seasonFromDate(event.start),
    source_url: event.url
      ? new URL(event.url, "https://www.ihf.info").toString()
      : "https://www.ihf.info/",
    enabled: true,
    coverage_level: "official-calendar",
    reliability: "official-page",
    notes:
      "Evento oficial IHF acompanhado como fonte de calendário; jogos detalhados dependem de feed específico.",
    updated_at: new Date().toISOString(),
  }))) {
  rowsByKey.set(
    `${row.provider}:${row.competition}:${row.season}`,
    row
  )
}

const rows = [...rowsByKey.values()]

if (rows.length > 0) {
  const { error } = await supabase
    .from("data_sources")
    .upsert(rows, {
      onConflict: "provider,competition,season",
    })

  if (error) throw error
}

console.log(`Synced ${rows.length} IHF official calendar events.`)
