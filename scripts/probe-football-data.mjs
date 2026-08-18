import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"

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

const apiKey = process.env.FOOTBALL_DATA_API_KEY

if (!apiKey) {
  throw new Error("Missing FOOTBALL_DATA_API_KEY")
}

const response = await fetch(
  "https://api.football-data.org/v4/competitions",
  {
    headers: {
      "X-Auth-Token": apiKey,
    },
  }
)
const data = await response.json()

console.log(`status ${response.status}`)

if (data.message) {
  console.log(data.message)
}

for (const competition of data.competitions || []) {
  const haystack = [
    competition.name,
    competition.code,
    competition.area?.name,
  ]
    .filter(Boolean)
    .join(" ")

  if (!/women|female|fifa|uefa|world cup/i.test(haystack)) {
    continue
  }

  console.log(
    JSON.stringify({
      id: competition.id,
      code: competition.code,
      name: competition.name,
      area: competition.area?.name,
      type: competition.type,
      plan: competition.plan,
      currentSeason: competition.currentSeason?.startDate,
    })
  )
}
