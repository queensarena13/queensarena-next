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

const PROVIDER = "ge Globo"
const COMPETITION = "Campeonato Brasileiro Feminino"
const SPORT = "Football"
const REGION = "Brasil"
const COUNTRY = "Brasil"
const SEASON = "2026"
const PAGE_URL =
  "https://ge.globo.com/futebol/futebol-feminino/brasileiro-feminino/"

function extractAssignment(html, name) {
  const marker = `const ${name} = `
  const start = html.indexOf(marker)

  if (start < 0) {
    throw new Error(`${name} not found in ge Globo page`)
  }

  const jsonStart = start + marker.length
  const end = html.indexOf(";\n", jsonStart)

  if (end < 0) {
    throw new Error(`${name} assignment end not found`)
  }

  return JSON.parse(html.slice(jsonStart, end))
}

function toIsoInBrazil(value) {
  if (!value) return null

  return `${value}:00-03:00`
}

function toNumber(value) {
  const number = Number(value)

  return Number.isFinite(number) ? number : null
}

function matchStatus(match) {
  const home = toNumber(match.placar_oficial_mandante)
  const away = toNumber(match.placar_oficial_visitante)

  if (home !== null && away !== null) return "FINISHED"
  if (match.jogo_ja_comecou) return "LIVE"

  return "SCHEDULED"
}

function mapMatch(match) {
  const home = match.equipes?.mandante
  const away = match.equipes?.visitante
  const startsAt = toIsoInBrazil(match.data_realizacao)

  if (!match.id || !home?.nome_popular || !away?.nome_popular || !startsAt) {
    return null
  }

  return {
    external_id: `ge-globo-brasileiro-feminino-${match.id}`,
    sport: SPORT,
    home_team: home.nome_popular,
    away_team: away.nome_popular,
    home_score: toNumber(match.placar_oficial_mandante),
    away_score: toNumber(match.placar_oficial_visitante),
    venue: match.sede?.nome_popular || null,
    status: matchStatus(match),
    starts_at: startsAt,
    competition: COMPETITION,
    source: PROVIDER,
    region: REGION,
    season: SEASON,
    gender: "women",
    data_status: "verified",
    source_url: match.transmissao?.url || PAGE_URL,
    updated_at: new Date().toISOString(),
  }
}

function mapTeam(team) {
  return {
    name: team.nome_popular,
    sport: SPORT,
    country: COUNTRY,
    region: REGION,
    provider: PROVIDER,
    external_id: team.id ? `ge-globo-team-${team.id}` : null,
    gender: "women",
    data_status: "verified",
    source_url: PAGE_URL,
    updated_at: new Date().toISOString(),
  }
}

function mapStanding(row) {
  return {
    league: COMPETITION,
    team: row.nome_popular,
    played: Number(row.jogos || 0),
    won: Number(row.vitorias || 0),
    draw: Number(row.empates || 0),
    lost: Number(row.derrotas || 0),
    goals_for: Number(row.gols_pro || 0),
    goals_against: Number(row.gols_contra || 0),
    points: Number(row.pontos || 0),
    position: Number(row.ordem || 0),
  }
}

async function fetchHtml() {
  const response = await fetch(PAGE_URL, {
    headers: {
      accept: "text/html",
      "user-agent": "QueensArena data importer",
    },
  })

  if (!response.ok) {
    throw new Error(`ge Globo page HTTP ${response.status}`)
  }

  return response.text()
}

const html = await fetchHtml()
const listaJogos = extractAssignment(html, "listaJogos")
const classificacao = extractAssignment(html, "classificacao")
const matchRows = listaJogos.map(mapMatch).filter(Boolean)
const teamRowsByName = new Map()

for (const match of listaJogos) {
  const home = match.equipes?.mandante
  const away = match.equipes?.visitante

  if (home?.nome_popular) teamRowsByName.set(home.nome_popular, mapTeam(home))
  if (away?.nome_popular) teamRowsByName.set(away.nome_popular, mapTeam(away))
}

for (const row of classificacao.classificacao || []) {
  if (row.nome_popular) teamRowsByName.set(row.nome_popular, mapTeam(row))
}

if (matchRows.length > 0) {
  const { error } = await supabase.from("matches").upsert(matchRows, {
    onConflict: "external_id",
  })

  if (error) throw error
}

const teamRows = [...teamRowsByName.values()]

if (teamRows.length > 0) {
  const { error } = await supabase.from("teams").upsert(teamRows, {
    onConflict: "name",
  })

  if (error) throw error
}

const sourceRow = {
  provider: PROVIDER,
  sport: SPORT,
  competition: COMPETITION,
  season: SEASON,
  region: REGION,
  country: COUNTRY,
  source_url: PAGE_URL,
  enabled: true,
  coverage_level: "public-table",
  reliability: "public-competition-page",
  notes:
    "Tabela, classificação e jogos factuais publicados na página pública do ge/Globo. Conteúdo jornalístico não é copiado.",
  updated_at: new Date().toISOString(),
}

const { error: sourceError } = await supabase
  .from("data_sources")
  .upsert(sourceRow, {
    onConflict: "provider,competition,season",
  })

if (sourceError) throw sourceError

const standingsRows = (classificacao.classificacao || [])
  .map(mapStanding)
  .filter((row) => row.team)

if (standingsRows.length > 0) {
  const { error: deleteError } = await supabase
    .from("standings")
    .delete()
    .eq("league", COMPETITION)

  if (deleteError) throw deleteError

  const { error: standingsError } = await supabase
    .from("standings")
    .insert(standingsRows)

  if (standingsError) throw standingsError
}

console.log(
  `Synced ${matchRows.length} ge Globo match(es), ${teamRows.length} team(s), ${standingsRows.length} standing row(s).`
)
