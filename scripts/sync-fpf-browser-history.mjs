import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { chromium } from "playwright"
import { createClient } from "@supabase/supabase-js"

const cwd = process.cwd()

function loadEnvFile(fileName) {
  const envPath = join(cwd, fileName)

  if (!existsSync(envPath)) return

  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim()

    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
      continue
    }

    const [name, ...parts] = trimmed.split("=")
    const value = parts.join("=").trim().replace(/^["']|["']$/g, "")

    if (value && !process.env[name]) {
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

const BASE_URL = "https://resultados.fpf.pt"
const PROVIDER = "Federação Portuguesa de Futebol"

const SEASONS = [
  { id: 106, label: "2026-2027", season: "2027", startYear: 2026, endYear: 2027 },
  { id: 105, label: "2025-2026", season: "2026", startYear: 2025, endYear: 2026 },
  { id: 104, label: "2024-2025", season: "2025", startYear: 2024, endYear: 2025 },
  { id: 103, label: "2023-2024", season: "2024", startYear: 2023, endYear: 2024 },
  { id: 102, label: "2022-2023", season: "2023", startYear: 2022, endYear: 2023 },
  { id: 101, label: "2021-2022", season: "2022", startYear: 2021, endYear: 2022 },
  { id: 100, label: "2020-2021", season: "2021", startYear: 2020, endYear: 2021 },
  { id: 99, label: "2019-2020", season: "2020", startYear: 2019, endYear: 2020 },
  { id: 98, label: "2018-2019", season: "2019", startYear: 2018, endYear: 2019 },
  { id: 97, label: "2017-2018", season: "2018", startYear: 2017, endYear: 2018 },
  { id: 96, label: "2016-2017", season: "2017", startYear: 2016, endYear: 2017 },
  { id: 95, label: "2015-2016", season: "2016", startYear: 2015, endYear: 2016 },
]

const COMPETITIONS = [
  {
    id: 29839,
    name: "Liga BPI",
    sport: "Football",
    region: "Portugal",
  },
]

const MONTHS = {
  jan: 1,
  fev: 2,
  mar: 3,
  abr: 4,
  mai: 5,
  jun: 6,
  jul: 7,
  ago: 8,
  set: 9,
  out: 10,
  nov: 11,
  dez: 12,
}

function normalizeText(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .replace(/\s+([,/])/g, "$1")
    .replace(/, Sad\b/gi, " SAD")
    .trim()
}

function scoreParts(value) {
  const match = String(value || "").match(/(\d+)\s*-\s*(\d+)/)
  if (!match) return [null, null]
  return [Number(match[1]), Number(match[2])]
}

function startsAtFromScoreDate(value, season) {
  const match = String(value || "").match(/(\d{1,2})\s+([a-zç]+)/i)

  if (!match) return null

  const day = String(match[1]).padStart(2, "0")
  const month = MONTHS[match[2].toLowerCase()]

  if (!month) return null

  const year = month >= 8 ? season.startYear : season.endYear

  return `${year}-${String(month).padStart(2, "0")}-${day}T12:00:00+00:00`
}

async function safeGoto(page, url) {
  await page.goto(url, {
    waitUntil: "domcontentloaded",
    timeout: 45000,
  })
  await page.waitForLoadState("networkidle", { timeout: 8000 }).catch(() => {})

  const bodyText = await page.locator("body").innerText({ timeout: 5000 })

  if (
    /Your IP address has been banned|Automated Message|automated security systems/i.test(
      bodyText
    )
  ) {
    throw new Error(
      "FPF blocked this browser session with an automated-security/IP-ban page. Stop and retry later or ask FPF to whitelist QueensArena."
    )
  }
}

async function collectFixtureLinks(page) {
  return page.evaluate(() =>
    Array.from(
      document.querySelectorAll(
        'a[href*="GetClassificationAndMatchesByFixture"]'
      )
    ).map((anchor) => ({
      label: anchor.textContent?.trim() || "",
      href: anchor.getAttribute("href") || "",
    }))
  )
}

async function collectMatchesFromFixture(page, url, competition, season) {
  await safeGoto(page, url)

  const items = await page.evaluate(() =>
    Array.from(
      document.querySelectorAll('a[href*="/Match/GetMatchInformation"]')
    ).map((anchor) => ({
      href: anchor.getAttribute("href") || "",
      parts: Array.from(anchor.children)
        .map((child) => child.textContent?.replace(/\s+/g, " ").trim() || "")
        .filter(Boolean),
    }))
  )

  const rows = []

  for (const item of items) {
    const matchId = item.href.match(/matchId=(\d+)/)?.[1]

    if (!matchId || item.parts.length < 4) continue

    const homeTeam = normalizeText(item.parts[0])
    const scoreDate = item.parts[1]
    const awayTeam = normalizeText(item.parts[2])
    const venue = normalizeText(item.parts.slice(3).join(" "))
    const [homeScore, awayScore] = scoreParts(scoreDate)
    const startsAt = startsAtFromScoreDate(scoreDate, season)

    if (!homeTeam || !awayTeam || !startsAt) continue

    rows.push({
      external_id: `fpf-${matchId}`,
      sport: competition.sport,
      home_team: homeTeam,
      away_team: awayTeam,
      home_score: homeScore,
      away_score: awayScore,
      status: homeScore === null || awayScore === null ? "SCHEDULED" : "FINISHED",
      venue,
      starts_at: startsAt,
      competition: competition.name,
      source: PROVIDER,
      region: competition.region,
      season: season.season,
      gender: "women",
      data_status: homeScore === null || awayScore === null ? "scheduled" : "verified",
      source_url: new URL(item.href, BASE_URL).toString(),
      updated_at: new Date().toISOString(),
    })
  }

  return rows
}

async function upsertChunk(table, rows, options) {
  for (let index = 0; index < rows.length; index += 100) {
    const chunk = rows.slice(index, index + 100)
    const { error } = await supabase.from(table).upsert(chunk, options)
    if (error) throw error
  }
}

async function syncCompetitionSeason(page, competition, season) {
  const url = `${BASE_URL}/Competition/Details?competitionId=${competition.id}&seasonId=${season.id}`
  await safeGoto(page, url)

  const title = await page
    .locator("h2")
    .textContent({ timeout: 5000 })
    .catch(() => competition.name)
  const fixtureLinks = await collectFixtureLinks(page)
  const rowsById = new Map()

  for (const fixture of fixtureLinks) {
    if (!fixture.href) continue

    const fixtureUrl = new URL(fixture.href, BASE_URL).toString()
    const rows = await collectMatchesFromFixture(
      page,
      fixtureUrl,
      competition,
      season
    )

    for (const row of rows) {
      rowsById.set(row.external_id, row)
    }
  }

  const rows = [...rowsById.values()]

  if (rows.length > 0) {
    await upsertChunk("matches", rows, {
      onConflict: "external_id",
    })

    const teams = new Map()

    for (const row of rows) {
      for (const name of [row.home_team, row.away_team]) {
        if (teams.has(name)) continue
        teams.set(name, {
          name,
          sport: competition.sport,
          country: "Portugal",
          region: "Portugal",
          provider: PROVIDER,
          external_id: null,
          gender: "women",
          data_status: "verified",
          source_url: row.source_url,
          updated_at: new Date().toISOString(),
        })
      }
    }

    await upsertChunk("teams", [...teams.values()], {
      onConflict: "name",
    })
  }

  const { error: sourceError } = await supabase.from("data_sources").upsert(
    {
      provider: PROVIDER,
      sport: competition.sport,
      competition: competition.name,
      season: season.season,
      region: competition.region,
      country: "Portugal",
      provider_league_id: String(competition.id),
      provider_season_id: String(season.id),
      source_url: url,
      enabled: true,
      coverage_level: "official-federation-browser",
      reliability: "official-page",
      notes:
        "Dados importados do Centro de Resultados da Federação Portuguesa de Futebol por browser-side em blocos pequenos.",
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "provider,competition,season",
    }
  )

  if (sourceError) throw sourceError

  return {
    competition: competition.name,
    pageTitle: normalizeText(title),
    season: season.label,
    seasonId: season.id,
    fixtures: fixtureLinks.length,
    rows: rows.length,
  }
}

const onlySeasonIds = (process.env.FPF_SEASON_IDS || "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean)
const seasons = onlySeasonIds.length
  ? SEASONS.filter((season) => onlySeasonIds.includes(String(season.id)))
  : SEASONS

const userDataDir = join(cwd, "scripts", ".fpf-browser-profile")
mkdirSync(userDataDir, { recursive: true })

const headless = process.env.FPF_HEADLESS === "true"
const context = await chromium.launchPersistentContext(userDataDir, {
  headless,
  slowMo: Number(process.env.FPF_SLOW_MO || 500),
  locale: "pt-PT",
  userAgent:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36",
})
const page = context.pages()[0] || (await context.newPage())
const report = []

try {
  for (const competition of COMPETITIONS) {
    for (const season of seasons) {
      const result = await syncCompetitionSeason(page, competition, season)
      report.push(result)
      console.log(
        `${result.competition} ${result.season}: ${result.rows} match(es), ${result.fixtures} fixture link(s)`
      )
    }
  }
} finally {
  await context.close()
}

writeFileSync(
  join(cwd, "scripts", ".last-fpf-browser-sync.json"),
  `${JSON.stringify(report, null, 2)}\n`
)

console.table(report)
console.log(
  `Synced ${report.reduce((sum, row) => sum + row.rows, 0)} FPF browser-side match(es).`
)
