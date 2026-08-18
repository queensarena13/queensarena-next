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

const FPV_BASE = "https://www.portugalvoleibol.com/classificacao"
const SOURCE_URL = "https://www.portugalvoleibol.com/classificacao/index"
const PROVIDER = "Federação Portuguesa de Voleibol"

const targets = [
  {
    competition: "Liga Solverde.pt Feminina",
    sport: "Volleyball",
    action: "classificacoes",
    campeonato: "NSFI",
    phases: [
      { fase: "1", serie: ".", label: "1.ª Fase" },
      { fase: "2", serie: "A", label: "2.ª Fase Série A" },
      { fase: "2", serie: "A2", label: "2.ª Fase Série A2" },
      { fase: "2", serie: "P1", label: "Play-off Acesso" },
    ],
  },
  {
    competition: "Campeonato Nacional 2.ª Divisão Feminina de Voleibol",
    sport: "Volleyball",
    action: "classificacoes",
    campeonato: "NSFII",
    phases: [
      { fase: "1", serie: ".", label: "1.ª Fase" },
      { fase: "2", serie: "A", label: "2.ª Fase Série A" },
    ],
  },
  {
    competition: "Liga Solverde.pt Feminina - Elite",
    sport: "Volleyball",
    action: "playoff",
    campeonato: "NSFI",
    phases: [
      { subtipo: "EliteF", label: "Elite" },
      { subtipo: "58F", label: "Taça Federação" },
      { subtipo: "TFF", label: "Taça Federação" },
    ],
  },
  {
    competition: "Campeonato Nacional de Clubes de Voleibol de Praia Feminino",
    sport: "Beach Volleyball",
    action: "classificacoes",
    campeonato: "NSFVPC",
    phases: [
      { fase: "1", serie: "A", label: "1.ª Fase Série A" },
      { fase: "1", serie: "B", label: "1.ª Fase Série B" },
      { fase: "1", serie: "C", label: "1.ª Fase Série C" },
      { fase: "F", serie: "A", label: "Fase Final Série A" },
      { fase: "F", serie: "B", label: "Fase Final Série B" },
      { fase: "F", serie: "MF", label: "Meias-finais" },
      { fase: "F", serie: "34", label: "3.º/4.º lugar" },
      { fase: "F", serie: ".", label: "Final" },
    ],
  },
  {
    competition: "Taça de Portugal Feminina de Voleibol",
    sport: "Volleyball",
    action: "classificacoes",
    campeonato: "TPF",
    phases: [
      { fase: "1", serie: ".", label: "1.ª Fase" },
      { fase: "2", serie: ".", label: "2.ª Fase" },
      { fase: "3", serie: ".", label: "3.ª Fase" },
    ],
  },
  {
    competition: "Supertaça Feminina de Voleibol",
    sport: "Volleyball",
    action: "classificacoes",
    campeonato: "STF",
    phases: [{ fase: ".", serie: ".", label: "Supertaça" }],
  },
]

function decodeHtml(value) {
  return String(value || "")
    .replace(/&nbsp;/g, " ")
    .replace(/&ccedil;/g, "ç")
    .replace(/&atilde;/g, "ã")
    .replace(/&aacute;/g, "á")
    .replace(/&eacute;/g, "é")
    .replace(/&iacute;/g, "í")
    .replace(/&oacute;/g, "ó")
    .replace(/&uacute;/g, "ú")
    .replace(/&ordf;/g, "ª")
    .replace(/&ordm;/g, "º")
    .replace(/&amp;/g, "&")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\s+\n/g, "\n")
    .replace(/\n\s+/g, "\n")
    .trim()
}

function normalizeTeamName(value) {
  return decodeHtml(value)
    .replace(/\s+/g, " ")
    .trim()
}

function parseScore(value) {
  const match = decodeHtml(value).match(/(\d+)\s*-\s*(\d+)/)
  if (!match) return { home: null, away: null }

  return {
    home: Number(match[1]),
    away: Number(match[2]),
  }
}

function parseDateTime(value) {
  const text = decodeHtml(value)
  const dateMatch = text.match(/Data:\s*(\d{2})\/(\d{2})\/(\d{4})/i)
  const timeMatch = text.match(/Hora:\s*(\d{1,2}):(\d{2})/i)
  const venueMatch = text.match(/Local:\s*([^\n]+)/i)

  if (!dateMatch) {
    return {
      startsAt: null,
      venue: venueMatch?.[1]?.trim() || "",
      season: null,
    }
  }

  const [, day, month, year] = dateMatch
  const hour = timeMatch?.[1]?.padStart(2, "0") || "00"
  const minute = timeMatch?.[2] || "00"

  return {
    startsAt: `${year}-${month}-${day}T${hour}:${minute}:00+00:00`,
    venue: venueMatch?.[1]?.trim() || "",
    season: year,
  }
}

function parseRows(html, target, phase) {
  const matches = []
  const rowRegex = /<tr>([\s\S]*?)<\/tr>/g
  let rowMatch

  while ((rowMatch = rowRegex.exec(html))) {
    const row = rowMatch[1]
    if (!/Data:&nbsp;|Data:/i.test(row)) continue

    const cells = [...row.matchAll(/<td[^>]*>([\s\S]*?)(?=<td|<\/tr>)/g)]
      .map((match) => match[1])
      .filter(Boolean)

    if (cells.length < 5) continue

    const dateCell = cells.find((cell) => /Data:&nbsp;|Data:/i.test(cell))
    const dateIndex = cells.findIndex((cell) => cell === dateCell)
    const homeCell = cells[dateIndex + 1]
    const scoreCell = cells[dateIndex + 2]
    const awayCell = cells[dateIndex + 3]
    const setsCell = cells[dateIndex + 4] || ""

    const homeTeam = normalizeTeamName(homeCell)
    const awayTeam = normalizeTeamName(awayCell)
    const { home, away } = parseScore(scoreCell)
    const { startsAt, venue, season } = parseDateTime(dateCell)

    if (!homeTeam || !awayTeam || !startsAt) continue

    const setScores = decodeHtml(setsCell)
      .split("|")
      .map((item) => item.trim())
      .filter((item) => /^\d+\s*-\s*\d+$/.test(item))
      .join(" | ")

    const externalKey = [
      target.campeonato,
      phase.fase || phase.subtipo || ".",
      phase.serie || ".",
      startsAt,
      homeTeam,
      awayTeam,
    ]
      .join("|")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")

    matches.push({
      external_id: `fpv-${externalKey}`,
      sport: target.sport,
      home_team: homeTeam,
      away_team: awayTeam,
      home_score: home,
      away_score: away,
      status: home === null || away === null ? "SCHEDULED" : "FINISHED",
      venue: venue || phase.label,
      starts_at: startsAt,
      competition: target.competition,
      source: PROVIDER,
      region: "Portugal",
      season,
      gender: "women",
      data_status: "verified",
      source_url: SOURCE_URL,
      updated_at: new Date().toISOString(),
      venue: [venue, setScores ? `Sets: ${setScores}` : "", phase.label]
        .filter(Boolean)
        .join(" / "),
    })
  }

  return matches
}

async function fetchPhase(target, phase) {
  const body = new URLSearchParams()
  body.set("campeonato", target.campeonato)

  if (target.action === "playoff") {
    body.set("SubTipo", phase.subtipo)
  } else {
    body.set("fase", phase.fase || ".")
    body.set("serie", phase.serie || ".")
  }

  const response = await fetch(`${FPV_BASE}/${target.action}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "QueensArena data importer",
      Referer: SOURCE_URL,
    },
    body,
  })

  if (!response.ok) {
    throw new Error(
      `FPV ${target.action} ${target.campeonato} ${phase.label} HTTP ${response.status}`
    )
  }

  const html = await response.text()
  return parseRows(html, target, phase)
}

function uniqueRows(rows) {
  const map = new Map()

  for (const row of rows) {
    map.set(row.external_id, row)
  }

  return [...map.values()]
}

const allMatches = []
const phaseReport = []

for (const target of targets) {
  for (const phase of target.phases) {
    const rows = await fetchPhase(target, phase)
    allMatches.push(...rows)
    phaseReport.push({
      competition: target.competition,
      phase: phase.label,
      rows: rows.length,
    })
    await new Promise((resolve) => setTimeout(resolve, 250))
  }
}

const matchRows = uniqueRows(allMatches)

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
    teamRows.set(`${row.sport}:${name}`, {
      name,
      sport: row.sport,
      country: "Portugal",
      region: "Portugal",
      provider: PROVIDER,
      external_id: null,
      gender: "women",
      data_status: "verified",
      source_url: SOURCE_URL,
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

const sourceRows = targets.map((target) => ({
  provider: PROVIDER,
  sport: target.sport,
  competition: target.competition,
  season: "2025",
  region: "Portugal",
  country: "Portugal",
  source_url: SOURCE_URL,
  enabled: true,
  coverage_level: "official-federation",
  reliability: "official-page",
  notes: "Dados importados do site oficial de resultados da Federação Portuguesa de Voleibol.",
  updated_at: new Date().toISOString(),
}))

const { error: sourceError } = await supabase
  .from("data_sources")
  .upsert(sourceRows, {
    onConflict: "provider,competition,season",
  })

if (sourceError) throw sourceError

console.table(phaseReport)
console.log(
  `Synced ${matchRows.length} FPV match(es), ${teamRows.size} team(s), ${sourceRows.length} source row(s).`
)
