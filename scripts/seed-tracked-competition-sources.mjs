import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { createClient } from "@supabase/supabase-js"
import {
  HISTORICAL_SEASONS,
  TRACKED_COMPETITIONS,
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

function sourceType(source) {
  if (source === "api-sports" || source === "thesportsdb") {
    return "data_provider"
  }

  if (source === "manual") {
    return "official_site"
  }

  return "catalog"
}

function ingestionMethod(status) {
  if (status === "live-api") return "api_import"
  if (status === "provider-ready") return "provider_ready"
  return "manual_review"
}

function rightsStatus(status) {
  return status === "live-api"
    ? "provider_terms"
    : "needs_review"
}

function priorityFor(competition) {
  if (competition.region === "Portugal") return 100
  if (competition.region === "Europa") return 90
  if (competition.region === "Mundo") return 86
  return 78
}

const now = new Date().toISOString()
const sourceRows = []
const dataSourceRows = []

for (const competition of TRACKED_COMPETITIONS) {
  for (const season of HISTORICAL_SEASONS) {
    const slug = `tracked-${competition.key}-${season}`
    const ingestion = ingestionMethod(competition.sourceStatus)

    sourceRows.push({
      slug,
      name: competition.sourceLabel,
      sport: competition.sport,
      country:
        competition.region === "Portugal"
          ? "Portugal"
          : null,
      region: competition.region,
      competition: competition.name,
      season,
      source_url: competition.sourceUrl,
      source_type: sourceType(competition.source),
      ingestion_method: ingestion,
      parser_key:
        competition.sourceStatus === "live-api"
          ? "provider_api"
          : "manual_review",
      rights_status: rightsStatus(competition.sourceStatus),
      priority: priorityFor(competition),
      status:
        competition.sourceStatus === "live-api"
          ? "active"
          : "watchlist",
      notes: competition.note,
      updated_at: now,
    })

    dataSourceRows.push({
      provider: "QueensArena Catalog",
      sport: competition.sport,
      competition: competition.name,
      season,
      country:
        competition.region === "Portugal"
          ? "Portugal"
          : null,
      region: competition.region,
      source_url: competition.sourceUrl,
      provider_league_id: slug,
      enabled: true,
      coverage_level: ingestion,
      reliability:
        competition.sourceStatus === "live-api"
          ? "provider"
          : "official-watchlist",
      notes: competition.note,
      updated_at: now,
    })
  }
}

const { error: officialError } = await supabase
  .from("official_sources")
  .upsert(sourceRows, {
    onConflict: "slug,season",
  })

if (officialError) {
  console.warn(
    "official_sources table unavailable; continuing with data_sources only.",
    officialError.message
  )
}

const { error: dataSourcesError } = await supabase
  .from("data_sources")
  .upsert(dataSourceRows, {
    onConflict: "provider,competition,season",
  })

if (dataSourcesError) throw dataSourcesError

console.log(
  `Seeded ${sourceRows.length} tracked competition source rows.`
)
