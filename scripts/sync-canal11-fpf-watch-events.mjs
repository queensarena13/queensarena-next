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

const PROVIDER = "Canal 11 / FPF Watch"
const API_URL = "https://fpf.watch.pixellot.tv/api/event/list"
const PUBLIC_URL = "https://www.canal11.pt/"
const MAX_PAGES = Number(process.env.CANAL11_MAX_PAGES || 80)

function normalize(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
}

function looksFemale(value) {
  const text = normalize(value)

  return (
    text.includes("female") ||
    text.includes("women") ||
    text.includes("feminina") ||
    text.includes("feminino") ||
    text.includes("fem placard") ||
    text.includes("liga bpi")
  )
}

function isWomenEvent(event) {
  if (normalize(event.gender) === "female") return true
  if (looksFemale(event.title)) return true
  if (looksFemale(event.eventTeams?.homeTeam?.name)) return true
  if (looksFemale(event.eventTeams?.awayTeam?.name)) return true

  return (event.mediaIdentities || []).some(
    (identity) =>
      looksFemale(identity.title) ||
      (identity.mediaParentIdentities || []).some((parent) =>
        looksFemale(parent.title)
      )
  )
}

function sportName(value) {
  const text = normalize(value)

  if (text === "soccer") return "Football"
  if (text === "futsal") return "Futsal"

  return value || "Football"
}

function cleanTeamName(value) {
  return String(value || "")
    .replace(/\s*\([^)]*\)\s*$/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

function competitionName(event) {
  const parent = (event.mediaIdentities || [])
    .flatMap((identity) => identity.mediaParentIdentities || [])
    .map((identity) => identity.title)
    .find(Boolean)

  const title = parent || event.title || "Canal 11"

  return String(title)
    .replace(/\s+\d{4}\/\d{4}\s*$/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

function seasonFromEvent(event, startsAt) {
  const labelledSeason = JSON.stringify(event).match(/20\d{2}\/20\d{2}/)?.[0]

  if (labelledSeason) return labelledSeason

  const date = new Date(startsAt)
  const year = date.getUTCFullYear()
  const month = date.getUTCMonth() + 1

  return month >= 7 ? `${year}/${year + 1}` : `${year - 1}/${year}`
}

function timestampToIso(value) {
  const timestamp = Number(value)

  if (!Number.isFinite(timestamp) || timestamp <= 0) return null

  return new Date(timestamp).toISOString()
}

function eventUrl(event) {
  const id = event.event_id || event._id

  return id
    ? `${PUBLIC_URL}events/${encodeURIComponent(id)}`
    : PUBLIC_URL
}

function mapEvent(event) {
  const startsAt = timestampToIso(event.gameStartDate || event.event_date)
  const homeTeam = cleanTeamName(
    event.eventTeams?.homeTeam?.shortName ||
      event.eventTeams?.homeTeam?.name
  )
  const awayTeam = cleanTeamName(
    event.eventTeams?.awayTeam?.shortName ||
      event.eventTeams?.awayTeam?.name
  )
  const id = event.event_id || event._id

  if (!startsAt || !homeTeam || !awayTeam || !id) return null

  const status =
    normalize(event.status) === "archived"
      ? "FINISHED"
      : normalize(event.status) === "live"
        ? "LIVE"
        : "SCHEDULED"

  return {
    external_id: `canal11-${id}`,
    sport: sportName(event.sportType),
    home_team: homeTeam,
    away_team: awayTeam,
    home_score: null,
    away_score: null,
    status,
    venue: "Canal 11",
    starts_at: startsAt,
    competition: competitionName(event),
    source: PROVIDER,
    region: "Portugal",
    season: seasonFromEvent(event, startsAt),
    gender: "women",
    data_status: status === "FINISHED" ? "verified" : "scheduled",
    source_url: eventUrl(event),
    updated_at: new Date().toISOString(),
  }
}

async function fetchPage(status, page) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: "HALO",
      "Content-Type": "application/json",
      "User-Agent": "QueensArena data importer",
    },
    body: JSON.stringify({
      page,
      size: 50,
      next: true,
      count: true,
      filters: { status },
    }),
  })

  if (!response.ok) {
    throw new Error(`Canal 11 ${status} page ${page} HTTP ${response.status}`)
  }

  const data = await response.json()
  return data.content || { entries: [], nextExists: false }
}

async function fetchStatus(status) {
  const rows = []
  const report = []

  for (let page = 0; page < MAX_PAGES; page += 1) {
    const content = await fetchPage(status, page)
    const entries = content.entries || []
    const womenRows = entries.filter(isWomenEvent).map(mapEvent).filter(Boolean)

    rows.push(...womenRows)
    report.push({
      status,
      page,
      received: entries.length,
      women: womenRows.length,
    })

    if (!content.nextExists || entries.length === 0) break

    await new Promise((resolve) => setTimeout(resolve, 200))
  }

  return { rows, report }
}

const statuses = ["live", "upcoming", "archived"]
const byExternalId = new Map()
const reports = []

for (const status of statuses) {
  const { rows, report } = await fetchStatus(status)

  for (const row of rows) {
    byExternalId.set(row.external_id, row)
  }

  reports.push(...report)
}

const matchRows = [...byExternalId.values()]

if (matchRows.length > 0) {
  const { error } = await supabase.from("matches").upsert(matchRows, {
    onConflict: "external_id",
  })

  if (error) throw error
}

const teamsByName = new Map()

for (const row of matchRows) {
  for (const name of [row.home_team, row.away_team]) {
    if (!name || teamsByName.has(name)) continue

    teamsByName.set(name, {
      name,
      sport: row.sport,
      country: "Portugal",
      region: "Portugal",
      provider: PROVIDER,
      external_id: null,
      gender: "women",
      data_status: "verified",
      source_url: row.source_url,
      updated_at: new Date().toISOString(),
    })
  }
}

if (teamsByName.size > 0) {
  const { error } = await supabase
    .from("teams")
    .upsert([...teamsByName.values()], { onConflict: "name" })

  if (error) throw error
}

const sourcesByKey = new Map()

for (const row of matchRows) {
  const key = `${PROVIDER}|${row.competition}|${row.season}`

  sourcesByKey.set(key, {
    provider: PROVIDER,
    sport: row.sport,
    competition: row.competition,
    season: row.season,
    region: "Portugal",
    country: "Portugal",
    source_url: PUBLIC_URL,
    enabled: true,
    coverage_level: "official-broadcaster",
    reliability: "public-schedule",
    notes:
      "Eventos públicos do Canal 11/FPF Watch usados como calendário e histórico de transmissões. Resultados não são inventados quando a fonte não os publica.",
    updated_at: new Date().toISOString(),
  })
}

const sourceRows = [...sourcesByKey.values()]

if (sourceRows.length > 0) {
  const { error } = await supabase.from("data_sources").upsert(sourceRows, {
    onConflict: "provider,competition,season",
  })

  if (error) throw error
}

console.table(reports.filter((row) => row.women > 0))
console.log(
  `Synced ${matchRows.length} Canal 11/FPF Watch match(es), ${teamsByName.size} team(s), ${sourceRows.length} source row(s).`
)
