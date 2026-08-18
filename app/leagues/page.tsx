import Link from "next/link"
import {
  ArrowRight,
  Flag,
  Trophy,
} from "lucide-react"
import { AdSlot } from "@/components/ad-slot"
import { adSlots } from "@/lib/ads"
import {
  fetchQueensArenaCompetitions,
  fetchQueensArenaMatches,
} from "@/lib/queensarena-data"
import { getServerDictionary } from "@/lib/server-i18n"
import {
  SPORTS,
  TRACKED_COMPETITIONS,
  canonicalCompetitionDisplayName,
  isSportKey,
} from "@/lib/sports-config"

interface Props {
  searchParams?: Promise<{
    sport?: string
    region?: string
  }>
}

function sportNameFromKey(key?: string) {
  if (!key || !isSportKey(key)) {
    return ""
  }

  return (
    SPORTS.find((sport) => sport.key === key)
      ?.name || ""
  )
}

type CatalogCompetition = {
  key: string
  name: string
  sport: string
  region: string
  sourceStatus:
    | "live-api"
    | "provider-ready"
    | "manual-watchlist"
    | "pending"
  note: string
  dynamic: boolean
  matchCount?: number
  bestSeason?: string
  bestSeasonMatches?: number
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

function buildDynamicKey(
  sport: string,
  region: string,
  competition: string
) {
  return `data-${slugify(sport)}-${slugify(region)}-${slugify(competition)}`
}

function buildMatchesHref(
  competition: CatalogCompetition
) {
  const sport =
    SPORTS.find(
      (item) => item.name === competition.sport
    )?.key || "football"

  const params = new URLSearchParams({
    sport,
    region: competition.region,
    competition: competition.key,
    section: "standings",
  })

  if (competition.bestSeason) {
    params.set("season", competition.bestSeason)
  }

  return `/matches?${params.toString()}`
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
}

function competitionKey(
  sport: string,
  region: string,
  competition: string
) {
  return `${normalize(sport)}:${normalize(region)}:${normalize(
    canonicalCompetitionDisplayName(
      competition,
      sport
    )
  )}`
}

function seasonFromDate(value?: string | null) {
  if (!value) return null

  const year = new Date(value).getUTCFullYear()
  return Number.isFinite(year) ? String(year) : null
}

function seasonFromMatch(match: {
  starts_at?: string | null
  season?: string | null
}) {
  const season = String(match.season || "")

  if (/^\d{4}$/.test(season)) {
    return season
  }

  return seasonFromDate(match.starts_at)
}

function bestSeasonFromCounts(
  seasons: Map<string, number>
) {
  const entries = [...seasons.entries()]

  if (entries.length === 0) return null

  const strongSeason = entries
    .filter(([, count]) => count >= 10)
    .sort((a, b) => Number(b[0]) - Number(a[0]))[0]

  return (
    strongSeason ||
    entries.sort(
      (a, b) =>
        b[1] - a[1] ||
        Number(b[0]) - Number(a[0])
    )[0]
  )
}

export default async function LeaguesPage({
  searchParams,
}: Props) {
  const dictionary = await getServerDictionary()
  const sources =
    await fetchQueensArenaCompetitions()
  const params = await searchParams
  const selectedSportKey = isSportKey(
    params?.sport || ""
  )
    ? params?.sport
    : ""
  const selectedRegionParam =
    params?.region || ""
  const selectedSportName =
    sportNameFromKey(selectedSportKey)
  const matches = selectedSportName
    ? await fetchQueensArenaMatches({
        limit: 15000,
        sport: selectedSportName,
      })
    : []
  const competitionMap = new Map<
    string,
    CatalogCompetition
  >()

  for (const competition of TRACKED_COMPETITIONS) {
    competitionMap.set(
      `${competition.sport}:${competition.region}:${competition.name}`,
      {
        key: competition.key,
        name: competition.name,
        sport: competition.sport,
        region: competition.region,
        sourceStatus:
          competition.sourceStatus,
        note: competition.note,
        dynamic: false,
      }
    )
  }

  for (const source of sources) {
    if (!source.sport || !source.competition) {
      continue
    }

    const sourceRecord = source as typeof source & {
      country?: string | null
      region?: string | null
      source_url?: string | null
      coverage_level?: string | null
      reliability?: string | null
    }
    const region =
      sourceRecord.region ||
      sourceRecord.country ||
      "Global"
    const competitionName =
      canonicalCompetitionDisplayName(
        source.competition,
        source.sport
      )
    const key = `${source.sport}:${region}:${competitionName}`

    if (!competitionMap.has(key)) {
      competitionMap.set(key, {
        key: buildDynamicKey(
          source.sport,
          region,
          competitionName
        ),
        name: competitionName,
        sport: source.sport,
        region,
        sourceStatus: source.enabled
          ? "live-api"
          : "provider-ready",
        note:
          sourceRecord.coverage_level === "api-history"
            ? `Dados históricos importados via ${source.provider || "QueensArena"}.`
            : `Dados ligados via ${source.provider || "QueensArena"}.`,
        dynamic: true,
      })
    }
  }

  const matchSummaries = new Map<
    string,
    {
      count: number
      seasons: Map<string, number>
    }
  >()

  for (const match of matches) {
    const key = competitionKey(
      match.sport,
      match.region || "Global",
      match.competition
    )
    const current =
      matchSummaries.get(key) || {
        count: 0,
        seasons: new Map<string, number>(),
      }
    const season = seasonFromMatch(match)

    current.count += 1

    if (season) {
      current.seasons.set(
        season,
        (current.seasons.get(season) || 0) + 1
      )
    }

    matchSummaries.set(key, current)
  }

  for (const competition of competitionMap.values()) {
    const summary = matchSummaries.get(
      competitionKey(
        competition.sport,
        competition.region,
        competition.name
      )
    )

    if (summary) {
      const bestSeason =
        bestSeasonFromCounts(summary.seasons)

      competition.matchCount = summary.count
      competition.bestSeason = bestSeason?.[0]
      competition.bestSeasonMatches =
        bestSeason?.[1]
    }
  }

  const allCompetitions = selectedSportName
    ? [...competitionMap.values()]
        .filter(
          (competition) =>
            competition.sport === selectedSportName
        )
        .sort(
          (a, b) =>
            a.region.localeCompare(b.region) ||
            a.name.localeCompare(b.name)
        )
    : []

  const regions = [
    ...new Set(
      allCompetitions.map(
        (competition) => competition.region
      )
    ),
  ].sort((a, b) => {
    if (a === "Portugal") return -1
    if (b === "Portugal") return 1
    if (a === "Europa") return -1
    if (b === "Europa") return 1
    if (a === "Mundo") return 1
    if (b === "Mundo") return -1

    return a.localeCompare(b)
  })

  const activeRegion = regions.includes(
    selectedRegionParam
  )
    ? selectedRegionParam
    : regions.includes("Portugal")
      ? "Portugal"
      : regions[0] || ""

  const competitions = activeRegion
    ? allCompetitions.filter(
        (competition) =>
          competition.region === activeRegion
      )
    : allCompetitions

  function getStatusLabel(status: string) {
    if (status === "live-api") {
      return "Dados ligados"
    }

    if (status === "provider-ready") {
      return "Pronta para fornecedor"
    }

    if (status === "manual-watchlist") {
      return "Cobertura acompanhada"
    }

    return "Em validação"
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
        <section className="mb-6">
          <div className="mb-3 inline-flex items-center gap-2 rounded-lg border border-yellow-500/20 bg-yellow-500/10 px-3 py-2 text-xs font-bold uppercase text-yellow-300">
            <Trophy className="h-4 w-4" />
            {dictionary.nav.leagues}
          </div>

          <h1 className="text-4xl font-black md:text-5xl">
            {dictionary.competitions.title}
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 md:text-base">
            Escolhe uma modalidade. Depois entram apenas as
            competições dessa modalidade.
          </p>
        </section>

        <section className="mb-6 flex gap-2 overflow-x-auto pb-1">
          {SPORTS.map((sport) => (
            <Link
              key={sport.key}
              href={`/leagues?sport=${sport.key}`}
              className={`shrink-0 rounded-lg border px-4 py-3 text-sm font-black transition ${
                selectedSportKey === sport.key
                  ? "border-yellow-400 bg-yellow-400 text-black"
                  : "border-white/[0.08] bg-white/[0.03] text-zinc-300 hover:border-yellow-400/30"
              }`}
            >
              {sport.labelPt}
            </Link>
          ))}
        </section>

        {!selectedSportName ? (
          <section className="rounded-lg border border-white/[0.06] bg-[#0b0b0b] p-5 text-sm text-zinc-400">
            Escolhe uma modalidade para veres apenas as
            competições dessa modalidade.
          </section>
        ) : null}

        {selectedSportName ? (
          <>
            <section className="mb-5 flex gap-2 overflow-x-auto pb-1">
              {regions.map((region) => (
                <Link
                  key={region}
                  href={`/leagues?sport=${selectedSportKey}&region=${encodeURIComponent(region)}`}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-lg border px-4 py-3 text-sm font-black transition ${
                    activeRegion === region
                      ? "border-yellow-400 bg-yellow-400 text-black"
                      : "border-white/[0.08] bg-white/[0.03] text-zinc-300 hover:border-yellow-400/30"
                  }`}
                >
                  <Flag className="h-4 w-4" />
                  {region}
                  <span
                    className={`text-xs ${
                      activeRegion === region
                        ? "text-black/60"
                        : "text-zinc-500"
                    }`}
                  >
                    {
                      allCompetitions.filter(
                        (competition) =>
                          competition.region === region
                      ).length
                    }
                  </span>
                </Link>
              ))}
            </section>

            <section className="overflow-hidden rounded-lg border border-white/[0.06] bg-[#0b0b0b]">
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[920px] text-left text-sm">
                  <thead className="bg-white/[0.03] text-xs uppercase text-zinc-500">
                    <tr className="border-b border-white/[0.06]">
                      <th className="px-4 py-3">País</th>
                      <th className="px-4 py-3">Competição</th>
                      <th className="px-4 py-3 text-right">Jogos</th>
                      <th className="px-4 py-3">Época</th>
                      <th className="px-4 py-3">Estado</th>
                      <th className="px-4 py-3 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {competitions.map((competition) => (
                      <tr
                        key={competition.key}
                        id={competition.key}
                        className="border-b border-white/[0.04] transition hover:bg-white/[0.03]"
                      >
                        <td className="whitespace-nowrap px-4 py-3 text-xs font-black uppercase text-yellow-400">
                          {competition.region}
                        </td>
                        <td className="px-4 py-3">
                          <span className="block font-black">
                            {competition.name}
                          </span>
                          <span className="mt-1 block text-xs font-bold text-zinc-500">
                            {competition.sport}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-black">
                          {competition.matchCount || "-"}
                        </td>
                        <td className="px-4 py-3 text-zinc-400">
                          {competition.bestSeason || "-"}
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-md border border-green-500/20 bg-green-500/10 px-2 py-1 text-xs font-bold text-green-300">
                            {getStatusLabel(
                              competition.sourceStatus
                            )}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={
                              competition.dynamic
                                ? buildMatchesHref(
                                    competition
                                  )
                                : `/leagues/${competition.key}`
                            }
                            className="inline-flex items-center gap-2 rounded-lg bg-yellow-400 px-3 py-2 text-xs font-black text-black transition hover:bg-yellow-300"
                          >
                            Abrir
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-white/[0.06] md:hidden">
                {competitions.map((competition) => (
                  <article
                    key={competition.key}
                    id={competition.key}
                    className="p-4"
                  >
                    <div className="mb-2 flex items-center justify-between gap-3 text-xs font-black uppercase">
                      <span className="text-yellow-400">
                        {competition.region}
                      </span>
                      <span className="text-zinc-500">
                        {competition.bestSeason
                          ? `Época ${competition.bestSeason}`
                          : "Época -"}
                      </span>
                    </div>
                    <h2 className="text-base font-black">
                      {competition.name}
                    </h2>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span className="text-sm font-bold text-zinc-500">
                        {competition.matchCount || 0} jogos
                      </span>
                      <Link
                        href={
                          competition.dynamic
                            ? buildMatchesHref(
                                competition
                              )
                            : `/leagues/${competition.key}`
                        }
                        className="inline-flex items-center gap-2 rounded-lg bg-yellow-400 px-3 py-2 text-xs font-black text-black transition hover:bg-yellow-300"
                      >
                        Abrir
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </>
        ) : null}

        <Link
          href="/sources"
          className="mt-6 inline-flex rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm font-bold text-zinc-300 transition hover:text-white"
        >
          Ver fontes e metodologia
        </Link>
      </div>
      <AdSlot slot={adSlots.leagues} />
    </main>
  )
}

