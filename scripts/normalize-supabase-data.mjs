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

function normalizeKey(value) {
  return repairDisplayText(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[ºª]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
}

function repairDisplayText(value) {
  const text = String(value || "")
  const knownRepairs = {
    "Á. Árnad\uFFFDttir": "Á. Árnadóttir",
    "Í. Gunnarsd\uFFFDttir": "Í. Gunnarsdóttir",
    "M. Gíslad\uFFFDttir": "M. Gísladóttir",
    "K. Vredíkov\uFFFD": "K. Vredíková",
    "Þ. Sigf\uFFFDsd\uFFFDttir": "Þ. Sigfúsdóttir",
    "A. Özt\uFFFDrk": "A. Öztürk",
  }

  if (knownRepairs[text]) {
    return knownRepairs[text]
  }

  if (!/\uFFFD|Ã[\u0080-\u00bf¡-¿]|Â[\u0080-\u00bf¡-¿]/.test(text)) {
    return text
  }

  try {
    return Buffer.from(text, "latin1").toString("utf8")
  } catch {
    return text
  }
}

function canonicalCompetition(value, sport) {
  const key = normalizeKey(value)
  const sportKey = String(sport || "").toLowerCase()

  if (
    sportKey === "football" &&
    [
      "1a divisao women",
      "1 divisao women",
      "1a divisao women portugal",
      "1 liga feminina",
      "liga feminina",
      "campeonato nacional",
      "campeonato nacional feminino",
    ].includes(key)
  ) {
    return "Liga BPI"
  }

  if (
    sportKey === "handball" &&
    [
      "1a divisao women",
      "1 divisao women",
      "1 liga feminina",
      "liga feminina",
      "campeonato nacional",
      "campeonato nacional feminino",
    ].includes(key)
  ) {
    return "Campeonato Nacional 1.ª Divisão Feminina de Andebol"
  }

  if (sportKey === "handball" && key === "serie a women") {
    return "Serie A Women Handball"
  }

  if (
    sportKey === "futsal" &&
    [
      "1a divisao women",
      "1 divisao women",
      "1 liga feminina",
      "liga feminina",
      "campeonato nacional",
      "campeonato nacional feminino",
    ].includes(key)
  ) {
    return "Campeonato Nacional Feminino de Futsal"
  }

  if (["american nwsl", "nwsl women"].includes(key)) {
    return "NWSL"
  }

  if (
    [
      "uefa womens champions league",
      "uefa champions league women",
      "women s champions league",
      "womens champions league",
    ].includes(key)
  ) {
    return "UEFA Women's Champions League"
  }

  if (
    [
      "ehf champions league women",
      "champions league women",
      "women s ehf champions league",
      "womens ehf champions league",
    ].includes(key)
  ) {
    return "EHF Champions League Women"
  }

  if (
    [
      "uefa womens euro",
      "uefa women s euro",
      "uefa womens european championship",
      "uefa women s european championship",
    ].includes(key)
  ) {
    return "UEFA Women's EURO"
  }

  if (
    [
      "world womens handball championship",
      "world women s handball championship",
      "world championship women",
    ].includes(key)
  ) {
    return "World Women's Handball Championship"
  }

  if (
    [
      "european womens handball championship",
      "european women s handball championship",
      "european championship women",
    ].includes(key)
  ) {
    return "European Women's Handball Championship"
  }

  return value
}

function canonicalRegion(value) {
  const key = normalizeKey(value)

  const regions = {
    franca: "França",
    italia: "Itália",
    espanha: "Espanha",
    alemanha: "Alemanha",
    dinamarca: "Dinamarca",
    noruega: "Noruega",
    hungria: "Hungria",
    romenia: "Roménia",
    turquia: "Turquia",
    "paises baixos": "Países Baixos",
    europa: "Europa",
    mundo: "Mundo",
    portugal: "Portugal",
    brasil: "Brasil",
    australia: "Austrália",
  }

  return regions[key] || value
}

function inferCountry(value) {
  const key = normalizeKey(value)
  const countries = {
    portugal: "Portugal",
    eua: "United States",
    usa: "United States",
    "united states": "United States",
    spain: "Espanha",
    espanha: "Espanha",
    france: "França",
    franca: "França",
    germany: "Alemanha",
    alemanha: "Alemanha",
    netherlands: "Países Baixos",
    "paises baixos": "Países Baixos",
    brazil: "Brasil",
    brasil: "Brasil",
    denmark: "Dinamarca",
    dinamarca: "Dinamarca",
    norway: "Noruega",
    noruega: "Noruega",
    romania: "Roménia",
    romenia: "Roménia",
    finland: "Finlândia",
    finlandia: "Finlândia",
    switzerland: "Suíça",
    suica: "Suíça",
    croatia: "Croácia",
    croacia: "Croácia",
    iceland: "Islândia",
    islandia: "Islândia",
    "faroe islands": "Ilhas Faroé",
    "ilhas faroe": "Ilhas Faroé",
    hungary: "Hungria",
    hungria: "Hungria",
    italy: "Itália",
    italia: "Itália",
    turkey: "Turquia",
    turquia: "Turquia",
  }

  return countries[key] || null
}

function inferCountryFromTeam(row) {
  return row.country || inferCountry(row.name) || inferCountry(row.region)
}

function canonicalStatus(value) {
  if (value === "FT") return "FINISHED"
  return value
}

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

async function updateRows(table, rows, buildPatch) {
  let updated = 0

  for (const row of rows) {
    const patch = buildPatch(row)

    if (!patch || Object.keys(patch).length === 0) continue

    const { error } = await supabase
      .from(table)
      .update({
        ...patch,
        updated_at: new Date().toISOString(),
      })
      .eq("id", row.id)

    if (error) throw error
    updated += 1
  }

  return updated
}

const matches = await fetchAll(
  "matches",
  "id,sport,competition,status,venue,region"
)

const matchUpdates = await updateRows("matches", matches, (row) => {
  const patch = {}
  const competition = canonicalCompetition(row.competition, row.sport)
  const status = canonicalStatus(row.status)
  const venue = canonicalCompetition(row.venue, row.sport)
  const region = canonicalRegion(row.region)

  if (competition && competition !== row.competition) {
    patch.competition = competition
  }

  if (
    venue &&
    venue !== row.venue &&
    ["Liga BPI", "Campeonato Nacional 1.ª Divisão Feminina de Andebol"].includes(venue)
  ) {
    patch.venue = venue
  }

  if (status && status !== row.status) {
    patch.status = status
  }

  if (region && region !== row.region) {
    patch.region = region
  }

  return patch
})

const dataSources = await fetchAll(
  "data_sources",
  "id,provider,sport,competition,season,region,country"
)

const dataSourceKeys = new Set(
  dataSources.map(
    (row) =>
      `${row.provider || ""}|${row.competition || ""}|${row.season || ""}`
  )
)

const sourceUpdates = await updateRows(
  "data_sources",
  dataSources,
  (row) => {
    const competition = canonicalCompetition(row.competition, row.sport)

    if (!competition || competition === row.competition) {
      const region = canonicalRegion(row.region)
      const country = canonicalRegion(row.country)
      const patch = {}

      if (region && region !== row.region) patch.region = region
      if (country && country !== row.country) patch.country = country

      return Object.keys(patch).length > 0 ? patch : null
    }

    const targetKey = `${row.provider || ""}|${competition}|${row.season || ""}`

    if (dataSourceKeys.has(targetKey)) {
      const region = canonicalRegion(row.region)
      const country = canonicalRegion(row.country)
      const patch = {}

      if (region && region !== row.region) patch.region = region
      if (country && country !== row.country) patch.country = country

      return Object.keys(patch).length > 0 ? patch : null
    }

    const patch = {
      competition,
    }

    const region = canonicalRegion(row.region)
    const country = canonicalRegion(row.country)

    if (region && region !== row.region) patch.region = region
    if (country && country !== row.country) patch.country = country

    return patch
  }
)

const teams = await fetchAll(
  "teams",
  "id,name,sport,country,region"
)

const teamUpdates = await updateRows("teams", teams, (row) => {
  const patch = {}
  const name = repairDisplayText(row.name)
  const country = inferCountryFromTeam(row)
  const region = canonicalRegion(row.region || country)

  if (name && name !== row.name) {
    patch.name = name
  }

  if (country && country !== row.country) {
    patch.country = country
  }

  if (region && region !== row.region) {
    patch.region = region
  }

  return patch
})

const players = await fetchAll(
  "players",
  "id,name,position,nationality"
)

const playerUpdates = await updateRows("players", players, (row) => {
  const patch = {}
  const name = repairDisplayText(row.name)
  const position = repairDisplayText(row.position)
  const nationality = canonicalRegion(repairDisplayText(row.nationality))

  if (name && name !== row.name) patch.name = name
  if (position && position !== row.position) patch.position = position
  if (nationality && nationality !== row.nationality) {
    patch.nationality = nationality
  }

  return patch
})

console.log(
  `Normalized ${matchUpdates} matches, ${sourceUpdates} data sources, ${teamUpdates} teams and ${playerUpdates} players.`
)
