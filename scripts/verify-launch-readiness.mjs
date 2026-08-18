import { existsSync, statSync } from "node:fs"
import { join } from "node:path"

const baseUrl =
  process.env.LAUNCH_BASE_URL ||
  "https://queensarena-next.vercel.app"

const requiredFiles = [
  "android/app/build/outputs/bundle/release/app-release.aab",
  "public/queen-logo.png",
  "public/queen-splash-logo.png",
  "public/.well-known/assetlinks.json",
  "public/ads.txt",
  "public/app-ads.txt",
  "docs/play-store/store-listing.md",
  "docs/play-store/data-safety.md",
  "docs/play-store/submission.md",
  "docs/play-store/console-step-by-step.md",
  "docs/play-store/internal-testing.md",
  "docs/data-operations-runbook.md",
  "docs/supabase-user-accounts-setup.md",
  "docs/app-update-strategy.md",
  "docs/play-store/assets/feature-graphic-1024x500.png",
  "docs/play-store/assets/phone-screenshot-1.png",
  "docs/play-store/assets/phone-screenshot-2.png",
]

const requiredUrls = [
  "/",
  "/manifest.webmanifest",
  "/.well-known/assetlinks.json",
  "/ads.txt",
  "/app-ads.txt",
  "/privacy",
  "/account-deletion",
  "/contact",
  "/install",
  "/sources",
  "/data-partnerships",
  "/terms",
  "/cookies",
  "/robots.txt",
  "/sitemap.xml",
]

const dataEndpoints = [
  {
    path: "/api/public/matches?limit=15000",
    key: "matches",
    min: 500,
  },
  {
    path: "/api/public/teams?limit=3000",
    key: "teams",
    min: 100,
  },
  {
    path: "/api/public/players?limit=4000",
    key: "players",
    min: 500,
  },
  {
    path: "/api/public/competitions",
    key: "competitions",
    min: 20,
  },
  {
    path: "/api/public/standings?limit=3000",
    key: "standings",
    min: 100,
  },
  {
    path: "/api/public/team-stats?limit=3000",
    key: "teamStats",
    min: 100,
  },
  {
    path: "/api/public/player-stats?limit=5000",
    key: "playerStats",
    min: 4000,
  },
]

function fileCheck(path) {
  const absolute = join(process.cwd(), path)

  if (!existsSync(absolute)) {
    return {
      path,
      ok: false,
      detail: "missing",
    }
  }

  const stat = statSync(absolute)

  return {
    path,
    ok: stat.size > 0,
    detail: `${stat.size} bytes`,
  }
}

async function urlCheck(path) {
  const response = await fetch(`${baseUrl}${path}`)
  const text = await response.text()
  const badEncoding =
    /\uFFFD|ï¿½|Ã[\u0080-\u00bf¡-¿]|Â[\u0080-\u00bf¡-¿]/.test(text)

  return {
    path,
    ok: response.ok && !badEncoding,
    detail: `${response.status}${badEncoding ? " bad-encoding" : ""}`,
  }
}

async function dataCheck(endpoint) {
  const response = await fetch(`${baseUrl}${endpoint.path}`)
  const data = await response.json()
  const items = data[endpoint.key] || []
  const ok =
    response.ok &&
    data.success === true &&
    items.length >= endpoint.min

  return {
    path: endpoint.path,
    ok,
    detail: `${items.length}/${endpoint.min}`,
  }
}

function printSection(title, rows) {
  console.log(`\n${title}`)

  for (const row of rows) {
    console.log(
      `${row.ok ? "OK" : "FAIL"} ${row.path} - ${row.detail}`
    )
  }
}

const fileResults = requiredFiles.map(fileCheck)
const urlResults = await Promise.all(
  requiredUrls.map(urlCheck)
)
const dataResults = await Promise.all(
  dataEndpoints.map(dataCheck)
)

printSection("Files", fileResults)
printSection("Public URLs", urlResults)
printSection("Data API", dataResults)

const failed = [
  ...fileResults,
  ...urlResults,
  ...dataResults,
].filter((row) => !row.ok)

if (failed.length > 0) {
  console.error(`\nLaunch verification failed: ${failed.length} issue(s).`)
  process.exit(1)
}

console.log("\nLaunch verification passed.")
