import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { createClient } from "@supabase/supabase-js"
import { OFFICIAL_SOURCES } from "../lib/official-sources-data.js"

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

const now = new Date().toISOString()

const officialRows = OFFICIAL_SOURCES.map((source) => ({
  ...source,
  updated_at: now,
}))

const dataSourceRows = OFFICIAL_SOURCES.map((source) => ({
  provider: "QueensArena Official",
  sport: source.sport,
  competition: source.competition,
  season: source.season,
  country: source.country,
  region: source.region,
  source_url: source.source_url,
  provider_league_id: source.slug,
  enabled: true,
  coverage_level: source.ingestion_method,
  reliability: "official",
  notes: source.notes,
  updated_at: now,
}))

const { error: sourcesError } = await supabase
  .from("official_sources")
  .upsert(officialRows, {
    onConflict: "slug,season",
  })

if (sourcesError) {
  console.warn(
    "official_sources table unavailable; continuing with data_sources only.",
    sourcesError.message
  )
}

const { error: dataSourcesError } = await supabase
  .from("data_sources")
  .upsert(dataSourceRows, {
    onConflict: "provider,competition,season",
  })

if (dataSourcesError) throw dataSourcesError

console.log(
  `Seeded ${officialRows.length} official QueensArena sources.`
)
