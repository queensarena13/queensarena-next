"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  BarChart3,
  CalendarDays,
  ChevronRight,
  Clock,
  Flag,
  ListChecks,
  Radio,
  Shield,
  Trophy,
  Tv,
  UsersRound,
} from "lucide-react"
import {
  useEffect,
  useMemo,
  useState,
} from "react"
import type { ReactNode } from "react"
import { DataStatusCard } from "@/components/data-status-card"
import { TeamAvatar } from "@/components/team-avatar"
import { useLanguage } from "@/components/language-provider"
import { getMatchBroadcastInfo } from "@/lib/broadcast-sources"
import {
  toHtmlLang,
  type Locale,
} from "@/lib/i18n"
import {
  findTrackedTeamByName,
  HISTORICAL_SEASONS,
  isSportKey,
  SPORTS,
  canonicalCompetitionDisplayName,
  type SportKey,
  TRACKED_COMPETITIONS,
  TRACKED_TEAMS,
} from "@/lib/sports-config"

interface Match {
  external_id: string
  home_team: string
  away_team: string
  home_score: number | null
  away_score: number | null
  status: string
  sport: string
  competition: string
  region: string
  venue?: string
  starts_at: string
}

interface MatchesResponse {
  generatedAt?: string
  matches: Match[]
}

interface CompetitionSource {
  sport?: string | null
  competition?: string | null
  season?: string | null
  country?: string | null
  region?: string | null
  provider?: string | null
  coverage_level?: string | null
  enabled?: boolean | null
}

interface CompetitionsResponse {
  competitions?: CompetitionSource[]
}

interface PublicTeam {
  name?: string | null
  sport?: string | null
  logo_url?: string | null
}

interface PublicTeamsResponse {
  teams?: PublicTeam[]
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
}

interface StandingRow {
  team: string
  played: number
  won: number
  draw: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  points: number
}

const REFRESH_MS = 30_000

function getTeamHref(teamName: string) {
  const team = findTrackedTeamByName(teamName)

  return `/teams/${
    team ? team.key : encodeURIComponent(teamName)
  }`
}

function isLive(status: string) {
  return ["LIVE", "HALFTIME"].includes(status)
}

function emptyStanding(team: string): StandingRow {
  return {
    team,
    played: 0,
    won: 0,
    draw: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    points: 0,
  }
}

function addResult(
  row: StandingRow,
  goalsFor: number,
  goalsAgainst: number
) {
  row.played += 1
  row.goalsFor += goalsFor
  row.goalsAgainst += goalsAgainst

  if (goalsFor > goalsAgainst) {
    row.won += 1
    row.points += 3
  } else if (goalsFor === goalsAgainst) {
    row.draw += 1
    row.points += 1
  } else {
    row.lost += 1
  }
}

function buildStandings(matches: Match[]) {
  const table = new Map<string, StandingRow>()

  for (const match of matches) {
    if (match.status !== "FINISHED") continue
    if (
      match.home_score === null ||
      match.away_score === null
    ) {
      continue
    }

    const home =
      table.get(match.home_team) ||
      emptyStanding(match.home_team)
    const away =
      table.get(match.away_team) ||
      emptyStanding(match.away_team)

    addResult(
      home,
      match.home_score,
      match.away_score
    )
    addResult(
      away,
      match.away_score,
      match.home_score
    )

    table.set(match.home_team, home)
    table.set(match.away_team, away)
  }

  return [...table.values()].sort((a, b) => {
    const goalDiffA =
      a.goalsFor - a.goalsAgainst
    const goalDiffB =
      b.goalsFor - b.goalsAgainst

    return (
      b.points - a.points ||
      goalDiffB - goalDiffA ||
      b.goalsFor - a.goalsFor ||
      a.team.localeCompare(b.team)
    )
  })
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
}

function normalizeTeamLogoKey(
  name: string,
  sport?: string | null
) {
  return `${normalize(sport || "")}:${normalize(name)}`
}

function normalizeCompetitionForCompare(
  value: string,
  sport?: string | null
) {
  return normalize(
    canonicalCompetitionDisplayName(
      value,
      sport || undefined
    )
  )
}

function sameCompetition(
  match: Pick<Match, "competition" | "sport" | "region">,
  competition: Pick<
    CatalogCompetition,
    "name" | "sport" | "region"
  >
) {
  return (
    normalize(match.sport) ===
      normalize(competition.sport) &&
    normalize(match.region || "") ===
      normalize(competition.region || "") &&
    normalizeCompetitionForCompare(
      match.competition,
      match.sport
    ) ===
      normalizeCompetitionForCompare(
        competition.name,
        competition.sport
      )
  )
}

function getInitialParam(
  key: string,
  fallback: string
) {
  if (typeof window === "undefined") {
    return fallback
  }

  return (
    new URLSearchParams(
      window.location.search
    ).get(key) || fallback
  )
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

function sourceToCompetition(
  source: CompetitionSource
): CatalogCompetition | null {
  if (!source.sport || !source.competition) {
    return null
  }

  const region =
    source.region || source.country || "Global"
  const provider = source.provider || "QueensArena"
  const competitionName =
    canonicalCompetitionDisplayName(
      source.competition,
      source.sport
    )

  return {
    key: `data-${slugify(source.sport)}-${slugify(
      region
    )}-${slugify(competitionName)}`,
    name: competitionName,
    sport: source.sport,
    region,
    sourceStatus: source.enabled
      ? "live-api"
      : "provider-ready",
    note:
      source.coverage_level === "api-history"
        ? `Dados históricos importados via ${provider}.`
        : `Dados ligados via ${provider}.`,
  }
}

function StepButton({
  active,
  icon: Icon,
  label,
  meta,
  onClick,
}: {
  active: boolean
  icon: typeof Trophy
  label: string
  meta?: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-16 min-w-[150px] shrink-0 items-center gap-3 rounded-lg border px-4 text-left transition ${
        active
          ? "border-yellow-400 bg-yellow-400 text-black"
          : "border-white/[0.08] bg-[#0b0b0b] text-white hover:border-yellow-400/30"
      }`}
    >
      <Icon
        className={`h-5 w-5 shrink-0 ${
          active ? "text-black" : "text-yellow-400"
        }`}
      />
      <span className="min-w-0">
        <span className="block truncate text-sm font-black">
          {label}
        </span>
        {meta && (
          <span
            className={`mt-1 block truncate text-xs font-bold ${
              active
                ? "text-black/60"
                : "text-zinc-500"
            }`}
          >
            {meta}
          </span>
        )}
      </span>
    </button>
  )
}

export function MatchesDirectory() {
  const { dictionary, locale } =
    useLanguage()
  const router = useRouter()
  const [matches, setMatches] =
    useState<Match[]>([])
  const [sourceCompetitions, setSourceCompetitions] =
    useState<CatalogCompetition[]>([])
  const [teamLogoByKey, setTeamLogoByKey] =
    useState<Map<string, string>>(new Map())
  const [selectedSport, setSelectedSport] =
    useState<SportKey | "">(
      () => {
        const sport = getInitialParam(
          "sport",
          ""
        )

        return isSportKey(sport)
          ? sport
          : ""
      }
    )
  const [season, setSeason] =
    useState<(typeof HISTORICAL_SEASONS)[number]>(
      () => {
        const value = getInitialParam(
          "season",
          "2026"
        )

        return HISTORICAL_SEASONS.includes(
          value as
            (typeof HISTORICAL_SEASONS)[number]
        )
          ? (value as
              (typeof HISTORICAL_SEASONS)[number])
          : "2026"
      }
    )
  const [selectedRegion, setSelectedRegion] =
    useState(() =>
      getInitialParam("region", "Portugal")
    )
  const [selectedCompetition, setSelectedCompetition] =
    useState(() =>
      getInitialParam("competition", "")
    )
  const [activeSection, setActiveSection] =
    useState<
      | "live"
      | "standings"
      | "upcoming"
      | "finished"
      | "teams"
    >(() => {
      const section = getInitialParam(
        "section",
        "standings"
      )

      return section === "live" ||
        section === "upcoming" ||
        section === "finished" ||
        section === "teams"
        ? section
        : "standings"
    })
  const [loading, setLoading] =
    useState(true)
  const [generatedAt, setGeneratedAt] =
    useState<string | null>(null)
  const [referenceNow, setReferenceNow] =
    useState(0)

  useEffect(() => {
    let active = true

    async function loadCompetitions() {
      const response = await fetch(
        `/api/public/competitions?t=${Date.now()}`,
        {
          cache: "no-store",
        }
      )
      const data =
        (await response.json()) as CompetitionsResponse
      const mapped = (data.competitions || [])
        .map(sourceToCompetition)
        .filter(Boolean) as CatalogCompetition[]

      if (!active) return

      setSourceCompetitions(mapped)
    }

    void loadCompetitions()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true

    async function loadTeamLogos() {
      const response = await fetch(
        `/api/public/teams?limit=3000&t=${Date.now()}`,
        {
          cache: "no-store",
        }
      )
      const data =
        (await response.json()) as PublicTeamsResponse
      const logoMap = new Map<string, string>()

      for (const team of data.teams || []) {
        if (!team.name || !team.sport || !team.logo_url) {
          continue
        }

        logoMap.set(
          normalizeTeamLogoKey(team.name, team.sport),
          team.logo_url
        )
      }

      if (active) {
        setTeamLogoByKey(logoMap)
      }
    }

    void loadTeamLogos()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true

    async function loadMatches() {
      const currentSportName =
        SPORTS.find(
          (sport) => sport.key === selectedSport
        )?.name || ""
      const currentCompetitionName =
        TRACKED_COMPETITIONS.find(
          (competition) =>
            competition.key ===
              selectedCompetition ||
            competition.name ===
              selectedCompetition
        )?.name ||
        sourceCompetitions.find(
          (competition) =>
            competition.key ===
              selectedCompetition ||
            competition.name ===
              selectedCompetition
        )?.name ||
        ""
      const params = new URLSearchParams({
        limit: "15000",
        season,
        t: String(Date.now()),
      })

      if (currentSportName) {
        params.set("sport", currentSportName)
      }

      if (currentCompetitionName) {
        params.set(
          "competition",
          currentCompetitionName
        )
      }

      const response = await fetch(
        `/api/football/matches?${params.toString()}`,
        {
          cache: "no-store",
        }
      )

      const data =
        (await response.json()) as MatchesResponse

      if (!active) return

      setMatches(data.matches || [])
      setGeneratedAt(data.generatedAt || null)
      setReferenceNow(Date.now())
      setLoading(false)
    }

    void loadMatches()

    const intervalId = setInterval(() => {
      void loadMatches()
    }, REFRESH_MS)

    return () => {
      active = false
      clearInterval(intervalId)
    }
  }, [
    season,
    selectedSport,
    selectedCompetition,
    sourceCompetitions,
  ])

  function updateAddress(
    next: Partial<{
      sport: string
      season: string
      region: string
      competition: string
      section: string
    }>
  ) {
    const params = new URLSearchParams(
      typeof window === "undefined"
        ? ""
        : window.location.search
    )
    const values = {
      sport: selectedSport,
      season,
      region: selectedRegion,
      competition: selectedCompetition,
      section: activeSection,
      ...next,
    }

    for (const [key, value] of Object.entries(
      values
    )) {
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    }

    router.replace(`/matches?${params.toString()}`, {
      scroll: false,
    })
  }

  const selectedSportInfo =
    SPORTS.find(
      (sport) => sport.key === selectedSport
    )

  const sportName = selectedSportInfo?.name || ""

  const catalogCompetitions = useMemo(() => {
    const map = new Map<string, CatalogCompetition>()

    for (const competition of TRACKED_COMPETITIONS) {
      map.set(
        `${competition.sport}:${competition.region}:${competition.name}`,
        {
          key: competition.key,
          name: competition.name,
          sport: competition.sport,
          region: competition.region,
          sourceStatus:
            competition.sourceStatus,
          note: competition.note,
        }
      )
    }

    for (const competition of sourceCompetitions) {
      const key = `${competition.sport}:${competition.region}:${competition.name}`

      if (!map.has(key)) {
        map.set(key, competition)
      }
    }

    return [...map.values()].sort((a, b) =>
      a.region.localeCompare(b.region) ||
      a.name.localeCompare(b.name)
    )
  }, [sourceCompetitions])

  const competitionsForSport = useMemo(
    () =>
      catalogCompetitions.filter(
        (competition) =>
          sportName &&
          competition.sport === sportName
      ),
    [catalogCompetitions, sportName]
  )

  const regions = useMemo<string[]>(
    () => [
      ...new Set(
        competitionsForSport.map(
          (competition) => competition.region
        )
      ),
    ],
    [competitionsForSport]
  )

  const activeRegion = regions.includes(
    selectedRegion
  )
    ? selectedRegion
    : regions[0] || ""

  const competitionsForRegion = useMemo(
    () =>
      competitionsForSport.filter(
        (competition) =>
          competition.region === activeRegion
      ),
    [
      competitionsForSport,
      activeRegion,
    ]
  )

  const selectedCompetitionInfo =
    selectedCompetition
      ? competitionsForRegion.find(
          (competition) =>
            competition.key === selectedCompetition ||
            competition.name === selectedCompetition
        )
      : undefined

  const readyForCompetition = Boolean(
    selectedSport &&
      activeRegion &&
      selectedCompetitionInfo
  )

  const competitionMatches = useMemo(
    () =>
      matches.filter(
        (match) =>
          readyForCompetition &&
          selectedCompetitionInfo &&
          sameCompetition(
            match,
            selectedCompetitionInfo
          )
      ),
    [
      matches,
      selectedCompetitionInfo,
      readyForCompetition,
    ]
  )

  const liveMatches = competitionMatches.filter(
    (match) => isLive(match.status)
  )
  const upcomingMatches = competitionMatches
    .filter(
      (match) =>
        match.status === "SCHEDULED" &&
        new Date(match.starts_at).getTime() >=
          referenceNow - 60 * 60 * 1000
    )
    .sort(
      (a, b) =>
        new Date(a.starts_at).getTime() -
        new Date(b.starts_at).getTime()
    )
  const finishedMatches = competitionMatches
    .filter(
      (match) =>
        match.status === "FINISHED"
    )
    .sort(
      (a, b) =>
        new Date(b.starts_at).getTime() -
        new Date(a.starts_at).getTime()
    )
  const standings =
    buildStandings(competitionMatches)

  const trackedTeams = TRACKED_TEAMS.filter(
    (team) =>
      normalize(team.sport) ===
        normalize(sportName) &&
      readyForCompetition &&
      selectedCompetitionInfo &&
      normalizeCompetitionForCompare(
        team.competition,
        team.sport
      ) ===
        normalizeCompetitionForCompare(
          selectedCompetitionInfo.name,
          selectedCompetitionInfo.sport
        )
  )

  const matchTeams = [
    ...new Set(
      competitionMatches.flatMap((match) => [
        match.home_team,
        match.away_team,
      ])
    ),
  ]
  const teams =
    trackedTeams.length > 0
      ? trackedTeams.map((team) => team.name)
      : matchTeams

  const sections = [
    {
      key: "live" as const,
      label: dictionary.common.live,
      value: liveMatches.length,
      icon: Radio,
    },
    {
      key: "standings" as const,
      label: dictionary.standings.title,
      value: standings.length,
      icon: BarChart3,
    },
    {
      key: "upcoming" as const,
      label: dictionary.matchesPage.upcomingMatches,
      value: upcomingMatches.length,
      icon: CalendarDays,
    },
    {
      key: "finished" as const,
      label: dictionary.matchesPage.finishedMatches,
      value: finishedMatches.length,
      icon: Clock,
    },
    {
      key: "teams" as const,
      label: dictionary.nav.teams,
      value: teams.length,
      icon: UsersRound,
    },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
      <section className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-lg border border-yellow-500/20 bg-yellow-500/10 px-3 py-2 text-xs font-bold uppercase text-yellow-300">
          <ListChecks className="h-4 w-4" />
          {dictionary.home.modalitiesAction}
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl font-black md:text-5xl">
              {dictionary.nav.matches}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 md:text-base">
              {dictionary.matchesPage.description}
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-zinc-400">
            <Radio className="h-4 w-4 text-green-300" />
            {generatedAt
              ? `${dictionary.common.lastUpdated}: ${new Date(
                  generatedAt
                ).toLocaleTimeString(
                  toHtmlLang(locale)
                )}`
              : dictionary.common.loading}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <StepGroup title={`1. ${dictionary.matchesPage.sport}`}>
          {SPORTS.map((sport) => (
            <StepButton
              key={sport.key}
              active={selectedSport === sport.key}
              icon={Trophy}
              label={
                locale === "pt"
                  ? sport.labelPt
                  : sport.name
              }
              meta={dictionary.matchesPage.sportMeta}
              onClick={() => {
                setSelectedSport(sport.key)
                setSelectedRegion("")
                setSelectedCompetition("")
                setActiveSection("standings")
                updateAddress({
                  sport: sport.key,
                  region: "",
                  competition: "",
                  section: "standings",
                })
              }}
            />
          ))}
        </StepGroup>

        {selectedSport ? (
          <StepGroup title={`2. ${dictionary.matchesPage.region}`}>
            {regions.map((region) => (
              <StepButton
                key={region}
                active={activeRegion === region}
                icon={Flag}
                label={region}
                meta={(() => {
                  const total =
                    competitionsForSport.filter(
                      (competition) =>
                        competition.region === region
                    ).length

                  return `${total} ${
                    total === 1
                      ? dictionary.matchesPage.oneCompetition
                      : dictionary.matchesPage.manyCompetitions
                  }`
                })()}
                onClick={() => {
                  setSelectedRegion(region)
                  setSelectedCompetition("")
                  setActiveSection("standings")
                  updateAddress({
                    region,
                    competition: "",
                    section: "standings",
                  })
                }}
              />
            ))}
          </StepGroup>
        ) : null}

        {selectedSport && activeRegion ? (
          <StepGroup title={`3. ${dictionary.matchesPage.competition}`}>
            {competitionsForRegion.map(
              (competition) => (
                <StepButton
                  key={competition.key}
                  active={
                    selectedCompetitionInfo?.key ===
                    competition.key
                  }
                  icon={Shield}
                  label={competition.name}
                  meta={competition.region}
                  onClick={() => {
                    setSelectedCompetition(
                      competition.key
                    )
                    setActiveSection("standings")
                    updateAddress({
                      competition:
                        competition.key,
                      section: "standings",
                    })
                  }}
                />
              )
            )}
          </StepGroup>
        ) : null}

        {readyForCompetition ? (
          <StepGroup title={`4. ${dictionary.matchesPage.year}`}>
          {HISTORICAL_SEASONS.map((item) => (
            <StepButton
              key={item}
              active={season === item}
              icon={CalendarDays}
              label={item}
              meta={dictionary.matchesPage.seasonMeta}
              onClick={() => {
                setSeason(item)
                setLoading(true)
                setActiveSection("standings")
                updateAddress({
                  season: item,
                  section: "standings",
                })
              }}
            />
          ))}
          </StepGroup>
        ) : null}
      </section>

      {readyForCompetition ? (
        <div className="mt-6">
        <DataStatusCard
          title={dictionary.matchesPage.coverageTitle}
          description={dictionary.matchesPage.coverageDescription}
          locale={locale}
          updatedAt={
            generatedAt
              ? new Date(
                  generatedAt
                ).toLocaleString(
                  toHtmlLang(locale)
                )
              : null
          }
        />
      </div>
      ) : null}

      {readyForCompetition ? (
        <section className="mt-6 rounded-lg border border-white/[0.06] bg-[#0b0b0b] p-4 md:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-yellow-400">
              {activeRegion} / {season}
            </p>
            <h2 className="mt-2 text-2xl font-black md:text-3xl">
              {selectedCompetitionInfo?.name ||
                dictionary.nav.leagues}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
              {selectedCompetitionInfo?.note ||
                dictionary.matchesPage.chooseCompetition}
            </p>
          </div>

          {liveMatches.length > 0 && (
            <span className="inline-flex w-fit items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/10 px-3 py-2 text-xs font-black uppercase text-green-300">
              <Radio className="h-4 w-4" />
              {liveMatches.length} {dictionary.matchesPage.liveCount}
            </span>
          )}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2 md:grid-cols-5">
          {sections.map((section) => {
            const Icon = section.icon

            return (
              <button
                key={section.key}
                type="button"
                onClick={() => {
                  setActiveSection(section.key)
                  updateAddress({
                    section: section.key,
                  })
                }}
                className={`rounded-lg border p-4 text-left transition ${
                  activeSection === section.key
                    ? "border-yellow-400 bg-yellow-400 text-black"
                    : "border-white/[0.08] bg-white/[0.03] hover:border-yellow-400/30"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <Icon
                    className={`h-5 w-5 ${
                      activeSection === section.key
                        ? "text-black"
                        : "text-yellow-400"
                    }`}
                  />
                  <span className="text-2xl font-black">
                    {section.value}
                  </span>
                </div>
                <p className="mt-3 text-sm font-black">
                  {section.label}
                </p>
              </button>
            )
          })}
        </div>

        <div className="mt-5">
          {loading ? (
            <EmptyState text={dictionary.common.loading} />
          ) : activeSection === "live" ? (
            <MatchList
              matches={liveMatches}
              empty={dictionary.matchesPage.liveEmpty}
              locale={locale}
              teamLogoByKey={teamLogoByKey}
            />
          ) : activeSection === "standings" ? (
            <StandingsTable
              rows={standings}
              locale={locale}
              sport={sportName}
              teamLogoByKey={teamLogoByKey}
            />
          ) : activeSection === "upcoming" ? (
            <MatchList
              matches={upcomingMatches}
              empty={dictionary.matchesPage.upcomingEmpty}
              locale={locale}
              teamLogoByKey={teamLogoByKey}
            />
          ) : activeSection === "finished" ? (
            <MatchList
              matches={finishedMatches}
              empty={dictionary.matchesPage.finishedEmpty}
              locale={locale}
              teamLogoByKey={teamLogoByKey}
            />
          ) : (
            <TeamsGrid
              teams={teams}
              empty={dictionary.matchesPage.teamsEmpty}
              sport={sportName}
              teamLogoByKey={teamLogoByKey}
            />
          )}
        </div>
        </section>
      ) : (
        <section className="mt-6 rounded-lg border border-white/[0.06] bg-[#0b0b0b] p-5">
          <EmptyState
            text={
              selectedSport
                ? dictionary.matchesPage.chooseCompetition
                : dictionary.matchesPage.chooseSport
            }
          />
        </section>
      )}
    </div>
  )
}

function StepGroup({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-black uppercase text-zinc-500">
        {title}
      </p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {children}
      </div>
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-5 text-sm text-zinc-400">
      {text}
    </div>
  )
}

function StandingsTable({
  rows,
  locale,
  sport,
  teamLogoByKey,
}: {
  rows: StandingRow[]
  locale: Locale
  sport: string
  teamLogoByKey: Map<string, string>
}) {
  const dictionary = dictionariesForLocale(locale)

  if (rows.length === 0) {
    return (
      <EmptyState
        text={dictionary.matchesPage.standingsEmpty}
      />
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[680px] text-left text-sm">
        <thead className="text-xs uppercase text-zinc-500">
          <tr className="border-b border-white/[0.06]">
            <th className="py-3 pr-3">#</th>
            <th className="py-3 pr-3">
              {dictionary.pages.team}
            </th>
            <th className="py-3 pr-3 text-right">J</th>
            <th className="py-3 pr-3 text-right">V</th>
            <th className="py-3 pr-3 text-right">E</th>
            <th className="py-3 pr-3 text-right">D</th>
            <th className="py-3 pr-3 text-right">DG</th>
            <th className="py-3 text-right">Pts</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((team, index) => (
            <tr
              key={team.team}
              className="border-b border-white/[0.04]"
            >
              <td className="py-4 pr-3 font-black text-zinc-500">
                {index + 1}
              </td>
              <td className="py-4 pr-3">
                <Link
                  href={getTeamHref(team.team)}
                  className="inline-flex min-w-0 items-center gap-2 font-bold hover:text-yellow-400"
                >
                  <TeamAvatar
                    name={team.team}
                    logoUrl={teamLogoByKey.get(
                      normalizeTeamLogoKey(team.team, sport)
                    )}
                    size={28}
                  />
                  <span className="truncate">{team.team}</span>
                </Link>
              </td>
              <td className="py-4 pr-3 text-right">
                {team.played}
              </td>
              <td className="py-4 pr-3 text-right">
                {team.won}
              </td>
              <td className="py-4 pr-3 text-right">
                {team.draw}
              </td>
              <td className="py-4 pr-3 text-right">
                {team.lost}
              </td>
              <td className="py-4 pr-3 text-right">
                {team.goalsFor - team.goalsAgainst}
              </td>
              <td className="py-4 text-right font-black text-yellow-400">
                {team.points}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function MatchList({
  matches,
  empty,
  locale,
  teamLogoByKey,
}: {
  matches: Match[]
  empty: string
  locale: Locale
  teamLogoByKey: Map<string, string>
}) {
  if (matches.length === 0) {
    return <EmptyState text={empty} />
  }

  return (
    <div className="overflow-hidden rounded-lg border border-white/[0.06] bg-[#080808]">
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="bg-white/[0.03] text-xs uppercase text-zinc-500">
            <tr className="border-b border-white/[0.06]">
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3 text-right">Casa</th>
              <th className="w-28 px-4 py-3 text-center">
                Resultado
              </th>
              <th className="px-4 py-3">Fora</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-right">Ação</th>
            </tr>
          </thead>
          <tbody>
            {matches.map((match) => (
              <MatchTableRow
                key={match.external_id}
                match={match}
                locale={locale}
                teamLogoByKey={teamLogoByKey}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-white/[0.06] md:hidden">
        {matches.map((match) => (
          <MatchMobileRow
            key={match.external_id}
            match={match}
            locale={locale}
            teamLogoByKey={teamLogoByKey}
          />
        ))}
      </div>
    </div>
  )
}

function matchHref(match: Match) {
  return `/matches/${encodeURIComponent(
    match.external_id
  )}`
}

function matchScoreLabel(match: Match) {
  if (match.status === "SCHEDULED") return "vs"

  if (
    match.home_score === null ||
    match.away_score === null ||
    match.home_score === undefined ||
    match.away_score === undefined
  ) {
    return "-"
  }

  return `${match.home_score} - ${match.away_score}`
}

function matchBroadcast(match: Match) {
  return getMatchBroadcastInfo({
    sport: match.sport,
    region: match.region,
    competition: match.competition,
    homeTeam: match.home_team,
    awayTeam: match.away_team,
  })[0]
}

function MatchTableRow({
  match,
  locale,
  teamLogoByKey,
}: {
  match: Match
  locale: Locale
  teamLogoByKey: Map<string, string>
}) {
  const href = matchHref(match)
  const broadcast = matchBroadcast(match)
  const isScheduled = match.status === "SCHEDULED"

  return (
    <tr className="border-b border-white/[0.04] transition hover:bg-white/[0.03]">
      <td className="whitespace-nowrap px-4 py-3 text-xs font-bold uppercase text-zinc-500">
        {new Date(match.starts_at).toLocaleDateString(
          toHtmlLang(locale)
        )}
        <span className="ml-2 text-zinc-600">
          {new Date(match.starts_at).toLocaleString(
            toHtmlLang(locale),
            {
              hour: "2-digit",
              minute: "2-digit",
            }
          )}
        </span>
      </td>
      <td className="max-w-[220px] px-4 py-3 text-right">
        <Link
          href={getTeamHref(match.home_team)}
          className="inline-flex max-w-full items-center justify-end gap-2 font-bold hover:text-yellow-400"
        >
          <span className="truncate">{match.home_team}</span>
          <TeamAvatar
            name={match.home_team}
            logoUrl={teamLogoByKey.get(
              normalizeTeamLogoKey(match.home_team, match.sport)
            )}
            size={28}
          />
        </Link>
      </td>
      <td className="px-4 py-3 text-center">
        <Link
          href={href}
          className="inline-flex min-w-20 items-center justify-center rounded-md bg-yellow-400 px-3 py-2 font-black text-black transition hover:bg-yellow-300"
        >
          {matchScoreLabel(match)}
        </Link>
      </td>
      <td className="max-w-[220px] px-4 py-3">
        <Link
          href={getTeamHref(match.away_team)}
          className="inline-flex max-w-full items-center gap-2 font-bold hover:text-yellow-400"
        >
          <TeamAvatar
            name={match.away_team}
            logoUrl={teamLogoByKey.get(
              normalizeTeamLogoKey(match.away_team, match.sport)
            )}
            size={28}
          />
          <span className="truncate">{match.away_team}</span>
        </Link>
      </td>
      <td className="px-4 py-3">
        <span className="rounded-md border border-white/[0.06] bg-black px-2 py-1 text-xs font-black uppercase text-zinc-400">
          {match.status}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-sm font-bold text-yellow-400"
        >
          {dictionariesForLocale(locale).matchesPage.viewMatch}
          <ChevronRight className="h-4 w-4" />
        </Link>

        {isScheduled && broadcast ? (
          <Link
            href={href}
            className="ml-3 inline-flex items-center gap-1 rounded-md border border-yellow-500/20 bg-yellow-500/10 px-2 py-1 text-xs font-black uppercase text-yellow-300 transition hover:border-yellow-400"
          >
            <Tv className="h-4 w-4" />
            {broadcast.channel}
          </Link>
        ) : null}
      </td>
    </tr>
  )
}

function MatchMobileRow({
  match,
  locale,
  teamLogoByKey,
}: {
  match: Match
  locale: Locale
  teamLogoByKey: Map<string, string>
}) {
  const href = matchHref(match)
  const broadcast = matchBroadcast(match)
  const isScheduled = match.status === "SCHEDULED"

  return (
    <article className="p-4">
      <div className="mb-3 flex items-center justify-between gap-3 text-xs font-bold uppercase text-zinc-500">
        <span>{match.status}</span>
        <span>
          {new Date(match.starts_at).toLocaleString(
            toHtmlLang(locale),
            {
              day: "2-digit",
              month: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            }
          )}
        </span>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <Link
          href={getTeamHref(match.home_team)}
          className="inline-flex min-w-0 items-center gap-2 text-sm font-bold hover:text-yellow-400"
        >
          <TeamAvatar
            name={match.home_team}
            logoUrl={teamLogoByKey.get(
              normalizeTeamLogoKey(match.home_team, match.sport)
            )}
            size={26}
          />
          <span className="truncate">{match.home_team}</span>
        </Link>
        <Link
          href={href}
          className="rounded-md bg-yellow-400 px-3 py-2 text-center text-sm font-black text-black"
        >
          {matchScoreLabel(match)}
        </Link>
        <Link
          href={getTeamHref(match.away_team)}
          className="inline-flex min-w-0 items-center justify-end gap-2 text-right text-sm font-bold hover:text-yellow-400"
        >
          <span className="truncate">{match.away_team}</span>
          <TeamAvatar
            name={match.away_team}
            logoUrl={teamLogoByKey.get(
              normalizeTeamLogoKey(match.away_team, match.sport)
            )}
            size={26}
          />
        </Link>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-sm font-bold text-yellow-400"
        >
          {dictionariesForLocale(locale).matchesPage.viewMatch}
          <ChevronRight className="h-4 w-4" />
        </Link>
        {isScheduled && broadcast ? (
          <Link
            href={href}
            className="inline-flex items-center gap-1 rounded-md border border-yellow-500/20 bg-yellow-500/10 px-2 py-1 text-xs font-black uppercase text-yellow-300"
          >
            <Tv className="h-4 w-4" />
            {broadcast.channel}
          </Link>
        ) : null}
      </div>
    </article>
  )
}

function TeamsGrid({
  teams,
  empty,
  sport,
  teamLogoByKey,
}: {
  teams: string[]
  empty: string
  sport: string
  teamLogoByKey: Map<string, string>
}) {
  if (teams.length === 0) {
    return <EmptyState text={empty} />
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {teams.map((team) => (
        <Link
          key={team}
          href={getTeamHref(team)}
          className="flex items-center justify-between gap-3 rounded-lg border border-white/[0.06] bg-[#080808] p-4 transition hover:border-yellow-400/25"
        >
          <span className="inline-flex min-w-0 items-center gap-3">
            <TeamAvatar
              name={team}
              logoUrl={teamLogoByKey.get(
                normalizeTeamLogoKey(team, sport)
              )}
              size={34}
            />
            <span className="min-w-0 truncate font-black">
              {team}
            </span>
          </span>
          <ChevronRight className="h-4 w-4 shrink-0 text-yellow-400" />
        </Link>
      ))}
    </div>
  )
}

function dictionariesForLocale(locale: Locale) {
  return locale === "pt"
    ? {
        matchesPage: {
          standingsEmpty:
            "A classificação aparece quando existirem resultados acabados suficientes para esta competição.",
          viewMatch: "Ver jogo",
        },
        pages: {
          team: "Equipa",
        },
      }
    : {
        matchesPage: {
          standingsEmpty:
            "Standings appear when there are enough finished results for this competition.",
          viewMatch: "View match",
        },
        pages: {
          team: "Team",
        },
      }
}



