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

const currentYear = new Date().getUTCFullYear()
const maxScheduledYear = currentYear + 2
const matches = await fetchAll(
  "matches",
  "id,external_id,source,season,starts_at,competition"
)
const dataSources = await fetchAll(
  "data_sources",
  "id,provider,sport,competition,season"
)

const invalidTickerRows = matches.filter((match) => {
  if (match.source !== "EHF Ticker") return false

  const startYear = new Date(match.starts_at || "").getUTCFullYear()
  const seasonYear = Number(match.season || 0)

  return startYear > maxScheduledYear || seasonYear > maxScheduledYear
})

for (const row of invalidTickerRows) {
  const { error } = await supabase
    .from("matches")
    .delete()
    .eq("id", row.id)

  if (error) throw error
}

const staleSourceRows = dataSources.filter((source) => {
  if (
    source.provider === "EHF Ticker" &&
    source.competition === "European Games Women"
  ) {
    return true
  }

  if (
    source.provider === "TheSportsDB" &&
    source.competition === "Women's EHF Champions League"
  ) {
    return true
  }

  if (
    source.provider === "API-SPORTS" &&
    source.sport === "Handball" &&
    source.competition === "Serie A Women"
  ) {
    return true
  }

  return false
})

for (const row of staleSourceRows) {
  const { error } = await supabase
    .from("data_sources")
    .delete()
    .eq("id", row.id)

  if (error) throw error
}

console.log(
  `Cleaned ${invalidTickerRows.length} implausible future EHF ticker match(es) and ${staleSourceRows.length} stale source row(s).`
)
