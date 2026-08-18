import {
  getMatchBroadcastInfo,
  type MatchBroadcastInfo,
} from "@/lib/broadcast-sources"

export type BroadcastCalendarEntry = MatchBroadcastInfo & {
  id: string
  source: "SPORT TV" | "W-Sport" | "BTV" | "Canal 11"
  sport: string
  competition: string
  homeTeam: string
  awayTeam: string
  startsAt: string
  sourceUrl: string
}

type MatchLike = {
  sport?: string | null
  region?: string | null
  competition?: string | null
  home_team?: string | null
  away_team?: string | null
  starts_at?: string | null
}

type SportTvEvent = {
  id?: string | number
  date?: string | number
  tvChannelId?: string | number | null
  competition?: {
    name?: string | null
    gender?: string | null
  } | null
  localTeam?: {
    name?: string | null
    gender?: string | null
  } | null
  visitorTeam?: {
    name?: string | null
    gender?: string | null
  } | null
}

type Canal11Event = {
  _id?: string
  event_id?: string
  title?: string | null
  sportType?: string | null
  gender?: string | null
  event_date?: number | string | null
  gameStartDate?: number | string | null
  status?: string | null
  mediaIdentities?: Array<{
    title?: string | null
    mediaParentIdentities?: Array<{
      title?: string | null
    }>
  }>
  eventTeams?: {
    homeTeam?: {
      name?: string | null
      shortName?: string | null
    } | null
    awayTeam?: {
      name?: string | null
      shortName?: string | null
    } | null
  } | null
}

type Canal11ListResponse = {
  content?: {
    entries?: Canal11Event[]
  } | null
}

const SPORT_TV_DAILY_URL =
  "https://www.sporttv.pt/api/sports/soccer/v1/event/daily?day="
const SPORT_TV_PUBLIC_URL = "https://www.sporttv.pt/jogos"
const W_SPORT_PUBLIC_URL = "https://www.w-sport.com/pt/#tv_schedule"
const CANAL11_EVENT_LIST_URL =
  "https://fpf.watch.pixellot.tv/api/event/list"
const CANAL11_PUBLIC_URL = "https://www.canal11.pt/"

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10)
}

function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setUTCDate(next.getUTCDate() + days)
  return next
}

function normalize(value?: string | null) {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
}

function tokens(value?: string | null) {
  return normalize(value)
    .split(" ")
    .filter((token) => token.length >= 3)
}

function looksFemale(value?: string | null) {
  const normalized = normalize(value)

  return (
    normalized.includes("women") ||
    normalized.includes("woman") ||
    normalized.includes("female") ||
    normalized.includes("feminino") ||
    normalized.includes("feminina") ||
    normalized.includes("feminin") ||
    normalized.includes("womens")
  )
}

function isWomenSportTvEvent(event: SportTvEvent) {
  return (
    looksFemale(event.competition?.name) ||
    looksFemale(event.competition?.gender) ||
    looksFemale(event.localTeam?.gender) ||
    looksFemale(event.visitorTeam?.gender) ||
    looksFemale(event.localTeam?.name) ||
    looksFemale(event.visitorTeam?.name)
  )
}

function isWomenCanal11Event(event: Canal11Event) {
  return (
    normalize(event.gender) === "female" ||
    looksFemale(event.title) ||
    looksFemale(event.eventTeams?.homeTeam?.name) ||
    looksFemale(event.eventTeams?.awayTeam?.name) ||
    event.mediaIdentities?.some(
      (identity) =>
        looksFemale(identity.title) ||
        identity.mediaParentIdentities?.some((parent) =>
          looksFemale(parent.title)
        )
    ) === true
  )
}

function mapCanal11Sport(value?: string | null) {
  const normalized = normalize(value)

  if (normalized === "soccer") return "Football"
  if (normalized === "futsal") return "Futsal"

  return value || "Football"
}

function cleanCanal11TeamName(value?: string | null) {
  return (value || "")
    .replace(/\s*\([^)]*\)\s*$/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

function sameTeam(a?: string | null, b?: string | null) {
  const aTokens = tokens(a)
  const bTokens = tokens(b)

  if (aTokens.length === 0 || bTokens.length === 0) {
    return false
  }

  const shared = aTokens.filter((token) => bTokens.includes(token))
  const required = Math.min(2, Math.min(aTokens.length, bTokens.length))

  return shared.length >= required
}

function sameMatch(match: MatchLike, entry: BroadcastCalendarEntry) {
  const matchTime = match.starts_at
    ? new Date(match.starts_at).getTime()
    : Number.NaN
  const entryTime = new Date(entry.startsAt).getTime()

  if (!Number.isFinite(matchTime) || !Number.isFinite(entryTime)) {
    return false
  }

  const sameDay =
    new Date(matchTime).toISOString().slice(0, 10) ===
    new Date(entryTime).toISOString().slice(0, 10)
  const closeKickoff =
    Math.abs(matchTime - entryTime) <= 2 * 60 * 60 * 1000

  const directTeams =
    sameTeam(match.home_team, entry.homeTeam) &&
    sameTeam(match.away_team, entry.awayTeam)
  const invertedTeams =
    sameTeam(match.home_team, entry.awayTeam) &&
    sameTeam(match.away_team, entry.homeTeam)

  return (sameDay || closeKickoff) && (directTeams || invertedTeams)
}

async function fetchJson<T>(url: string): Promise<T | null> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 3500)

  try {
    const response = await fetch(url, {
      cache: "no-store",
      headers: {
        accept: "application/json",
      },
      signal: controller.signal,
    })

    if (!response.ok) {
      return null
    }

    return (await response.json()) as T
  } catch {
    return null
  } finally {
    clearTimeout(timeout)
  }
}

async function fetchText(
  url: string,
  headers?: HeadersInit
): Promise<string | null> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 5000)

  try {
    const response = await fetch(url, {
      cache: "no-store",
      headers: {
        accept: "text/html",
        "user-agent": "QueensArena data importer",
        ...headers,
      },
      signal: controller.signal,
    })

    if (!response.ok) {
      return null
    }

    return await response.text()
  } catch {
    return null
  } finally {
    clearTimeout(timeout)
  }
}

function decodeHtml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

function inferSportFromWsport(
  title: string,
  description: string
) {
  const text = normalize(`${title} ${description}`)

  if (
    text.includes("football") ||
    text.includes("serie a") ||
    text.includes("coppa italia") ||
    text.includes("usl") ||
    text.includes("bundesliga") ||
    text.includes("barclays") ||
    text.includes("soccer")
  ) {
    return "Football"
  }

  if (text.includes("netball") || text.includes("nsl")) {
    return "Netball"
  }

  if (text.includes("softball") || text.includes("wswc")) {
    return "Softball"
  }

  if (text.includes("basketball")) {
    return "Basketball"
  }

  if (text.includes("volleyball")) {
    return "Volleyball"
  }

  return "Women's Sport"
}

function parseWsportDate(label: string, year: number) {
  const cleaned = decodeHtml(label)
  const match = cleaned.match(/([A-Za-z]{3})\s+(\d{1,2})/)

  if (!match) {
    return null
  }

  const monthIndex = [
    "jan",
    "feb",
    "mar",
    "apr",
    "may",
    "jun",
    "jul",
    "aug",
    "sep",
    "oct",
    "nov",
    "dec",
  ].indexOf(match[1].toLowerCase())

  if (monthIndex < 0) {
    return null
  }

  const date = new Date(Date.UTC(year, monthIndex, Number(match[2])))
  const today = new Date()

  if (date.getTime() < today.getTime() - 30 * 24 * 60 * 60 * 1000) {
    date.setUTCFullYear(year + 1)
  }

  return dateKey(date)
}

function combineDateAndTime(date: string, time: string) {
  const [hour, minute] = time.split(":").map(Number)

  if (
    !date ||
    !Number.isFinite(hour) ||
    !Number.isFinite(minute)
  ) {
    return null
  }

  const [year, month, day] = date.split("-").map(Number)
  const localDate = new Date(year, month - 1, day, hour, minute)

  return localDate.toISOString()
}

function splitTeams(value: string) {
  const match = value.match(/\s+(?:v|vs)\.?\s+/i)

  if (!match || match.index === undefined) {
    return null
  }

  const homeTeam = value.slice(0, match.index).trim()
  const awayTeam = value
    .slice(match.index + match[0].length)
    .trim()

  if (!homeTeam || !awayTeam) {
    return null
  }

  return { homeTeam, awayTeam }
}

function sportTvTimestampToIso(value?: string | number) {
  const timestamp = Number(value)

  if (!Number.isFinite(timestamp) || timestamp <= 0) {
    return null
  }

  return new Date(timestamp * 1000).toISOString()
}

function millisTimestampToIso(value?: string | number | null) {
  const timestamp = Number(value)

  if (!Number.isFinite(timestamp) || timestamp <= 0) {
    return null
  }

  return new Date(timestamp).toISOString()
}

function mapSportTvEvent(event: SportTvEvent): BroadcastCalendarEntry | null {
  const startsAt = sportTvTimestampToIso(event.date)
  const homeTeam = event.localTeam?.name?.trim()
  const awayTeam = event.visitorTeam?.name?.trim()
  const competition = event.competition?.name?.trim()

  if (!startsAt || !homeTeam || !awayTeam || !competition) {
    return null
  }

  return {
    id: `sporttv-${event.id || `${startsAt}-${homeTeam}-${awayTeam}`}`,
    source: "SPORT TV",
    channel: "SPORT TV",
    label: "SPORT TV",
    url: SPORT_TV_PUBLIC_URL,
    sourceUrl: SPORT_TV_PUBLIC_URL,
    sport: "Football",
    competition,
    homeTeam,
    awayTeam,
    startsAt,
    status: "source-schedule",
    notePt: "Transmissão desportiva.",
    noteEn: "Sports broadcast.",
  }
}

function canal11Competition(event: Canal11Event) {
  const parentTitle = event.mediaIdentities
    ?.flatMap((identity) => identity.mediaParentIdentities || [])
    .map((identity) => identity.title?.trim())
    .find(Boolean)

  if (parentTitle) return parentTitle

  return event.title?.split(" - ")[0]?.trim() || "Canal 11"
}

function mapCanal11Event(event: Canal11Event): BroadcastCalendarEntry | null {
  const startsAt = millisTimestampToIso(
    event.gameStartDate || event.event_date
  )
  const homeTeam = cleanCanal11TeamName(
    event.eventTeams?.homeTeam?.shortName ||
      event.eventTeams?.homeTeam?.name
  )
  const awayTeam = cleanCanal11TeamName(
    event.eventTeams?.awayTeam?.shortName ||
      event.eventTeams?.awayTeam?.name
  )
  const id = event.event_id || event._id

  if (!startsAt || !homeTeam || !awayTeam || !id) {
    return null
  }

  const url = `${CANAL11_PUBLIC_URL}events/${encodeURIComponent(id)}`

  return {
    id: `canal11-${id}`,
    source: "Canal 11",
    channel: "Canal 11",
    label: "Canal 11",
    url,
    sourceUrl: url,
    sport: mapCanal11Sport(event.sportType),
    competition: canal11Competition(event),
    homeTeam,
    awayTeam,
    startsAt,
    status: "source-schedule",
    notePt: "Transmissão indicada pelo Canal 11.",
    noteEn: "Broadcast listed by Canal 11.",
  }
}

export async function fetchSportTvBroadcastCalendar(days = 30) {
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)

  const requests = Array.from({ length: days }, (_, index) => {
    const day = dateKey(addDays(today, index))
    return fetchJson<SportTvEvent[]>(`${SPORT_TV_DAILY_URL}${day}`)
  })

  const results = await Promise.allSettled(requests)
  const entries = results
    .flatMap((result) =>
      result.status === "fulfilled" && Array.isArray(result.value)
        ? result.value
        : []
    )
    .filter(isWomenSportTvEvent)
    .map(mapSportTvEvent)
    .filter((entry): entry is BroadcastCalendarEntry => Boolean(entry))

  return entries.sort(
    (a, b) =>
      new Date(a.startsAt).getTime() -
      new Date(b.startsAt).getTime()
  )
}

export async function fetchWsportBroadcastCalendar() {
  const html = await fetchText(W_SPORT_PUBLIC_URL, {
    cookie: "set_country=https%3A%2F%2Fwww.w-sport.com%2Fpt%2F",
  })

  if (!html) {
    return []
  }

  const year = new Date().getFullYear()
  const dateLabels = Array.from(
    html.matchAll(
      /<div class='match_date_item'>[\s\S]*?<strong>(.*?)<\/strong>[\s\S]*?<\/div><\/div>/g
    )
  )
    .map((match) => parseWsportDate(match[1], year))
    .filter((date): date is string => Boolean(date))

  const listSectionStart = html.indexOf("schedule_match_list_slider")

  if (listSectionStart < 0 || dateLabels.length === 0) {
    return []
  }

  const listSection = html.slice(listSectionStart)
  const wraps = listSection
    .split("<div class='schedule_list_wrap'>")
    .slice(1, dateLabels.length + 1)
  const entries: BroadcastCalendarEntry[] = []

  wraps.forEach((wrapHtml, dayIndex) => {
    const date = dateLabels[dayIndex]

    if (!date) {
      return
    }

    const items = wrapHtml
      .split("<div class='schedule_list_item")
      .slice(1)

    items.forEach((itemHtml, itemIndex) => {
      const opening = itemHtml.match(/^([^>]*)>/)?.[1] || ""
      const time =
        opening.match(/data-time='([^']+)'/)?.[1] ||
        itemHtml.match(/<div class='schedule_time'><span>(.*?)<\/span>/)?.[1]
      const title = decodeHtml(
        itemHtml.match(/<h3 class='schedule_ttl'>(.*?)<\/h3>/)?.[1] ||
          ""
      )
      const teamText = decodeHtml(
        itemHtml.match(
          /<span class='schedule_team'>(.*?)<\/span>/
        )?.[1] || ""
      )
      const description = decodeHtml(
        itemHtml.match(/<div class='schedule_cnt'>(.*?)<\/div>/)?.[1] ||
          ""
      )
      const teams = splitTeams(teamText)
      const startsAt = time ? combineDateAndTime(date, time) : null

      if (!teams || !startsAt || !title) {
        return
      }

      entries.push({
        id: `wsport-${date}-${time}-${itemIndex}-${normalize(teamText).replace(/\s+/g, "-")}`,
        source: "W-Sport",
        channel: "W-Sport",
        label: "W-Sport",
        url: W_SPORT_PUBLIC_URL,
        sourceUrl: W_SPORT_PUBLIC_URL,
        sport: inferSportFromWsport(title, description),
        competition: title,
        homeTeam: teams.homeTeam,
        awayTeam: teams.awayTeam,
        startsAt,
        status: "source-schedule",
        notePt: "Transmissão desportiva.",
        noteEn: "Sports broadcast.",
      })
    })
  })

  return entries.sort(
    (a, b) =>
      new Date(a.startsAt).getTime() -
      new Date(b.startsAt).getTime()
  )
}

async function fetchCanal11Page(status: "upcoming" | "live", page: number) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 5000)

  try {
    const response = await fetch(CANAL11_EVENT_LIST_URL, {
      method: "POST",
      cache: "no-store",
      headers: {
        accept: "application/json",
        authorization: "HALO",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        page,
        size: 50,
        next: true,
        count: true,
        filters: { status },
      }),
      signal: controller.signal,
    })

    if (!response.ok) {
      return []
    }

    const data = (await response.json()) as Canal11ListResponse
    return data.content?.entries || []
  } catch {
    return []
  } finally {
    clearTimeout(timeout)
  }
}

export async function fetchCanal11BroadcastCalendar() {
  const statuses: Array<"upcoming" | "live"> = ["live", "upcoming"]
  const results = await Promise.all(
    statuses.map((status) => fetchCanal11Page(status, 0))
  )

  const entries = results
    .flat()
    .filter(isWomenCanal11Event)
    .map(mapCanal11Event)
    .filter((entry): entry is BroadcastCalendarEntry => Boolean(entry))

  return entries.sort(
    (a, b) =>
      new Date(a.startsAt).getTime() -
      new Date(b.startsAt).getTime()
  )
}

export async function fetchBroadcastCalendarEntries(days = 30) {
  const [sportTv, wSport, canal11] = await Promise.all([
    fetchSportTvBroadcastCalendar(days),
    fetchWsportBroadcastCalendar(),
    fetchCanal11BroadcastCalendar(),
  ])

  return [...sportTv, ...wSport, ...canal11].sort(
    (a, b) =>
      new Date(a.startsAt).getTime() -
      new Date(b.startsAt).getTime()
  )
}

export function findBroadcastCalendarEntry(
  match: MatchLike,
  entries: BroadcastCalendarEntry[]
) {
  return entries.find((entry) => sameMatch(match, entry))
}

export function getBestBroadcastForMatch(
  match: MatchLike,
  entries: BroadcastCalendarEntry[]
): MatchBroadcastInfo | undefined {
  const scheduled = findBroadcastCalendarEntry(match, entries)

  if (scheduled) {
    return scheduled
  }

  return getMatchBroadcastInfo({
    sport: match.sport,
    region: match.region,
    competition: match.competition,
    homeTeam: match.home_team,
    awayTeam: match.away_team,
  })[0]
}
