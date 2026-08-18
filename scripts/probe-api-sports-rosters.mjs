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

const key = process.env.API_SPORTS_KEY

if (!key) {
  throw new Error("Missing API_SPORTS_KEY")
}

const targets = [
  "https://v3.football.api-sports.io/players?league=1119&season=2024",
  "https://v3.football.api-sports.io/teams?league=1119&season=2024",
  "https://v1.handball.api-sports.io/teams?league=132&season=2024",
]

for (const target of targets) {
  const response = await fetch(target, {
    headers: {
      "x-apisports-key": key,
    },
  })
  const data = await response.json()
  const sample = (data.response || [])[0] || null

  console.log(
    JSON.stringify({
      target,
      status: response.status,
      results: data.results || 0,
      errors: data.errors || null,
      sample,
      paging: data.paging || null,
    })
  )
}
