"use client"

import Link from "next/link"
import {
  BarChart3,
  CalendarDays,
  ChevronRight,
  Trophy,
  UsersRound,
} from "lucide-react"
import { useEffect, useState } from "react"
import { MatchBroadcastPanel } from "@/components/broadcast-panel"
import { useLanguage } from "@/components/language-provider"
import { TeamAvatar } from "@/components/team-avatar"
import { toHtmlLang } from "@/lib/i18n"
import { findTrackedTeamByName } from "@/lib/sports-config"

interface Match {
  external_id: string
  sport: string
  competition: string
  home_team: string
  away_team: string
  home_score: number
  away_score: number
  status: string
  starts_at: string
  venue?: string
  region?: string
}

interface MatchesResponse {
  matches: Match[]
}

interface PublicTeam {
  name?: string | null
  sport?: string | null
  logo_url?: string | null
}

interface PublicTeamsResponse {
  teams?: PublicTeam[]
}

interface Props {
  matchId: string
}

function getTeamHref(teamName: string) {
  const team = findTrackedTeamByName(teamName)

  return `/teams/${
    team ? team.key : encodeURIComponent(teamName)
  }`
}

function normalizeLogoKey(
  name: string,
  sport?: string | null
) {
  const clean = (value: string) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()

  return `${clean(sport || "")}:${clean(name)}`
}

export function MatchDetail({ matchId }: Props) {
  const { dictionary, locale } =
    useLanguage()
  const [match, setMatch] =
    useState<Match | null>(null)
  const [allMatches, setAllMatches] =
    useState<Match[]>([])
  const [teamLogoByKey, setTeamLogoByKey] =
    useState<Map<string, string>>(new Map())
  const [loading, setLoading] =
    useState(true)

  useEffect(() => {
    let active = true

    async function loadMatch() {
      const response = await fetch(
        `/api/football/matches?limit=15000&t=${Date.now()}`,
        {
          cache: "no-store",
        }
      )

      const data =
        (await response.json()) as MatchesResponse

      if (!active) return

      const loadedMatches = data.matches || []

      setAllMatches(loadedMatches)
      setMatch(
        loadedMatches.find(
          (item) =>
            item.external_id === matchId
        ) || null
      )
      setLoading(false)
    }

    void loadMatch()

    return () => {
      active = false
    }
  }, [matchId])

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
          normalizeLogoKey(team.name, team.sport),
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

  if (loading) {
    return (
      <section className="mx-auto max-w-6xl rounded-lg border border-white/[0.06] bg-[#0b0b0b] p-6 text-zinc-400 lg:p-10">
        {dictionary.common.loading}
      </section>
    )
  }

  if (!match) {
    return (
      <section className="mx-auto max-w-6xl rounded-lg border border-white/[0.06] bg-[#0b0b0b] p-6 text-zinc-400 lg:p-10">
        {dictionary.matches.matchNotFound}
      </section>
    )
  }

  const homeSummary = buildTeamSummary(
    match.home_team,
    allMatches
  )
  const awaySummary = buildTeamSummary(
    match.away_team,
    allMatches
  )
  const relatedMatches = allMatches
    .filter(
      (item) =>
        item.external_id !== match.external_id &&
        item.competition === match.competition &&
        (item.home_team === match.home_team ||
          item.away_team === match.home_team ||
          item.home_team === match.away_team ||
          item.away_team === match.away_team)
    )
    .slice(0, 4)

  return (
    <div className="mx-auto max-w-6xl">
      <section className="rounded-lg border border-white/[0.06] bg-[#0b0b0b] p-6 lg:p-10">
        <p className="text-sm font-bold uppercase text-yellow-400">
          {match.sport} / {match.competition}
        </p>

        <h1 className="mt-4 text-3xl font-black lg:text-5xl">
          {match.home_team} {dictionary.common.vs}{" "}
          {match.away_team}
        </h1>

        <p className="mt-6 inline-flex rounded-lg bg-yellow-400 px-4 py-3 text-5xl font-black text-black">
          {match.status === "SCHEDULED"
            ? dictionary.common.vs
            : `${match.home_score} - ${match.away_score}`}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <span className="rounded-md border border-green-500/20 bg-green-500/10 px-4 py-2 text-sm font-bold text-green-300">
            {match.status}
          </span>

          {match.region && (
            <span className="rounded-md border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-sm text-zinc-300">
              {match.region}
            </span>
          )}

          {match.venue && (
            <span className="inline-flex items-center gap-2 rounded-md border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-sm text-zinc-300">
              <Trophy className="h-4 w-4 text-yellow-400" />
              {match.venue}
            </span>
          )}

          <span className="inline-flex items-center gap-2 rounded-md border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-sm text-zinc-300">
            <CalendarDays className="h-4 w-4 text-yellow-400" />
            {new Date(
              match.starts_at
            ).toLocaleString(toHtmlLang(locale))}
          </span>
        </div>
      </section>

      <section className="mt-6 grid gap-3 md:grid-cols-2">
        <TeamActionCard
          teamName={match.home_team}
          logoUrl={teamLogoByKey.get(
            normalizeLogoKey(match.home_team, match.sport)
          )}
          side="Casa"
          summary={homeSummary}
        />
        <TeamActionCard
          teamName={match.away_team}
          logoUrl={teamLogoByKey.get(
            normalizeLogoKey(match.away_team, match.sport)
          )}
          side="Fora"
          summary={awaySummary}
        />
      </section>

      <section className="mt-6">
        <MatchBroadcastPanel
          sport={match.sport}
          region={match.region}
          competition={match.competition}
          homeTeam={match.home_team}
          awayTeam={match.away_team}
          startsAt={match.starts_at}
          locale={locale}
        />
      </section>

      <section className="mt-6 rounded-lg border border-white/[0.06] bg-[#0b0b0b] p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase text-yellow-400">
              Contexto
            </p>
            <h2 className="mt-1 text-2xl font-black">
              Jogos relacionados
            </h2>
          </div>
          <CalendarDays className="h-5 w-5 text-yellow-400" />
        </div>

        {relatedMatches.length === 0 ? (
          <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-4 text-sm text-zinc-400">
            Ainda não há mais jogos desta competição para estas equipas.
          </div>
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {relatedMatches.map((item) => (
              <Link
                key={item.external_id}
                href={`/matches/${encodeURIComponent(
                  item.external_id
                )}`}
                className="rounded-lg border border-white/[0.06] bg-[#080808] p-4 transition hover:border-yellow-400/25"
              >
                <div className="mb-3 flex items-center justify-between gap-3 text-xs font-bold uppercase text-zinc-500">
                  <span>{item.status}</span>
                  <span>
                    {new Date(
                      item.starts_at
                    ).toLocaleDateString(
                      toHtmlLang(locale)
                    )}
                  </span>
                </div>
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                  <span className="truncate font-black">
                    {item.home_team}
                  </span>
                  <span className="rounded-lg bg-yellow-400 px-3 py-2 text-center text-lg font-black text-black">
                    {item.status === "SCHEDULED"
                      ? dictionary.common.vs
                      : `${item.home_score} - ${item.away_score}`}
                  </span>
                  <span className="truncate text-right font-black">
                    {item.away_team}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function TeamActionCard({
  teamName,
  logoUrl,
  side,
  summary,
}: {
  teamName: string
  logoUrl?: string | null
  side: string
  summary: TeamSummary
}) {
  const href = getTeamHref(teamName)

  return (
    <article className="rounded-lg border border-white/[0.06] bg-[#0b0b0b] p-5">
      <p className="text-xs font-bold uppercase text-zinc-500">
        {side}
      </p>
      <div className="mt-2 flex items-center gap-3">
        <TeamAvatar
          name={teamName}
          logoUrl={logoUrl}
          size={48}
        />
        <h2 className="min-w-0 truncate text-2xl font-black">
          {teamName}
        </h2>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2 text-center">
        <MiniStat label="J" value={summary.played} />
        <MiniStat label="V" value={summary.wins} />
        <MiniStat
          label="DG"
          value={summary.goalDifference}
        />
        <MiniStat
          label="Próx."
          value={summary.upcoming}
        />
      </div>

      <div className="mt-5 grid gap-2">
        <Link
          href={`${href}#stats`}
          className="flex items-center justify-between gap-3 rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm font-bold transition hover:border-yellow-400/30"
        >
          <span className="inline-flex items-center gap-2">
            <UsersRound className="h-4 w-4 text-yellow-400" />
            Plantel
          </span>
          <ChevronRight className="h-4 w-4 text-yellow-400" />
        </Link>

        <Link
          href={href}
          className="flex items-center justify-between gap-3 rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm font-bold transition hover:border-yellow-400/30"
        >
          <span className="inline-flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-yellow-400" />
            Estatísticas da equipa
          </span>
          <ChevronRight className="h-4 w-4 text-yellow-400" />
        </Link>
      </div>
    </article>
  )
}

interface TeamSummary {
  played: number
  wins: number
  upcoming: number
  goalDifference: number
}

function buildTeamSummary(
  teamName: string,
  matches: Match[]
): TeamSummary {
  const teamMatches = matches.filter(
    (match) =>
      match.home_team === teamName ||
      match.away_team === teamName
  )
  const finished = teamMatches.filter(
    (match) => match.status === "FINISHED"
  )
  const wins = finished.filter((match) => {
    const homeWin =
      match.home_team === teamName &&
      match.home_score > match.away_score
    const awayWin =
      match.away_team === teamName &&
      match.away_score > match.home_score

    return homeWin || awayWin
  }).length
  const goalsFor = finished.reduce(
    (total, match) =>
      total +
      (match.home_team === teamName
        ? match.home_score
        : match.away_score),
    0
  )
  const goalsAgainst = finished.reduce(
    (total, match) =>
      total +
      (match.home_team === teamName
        ? match.away_score
        : match.home_score),
    0
  )

  return {
    played: finished.length,
    wins,
    upcoming: teamMatches.filter(
      (match) => match.status === "SCHEDULED"
    ).length,
    goalDifference: goalsFor - goalsAgainst,
  }
}

function MiniStat({
  label,
  value,
}: {
  label: string
  value: number
}) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-2 py-3">
      <p className="text-lg font-black text-white">
        {value}
      </p>
      <p className="mt-1 text-[10px] font-bold uppercase text-zinc-500">
        {label}
      </p>
    </div>
  )
}

