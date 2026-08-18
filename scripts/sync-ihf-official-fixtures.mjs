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

const targets = [
  {
    competition: "World Women's Handball Championship",
    season: "2025",
    sport: "Handball",
    region: "Mundo",
    url: "https://www.ihf.info/competitions/women/307/27th-ihf-womens-world-championship-2025-ger-ned/220823",
  },
]

function decodeHtml(value) {
  return String(value || "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#8211;/g, "-")
    .replace(/&rsquo;/g, "'")
    .replace(/\s+/g, " ")
    .trim()
}

function absoluteUrl(path) {
  return new URL(path, "https://www.ihf.info").toString()
}

async function fetchHtml(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "QueensArena data importer",
      Accept: "text/html",
    },
  })

  if (!response.ok) {
    throw new Error(`${url} HTTP ${response.status}`)
  }

  return response.text()
}

function stageUrlsFromHtml(html, target) {
  const urls = new Set()
  const pattern = /href="([^"]+\/stage-matches\/\d+)"/g
  let match

  while ((match = pattern.exec(html))) {
    urls.add(absoluteUrl(match[1]))
  }

  if (urls.size === 0) {
    urls.add(`${target.url}/stage-matches`)
  }

  return [...urls]
}

function scoreFromBlock(block, matchId) {
  const scoreMatch = block.match(
    new RegExp(
      `ihf-competitions-score-${matchId}"[^>]*>([\\s\\S]*?)<\\/div>`
    )
  )
  const score = decodeHtml(scoreMatch?.[1])
  const scoreParts = score.match(/^(\d+)\s*-\s*(\d+)$/)

  if (!scoreParts) {
    return {
      home_score: 0,
      away_score: 0,
      status: "SCHEDULED",
    }
  }

  return {
    home_score: Number(scoreParts[1]),
    away_score: Number(scoreParts[2]),
    status: "FINISHED",
  }
}

function parseMatches(html, target, stageUrl) {
  const rows = []
  const dateSections = html
    .split(/<h2 class="matchesHeadDate">/g)
    .slice(1)

  for (const section of dateSections) {
    const dateText = decodeHtml(section.slice(0, section.indexOf("</h2>")))
    const blocks = section
      .split('<div class="matchDetails"')
      .slice(1)

    for (const block of blocks) {
      const id = block.match(
        /data-ihf-competitions-match-id="([^"]+)"/
      )?.[1]

      if (!id) continue

      const teamNames = [
        ...block.matchAll(/team-matches\/\d+">([\s\S]*?)<\/a>/g),
      ].map((match) => decodeHtml(match[1]))
      const homeTeam = teamNames[0]
      const awayTeam = teamNames[1]

      if (!homeTeam || !awayTeam) continue

      const time =
        block.match(/<time datetime="([^"]+)"/)?.[1] ||
        new Date(dateText).toISOString()
      const venue = decodeHtml(
        block.match(/<p class="arena[^>]*>([\s\S]*?)<\/p>/)?.[1]
      )
      const group = decodeHtml(
        block.match(/<div class="groupName[^>]*>([\s\S]*?)<\/div>/)?.[1]
      )
      const matchCenterPath = block.match(
        /href="([^"]+\/match-center\/\d+)"/
      )?.[1]
      const score = scoreFromBlock(block, id)

      rows.push({
        external_id: `ihf-official-${id}`,
        sport: target.sport,
        home_team: homeTeam,
        away_team: awayTeam,
        home_score: score.home_score,
        away_score: score.away_score,
        venue: venue || group || target.competition,
        status: score.status,
        starts_at: time,
        competition: target.competition,
        source: "IHF Official",
        region: target.region,
        season: target.season,
        data_status: score.status === "FINISHED" ? "imported" : "scheduled",
        source_url: matchCenterPath ? absoluteUrl(matchCenterPath) : stageUrl,
        updated_at: new Date().toISOString(),
      })
    }
  }

  return rows
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const rowsById = new Map()
const sourceRows = []

for (const target of targets) {
  const html = await fetchHtml(target.url)
  const stageUrls = new Set(stageUrlsFromHtml(html, target))

  for (let index = 0; index < [...stageUrls].length; index += 1) {
    const stageUrl = [...stageUrls][index]
    const stageHtml = await fetchHtml(stageUrl)

    for (const discoveredStageUrl of stageUrlsFromHtml(stageHtml, target)) {
      stageUrls.add(discoveredStageUrl)
    }

    const rows = parseMatches(stageHtml, target, stageUrl)

    for (const row of rows) {
      rowsById.set(row.external_id, row)
    }

    console.log(`${target.competition} ${target.season} ${stageUrl}: ${rows.length}`)
    await sleep(500)
  }

  sourceRows.push({
    provider: "IHF Official",
    sport: target.sport,
    competition: target.competition,
    season: target.season,
    region: target.region,
    provider_league_id: target.url,
    provider_season_id: target.season,
    source_url: target.url,
    enabled: true,
    coverage_level: "official-fixtures",
    reliability: "official-page",
    notes:
      "Fixtures and results imported from official IHF competition pages.",
    updated_at: new Date().toISOString(),
  })
}

const rows = [...rowsById.values()]

if (rows.length > 0) {
  const { error } = await supabase
    .from("matches")
    .upsert(rows, {
      onConflict: "external_id",
    })

  if (error) throw error
}

const teams = new Map()

for (const row of rows) {
  for (const name of [row.home_team, row.away_team]) {
    teams.set(name, {
      name,
      sport: row.sport,
      country: name,
      region: targetCountryRegion(name),
      provider: row.source,
      external_id: null,
      data_status: "imported",
      source_url: row.source_url,
      updated_at: new Date().toISOString(),
    })
  }
}

function targetCountryRegion() {
  return "Mundo"
}

if (teams.size > 0) {
  const { error } = await supabase
    .from("teams")
    .upsert([...teams.values()], {
      onConflict: "name",
    })

  if (error) throw error
}

if (sourceRows.length > 0) {
  const { error } = await supabase
    .from("data_sources")
    .upsert(sourceRows, {
      onConflict: "provider,competition,season",
    })

  if (error) throw error
}

console.log(
  `Synced ${rows.length} IHF official fixtures and ${teams.size} teams.`
)
