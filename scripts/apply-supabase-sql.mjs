import { readFile } from "node:fs/promises"
import { join } from "node:path"
import dns from "node:dns"
import { resolve6 } from "node:dns/promises"
import pg from "pg"

const root = process.cwd()
const env = await readFile(
  join(root, ".env.local"),
  "utf8"
)

const databaseUrl = env
  .split(/\r?\n/)
  .map((line) => line.trim())
  .find((line) =>
    line.startsWith("DATABASE_URL=")
  )
  ?.slice("DATABASE_URL=".length)
  .replace(/^["']|["']$/g, "")

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL not found in .env.local"
  )
}

const files = [
  "upgrade.sql",
  "data-provider-upgrade.sql",
  "queensarena-data-platform.sql",
  "official-aggregator.sql",
  "season-stats-upgrade.sql",
  "seed.sql",
  "analytics-events.sql",
  "user-profiles-favorites.sql",
  "signup-emails.sql",
  "editorial-sources.sql",
  "sports-poll.sql",
]

dns.setServers(["1.1.1.1", "8.8.8.8"])

function createClient(config = {}) {
  if (Object.keys(config).length > 0) {
    return new pg.Client(config)
  }

  return new pg.Client({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false,
    },
  })
}

let client = createClient()

try {
  await client.connect()
} catch (error) {
  await client.end().catch(() => {})

  const url = new URL(databaseUrl)
  const hostOverride =
    process.env.SUPABASE_DB_HOST_OVERRIDE
  const addresses = hostOverride
    ? [hostOverride]
    : await resolve6(url.hostname)

  if (addresses.length === 0) {
    throw error
  }

  client = createClient({
    host: addresses[0],
    port: Number(url.port || 5432),
    user: decodeURIComponent(
      url.username
    ),
    password: decodeURIComponent(
      url.password
    ),
    database: url.pathname.replace(
      /^\//,
      ""
    ),
    ssl: {
      rejectUnauthorized: false,
      servername: url.hostname,
    },
  })

  await client.connect()
}

try {
  for (const file of files) {
    const sql = await readFile(
      join(root, "supabase", file),
      "utf8"
    )

    await client.query(sql)
    console.log(`Applied ${file}`)
  }
} finally {
  await client.end()
}
