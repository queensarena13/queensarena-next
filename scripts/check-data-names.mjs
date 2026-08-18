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

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
)

const genericCompetitionNames = new Set([
  "1a Divisao - Women",
  "1a Divisao Women",
  "1ª Liga Feminina",
  "1º Liga Feminina",
  "Liga Feminina",
  "Campeonato Nacional",
])

const { data, error } = await supabase
  .from("matches")
  .select("id,sport,competition")
  .or(
    "competition.ilike.%1a Div%,competition.ilike.%Campeonato Nacional%,competition.ilike.%Liga Feminina%"
  )

if (error) throw error

const unique = [
  ...new Set(
    (data || []).map(
      (row) => `${row.sport || ""}: ${row.competition || ""}`
    )
  ),
]

const unresolved = (data || []).filter((row) =>
  genericCompetitionNames.has(row.competition)
)

console.log(JSON.stringify(unique, null, 2))

if (unresolved.length > 0) {
  console.error(
    `Found ${unresolved.length} match row(s) with unresolved generic competition names.`
  )
  process.exit(1)
}
