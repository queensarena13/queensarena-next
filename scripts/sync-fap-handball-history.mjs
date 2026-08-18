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

const PROVIDER = "Federação de Andebol de Portugal"
const BASE_URL = "https://portal.fpa.pt"

const targets = [
  {
    id: 9553,
    competition: "Campeonato Nacional 1.ª Divisão Feminina de Andebol",
    sport: "Handball",
  },
  {
    id: 9554,
    competition: "Divisão de Honra Feminina de Andebol",
    sport: "Handball",
  },
  {
    id: 9555,
    competition: "Campeonato Nacional 2.ª Divisão Feminina de Andebol",
    sport: "Handball",
  },
  {
    id: 9562,
    competition: "Taça de Portugal Feminina de Andebol",
    sport: "Handball",
  },
  {
    id: 9563,
    competition: "Supertaça Feminina de Andebol",
    sport: "Handball",
  },
  {
    id: 9545,
    competition: "Taça Caldas da Rainha Sénior Feminina",
    sport: "Handball",
  },
  {
    id: 9534,
    competition: "Circuito Regional de Andebol de Praia Sénior Feminino",
    sport: "Beach Handball",
  },
  {
    id: 9543,
    competition: "Portugal Beach Handball Tour Sénior Feminino",
    sport: "Beach Handball",
  },
  {
    id: 9568,
    competition: "Circuito Regional de Andebol de Praia Sénior Feminino",
    sport: "Beach Handball",
  },
  {
    id: 9580,
    competition: "Circuito Regional de Andebol de Praia Sénior Feminino",
    sport: "Beach Handball",
  },
  {
    id: 9589,
    competition: "Circuito Regional de Andebol de Praia Sénior Feminino",
    sport: "Beach Handball",
  },
]

function decodeEntities(value) {
  return String(value || "")
    .replace(/\\u([\dA-Fa-f]{4})/g, (_, code) =>
      String.fromCharCode(Number.parseInt(code, 16))
    )
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#8211;/g, "-")
    .replace(/&#8217;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

function normalizeName(value) {
  return decodeEntities(value)
    .replace(/\s+/g, " ")
    .replace(/\s+([,/])/g, "$1")
    .trim()
}

function parseTableContent(html) {
  const marker = "var TABLE_CONTENT_1 = "
  const start = html.indexOf(marker)

  if (start < 0) return null

  const jsonStart = start + marker.length
  const end = html.indexOf(";\n", jsonStart)

  if (end < 0) return null

  return JSON.parse(html.slice(jsonStart, end))
}

function seasonFromLabel(value, date) {
  const label = String(value || "")
  const match = label.match(/(\d{4})\/(\d{2})/)

  if (match) {
    return String(Number(match[2]) + 2000)
  }

  return String(date || "").slice(0, 4)
}

function statusFromCode(row) {
  const code = String(row.JOGO_ESTADO_CODIGO || "")
  const hasScore =
    row.JOG_GOLOS_CASA !== undefined &&
    row.JOG_GOLOS_CASA !== null &&
    row.JOG_GOLOS_FORA !== undefined &&
    row.JOG_GOLOS_FORA !== null

  if (code === "50" || hasScore) return "FINISHED"
  if (code === "40") return "LIVE"
  if (code === "60") return "POSTPONED"

  return "SCHEDULED"
}

function toNumber(value) {
  if (value === "" || value === null || value === undefined) return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

function toMatchRow(row, target, phaseName) {
  const id = row.ID_PROVA_JOGO
  const home = normalizeName(row.EQUIPA_CASA)
  const away = normalizeName(row.EQUIPA_FORA)
  const date = row.JOG_DATA
  const time = row.JOG_HORA || "00:00"

  if (!id || !home || !away || !date) return null

  const status = statusFromCode(row)
  const sourceUrl = `${BASE_URL}/jogo/${id}/`

  return {
    external_id: `fap-${id}`,
    sport: target.sport,
    home_team: home,
    away_team: away,
    home_score: toNumber(row.JOG_GOLOS_CASA),
    away_score: toNumber(row.JOG_GOLOS_FORA),
    status,
    venue: normalizeName(row.REC_NOME || phaseName || target.competition),
    starts_at: `${date}T${time}:00+00:00`,
    competition: target.competition,
    source: PROVIDER,
    region: "Portugal",
    season: seasonFromLabel(row.EPOCA || row.PRO_DESCRICAO, date),
    gender: "women",
    data_status: status === "FINISHED" ? "verified" : "scheduled",
    source_url: sourceUrl,
    updated_at: new Date().toISOString(),
  }
}

async function fetchHtml(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "QueensArena data importer",
      Accept: "text/html",
    },
  })

  if (!response.ok) {
    throw new Error(`${url} HTTP ${response.status}`)
  }

  return response.text()
}

function rowsFromContent(content, target) {
  const rows = []
  const resultsTab = content?.tabs?.find((tab) => tab.id === "results")
  const phases = new Map(
    (resultsTab?.selectors || [])
      .flatMap((selector) => selector.options || [])
      .map((option) => [String(option.term_id), option.name])
  )

  for (const row of resultsTab?.rows || []) {
    const phaseName = phases.get(String(row.ID_FASE || "")) || ""
    const matchRow = toMatchRow(row, target, phaseName)
    if (matchRow) rows.push(matchRow)
  }

  return rows
}

const matchRowsById = new Map()
const sourceRowsByKey = new Map()
const report = []

for (const target of targets) {
  const url = `${BASE_URL}/prova/${target.id}/`
  const html = await fetchHtml(url)
  const content = parseTableContent(html)
  const rows = rowsFromContent(content, target)

  for (const row of rows) {
    matchRowsById.set(row.external_id, row)
  }

  const sourceKey = `${PROVIDER}|${target.competition}|2026`
  const existingSource = sourceRowsByKey.get(sourceKey)
  const sourceUrl = existingSource?.source_url
    ? `${existingSource.source_url}, ${url}`
    : url

  sourceRowsByKey.set(sourceKey, {
    provider: PROVIDER,
    sport: target.sport,
    competition: target.competition,
    season: "2026",
    region: "Portugal",
    country: "Portugal",
    provider_league_id: String(target.id),
    source_url: sourceUrl,
    enabled: true,
    coverage_level: "official-federation",
    reliability: "official-page",
    notes: "Dados importados da página oficial de prova da Federação de Andebol de Portugal.",
    updated_at: new Date().toISOString(),
  })

  report.push({
    id: target.id,
    competition: target.competition,
    rows: rows.length,
  })

  await new Promise((resolve) => setTimeout(resolve, 200))
}

const matchRows = [...matchRowsById.values()]

if (matchRows.length > 0) {
  const { error } = await supabase
    .from("matches")
    .upsert(matchRows, {
      onConflict: "external_id",
    })

  if (error) throw error
}

const teamRows = new Map()

for (const row of matchRows) {
  for (const name of [row.home_team, row.away_team]) {
    if (teamRows.has(name)) continue

    teamRows.set(name, {
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

if (teamRows.size > 0) {
  const { error } = await supabase
    .from("teams")
    .upsert([...teamRows.values()], {
      onConflict: "name",
    })

  if (error) throw error
}

const sourceRows = [...sourceRowsByKey.values()]

if (sourceRows.length > 0) {
  const { error } = await supabase
    .from("data_sources")
    .upsert(sourceRows, {
      onConflict: "provider,competition,season",
    })

  if (error) throw error
}

console.table(report)
console.log(
  `Synced ${matchRows.length} FAP match(es), ${teamRows.size} team(s), ${sourceRows.length} source row(s).`
)
