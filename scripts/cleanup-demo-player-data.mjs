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

const demoNames = [
  "Marta Silva",
  "Ana Costa",
  "Jessica Moore",
]

const { data: demoPlayers, error: readError } = await supabase
  .from("players")
  .select("id,name")
  .in("name", demoNames)
  .is("provider", null)
  .is("external_id", null)

if (readError) throw readError

const ids = (demoPlayers || []).map((player) => player.id)

if (ids.length > 0) {
  const { error: seasonStatsError } = await supabase
    .from("player_season_stats")
    .delete()
    .in("player_id", ids)

  if (seasonStatsError) throw seasonStatsError

  const { error: rosterError } = await supabase
    .from("roster_memberships")
    .delete()
    .in("player_id", ids)

  if (rosterError) throw rosterError

  const { error: playerError } = await supabase
    .from("players")
    .delete()
    .in("id", ids)

  if (playerError) throw playerError
}

console.log(
  `Removed ${ids.length} demo player row(s): ${
    (demoPlayers || []).map((player) => player.name).join(", ") || "none"
  }.`
)
