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

function normalizeTeam(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\b(w|women|feminino|feminina|futsal|handball)\b/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
}

function favicon(domain) {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
}

const TEAM_DOMAINS = {
  "sl benfica": "slbenfica.pt",
  benfica: "slbenfica.pt",
  "sporting cp": "sporting.pt",
  sporting: "sporting.pt",
  "sc braga": "scbraga.pt",
  braga: "scbraga.pt",
  "cs maritimo": "csmaritimo.org.pt",
  maritimo: "csmaritimo.org.pt",
  "vitoria sc": "vitoriasc.pt",
  "vitoria sport clube": "vitoriasc.pt",
  "rio ave fc": "rioavefc.pt",
  "scu torreense": "torreense.com",
  torreense: "torreense.com",
  "racing power fc": "racingpowerfc.pt",
  "sf damaiense": "sfdamaiense.pt",
  "valadares gaia fc": "valadaresgaiafc.pt",
  "colegio de gaia": "colegiodegaia.pt",
  "madeira sad": "madeirasad.pt",
  "abc de braga": "abcdebraga.pt",
  maiastars: "maiastars.pt",
  arsenal: "arsenal.com",
  "arsenal fc": "arsenal.com",
  chelsea: "chelseafc.com",
  "chelsea fc": "chelseafc.com",
  "manchester united": "manutd.com",
  "manchester united fc": "manutd.com",
  barcelona: "fcbarcelona.com",
  "fc barcelona": "fcbarcelona.com",
  "real madrid": "realmadrid.com",
  "real madrid femenino": "realmadrid.com",
  juventus: "juventus.com",
  "juventus fc": "juventus.com",
  roma: "asroma.com",
  "roma fc": "asroma.com",
  "bayern munich": "fcbayern.com",
  "vfl wolfsburg": "vfl-wolfsburg.de",
  "paris saint germain": "psg.fr",
  psg: "psg.fr",
  "ol lyonnes": "ol.fr",
  lyon: "ol.fr",
  "portland thorns fc": "thorns.com",
  "orlando pride": "orlandocitysc.com",
  "houston dash": "houstondynamofc.com",
  "washington spirit": "washingtonspirit.com",
  "angel city fc": "angelcity.com",
  "bay fc": "bayfc.com",
  "gotham fc": "gothamfc.com",
  "kansas city current": "kansascitycurrent.com",
  "north carolina courage": "nccourage.com",
  "racing louisville fc": "racingloufc.com",
  "san diego wave fc": "sandiegowavefc.com",
  "seattle reign fc": "reignfc.com",
  "utah royals fc": "rsl.com",
  "chicago stars fc": "chicagostars.com",
}

const { data: teams, error } = await supabase
  .from("teams")
  .select("id,name,logo_url")
  .limit(5000)

if (error) throw error

let updated = 0

for (const team of teams || []) {
  if (team.logo_url) continue

  const domain = TEAM_DOMAINS[normalizeTeam(team.name || "")]
  if (!domain) continue

  const { error: updateError } = await supabase
    .from("teams")
    .update({
      logo_url: favicon(domain),
      updated_at: new Date().toISOString(),
    })
    .eq("id", team.id)

  if (updateError) throw updateError
  updated += 1
}

console.log(`Seeded ${updated} team logo(s).`)
