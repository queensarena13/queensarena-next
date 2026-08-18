"use client"

import Link from "next/link"
import {
  BarChart3,
  Goal,
  UserRound,
} from "lucide-react"
import { useEffect, useState } from "react"
import { FavoriteButton } from "@/components/favorite-button"
import { useLanguage } from "@/components/language-provider"
import { TeamAvatar } from "@/components/team-avatar"
import { toHtmlLang } from "@/lib/i18n"
import { supabaseClient } from "@/lib/supabase-client"

interface Match {
  external_id: string
  sport: string
  competition: string
  home_team: string
  away_team: string
  home_score: number | null
  away_score: number | null
  status: string
  starts_at: string
  venue?: string
}

interface MatchesResponse {
  matches: Match[]
}

interface Player {
  id?: number
  key?: string
  name: string
  sport?: string
  position: string | null
  nationality: string | null
  goals: number
  assists: number
  appearances: number
  sourceLabel?: string
  teams?: {
    name: string
  } | null
}

interface LivePlayer {
  key: string
  name: string
  sport: string
  position: string | null
  nationality: string | null
  teamName: string
  sourceLabel: string
}

interface PlayersResponse {
  players: LivePlayer[]
}

interface Props {
  teamKey: string
  teamName: string
  sport: string
  competition: string
  region: string
  logoUrl?: string | null
}

function normalizeName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\b(w|women|feminino|feminina)\b/g, "")
    .replace(/\b(sl|cp|fc|sc)\b/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
}

function isSameTeam(left: string, right: string) {
  const a = normalizeName(left)
  const b = normalizeName(right)

  return Boolean(a && b) && (a === b || a.includes(b) || b.includes(a))
}

export function TeamDetail({
  teamKey,
  teamName,
  sport,
  competition,
  region,
  logoUrl,
}: Props) {
  const { dictionary, locale } =
    useLanguage()
  const [matches, setMatches] =
    useState<Match[]>([])
  const [players, setPlayers] =
    useState<Player[]>([])
  const [loading, setLoading] =
    useState(true)

  useEffect(() => {
    let active = true

    async function loadMatches() {
      const params = new URLSearchParams({
        limit: "15000",
        sport,
        t: String(Date.now()),
      })
      const [
        matchesResponse,
        playersResponse,
        livePlayersResponse,
      ] =
        await Promise.all([
          fetch(
            `/api/football/matches?${params.toString()}`,
            {
              cache: "no-store",
            }
          ),
          supabaseClient
            .from("players")
            .select("*, teams(name)")
            .order("goals", {
              ascending: false,
            }),
          fetch(
            `/api/players/live?teamName=${encodeURIComponent(
              teamName
            )}&t=${Date.now()}`,
            {
              cache: "no-store",
            }
          ),
        ])

      const data =
        (await matchesResponse.json()) as MatchesResponse
      const livePlayersData =
        (await livePlayersResponse.json()) as PlayersResponse

      if (!active) return

      const teamMatches = (data.matches || []).filter((match) => {
        if (match.sport !== sport) return false

        return (
          isSameTeam(match.home_team, teamName) ||
          isSameTeam(match.away_team, teamName)
        )
      })

      setMatches(teamMatches)
      const supabasePlayers = (
        (playersResponse.data || []) as Player[]
      ).filter(
        (player) =>
          player.teams?.name &&
          isSameTeam(player.teams.name, teamName)
      )
      const livePlayers = (
        livePlayersData.players || []
      ).map((player) => ({
        key: player.key,
        name: player.name,
        sport: player.sport,
        position: player.position,
        nationality: player.nationality,
        goals: 0,
        assists: 0,
        appearances: 0,
        sourceLabel: player.sourceLabel,
        teams: {
          name: player.teamName,
        },
      }))
      const existingNames = new Set(
        supabasePlayers.map((player) =>
          player.name.toLowerCase()
        )
      )

      setPlayers([
        ...supabasePlayers,
        ...livePlayers.filter(
          (player) =>
            !existingNames.has(
              player.name.toLowerCase()
            )
        ),
      ])
      setLoading(false)
    }

    void loadMatches()

    return () => {
      active = false
    }
  }, [sport, teamName])

  const finishedMatches = matches.filter(
    (match) =>
      match.status === "FINISHED" &&
      match.home_score !== null &&
      match.away_score !== null
  )
  const upcomingMatches = matches
    .filter((match) => match.status === "SCHEDULED")
    .sort(
      (a, b) =>
        new Date(a.starts_at).getTime() -
        new Date(b.starts_at).getTime()
    )
  const wins = finishedMatches.filter(
    (match) =>
      (isSameTeam(match.home_team, teamName) &&
        Number(match.home_score) > Number(match.away_score)) ||
      (isSameTeam(match.away_team, teamName) &&
        Number(match.away_score) > Number(match.home_score))
  ).length
  const draws = finishedMatches.filter(
    (match) =>
      match.home_score === match.away_score
  ).length
  const losses =
    finishedMatches.length - wins - draws
  const goalsFor = finishedMatches.reduce(
    (total, match) =>
      total +
      (isSameTeam(match.home_team, teamName)
        ? Number(match.home_score)
        : Number(match.away_score)),
    0
  )
  const goalsAgainst = finishedMatches.reduce(
    (total, match) =>
      total +
      (isSameTeam(match.home_team, teamName)
        ? Number(match.away_score)
        : Number(match.home_score)),
    0
  )
  const points = wins * 3 + draws
  const goalDifference =
    goalsFor - goalsAgainst
  const recentForm = finishedMatches
    .slice()
    .sort(
      (a, b) =>
        new Date(b.starts_at).getTime() -
        new Date(a.starts_at).getTime()
    )
    .slice(0, 5)
    .map((match) => {
      const teamGoals =
        isSameTeam(match.home_team, teamName)
          ? match.home_score
          : match.away_score
      const opponentGoals =
        isSameTeam(match.home_team, teamName)
          ? match.away_score
          : match.home_score

      if (Number(teamGoals) > Number(opponentGoals)) return "V"
      if (teamGoals === opponentGoals) return "E"
      return "D"
    })

  return (
    <div className="mx-auto max-w-6xl">
      <section className="rounded-lg border border-white/10 bg-[#0b0b0b] p-6 lg:p-10">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-4">
            <TeamAvatar
              name={teamName}
              logoUrl={logoUrl}
              size={72}
            />
            <div className="min-w-0">
            <p className="text-sm font-bold uppercase text-yellow-400">
              {sport}
            </p>

            <h1 className="mt-4 break-words text-4xl font-black lg:text-6xl">
              {teamName}
            </h1>

            <p className="mt-4 text-zinc-500">
              {competition} / {region}
            </p>
            </div>
          </div>

          <FavoriteButton
            teamKey={teamKey}
            teamName={teamName}
            sport={sport}
          />
        </div>
      </section>

      <section
        id="stats"
        className="mt-6 grid gap-3 md:grid-cols-4 xl:grid-cols-8"
      >
        <StatCard
          label="Jogos"
          value={finishedMatches.length}
        />
        <StatCard label="Vitórias" value={wins} />
        <StatCard label="Empates" value={draws} />
        <StatCard label="Derrotas" value={losses} />
        <StatCard label="Pontos" value={points} />
        <StatCard
          label="Diferença"
          value={
            goalDifference > 0
              ? `+${goalDifference}`
              : goalDifference
          }
        />
        <StatCard
          label="Golos"
          value={`${goalsFor}-${goalsAgainst}`}
        />
        <StatCard
          label="Forma"
          value={
            recentForm.length
              ? recentForm.join(" ")
              : "-"
          }
        />
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-2">
        <TeamMatchesBlock
          title="Próximos jogos"
          label="Calendário"
          matches={upcomingMatches}
          empty="Ainda não há próximos jogos disponíveis para esta equipa."
          locale={locale}
          scheduled
        />
        <TeamMatchesBlock
          title="Resultados"
          label="Jogos acabados"
          matches={finishedMatches}
          empty="Ainda não há resultados disponíveis para esta equipa."
          locale={locale}
        />
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="rounded-lg border border-white/10 bg-[#0b0b0b] p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase text-yellow-400">
                Plantel
              </p>
              <h2 className="mt-1 text-2xl font-black">
                Jogadoras
              </h2>
            </div>
            <UserRound className="h-5 w-5 text-yellow-400" />
          </div>

          {loading ? (
            <EmptyState text={dictionary.common.loading} />
          ) : players.length === 0 ? (
            <EmptyState text="Ainda não há plantel oficial carregado para esta equipa." />
          ) : (
            <div className="overflow-hidden rounded-lg border border-white/[0.06]">
              <table className="w-full text-left text-sm">
                <tbody>
              {players.map((player) => {
                const content = (
                  <>
                    <td className="min-w-0 px-3 py-3">
                      <span className="block truncate font-bold">
                        {player.name}
                      </span>
                      <span className="mt-1 block truncate text-sm text-zinc-500">
                        {player.position ||
                          player.nationality ||
                          sport}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-right text-xs font-bold text-yellow-400">
                      {player.goals > 0
                        ? `${player.goals} G`
                        : "Plantel"}
                    </td>
                  </>
                )

                return player.id ? (
                  <Link
                    key={player.id}
                    href={`/players/${player.id}`}
                    className="contents"
                  >
                    <tr className="border-b border-white/[0.04] transition hover:bg-white/[0.03]">
                      {content}
                    </tr>
                  </Link>
                ) : (
                  <tr
                    key={player.key || player.name}
                    className="border-b border-white/[0.04]"
                  >
                    {content}
                  </tr>
                )
              })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-lg border border-white/10 bg-[#0b0b0b] p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase text-yellow-400">
                Estatísticas
              </p>
              <h2 className="mt-1 text-2xl font-black">
                Jogadoras
              </h2>
            </div>
            <BarChart3 className="h-5 w-5 text-yellow-400" />
          </div>

          {players.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-white/[0.06]">
              <table className="w-full min-w-[420px] text-left text-sm">
                <thead className="bg-white/[0.03] text-xs uppercase text-zinc-500">
                  <tr>
                    <th className="px-3 py-3">Jogadora</th>
                    <th className="px-3 py-3 text-right">J</th>
                    <th className="px-3 py-3 text-right">G</th>
                    <th className="px-3 py-3 text-right">A</th>
                  </tr>
                </thead>
                <tbody>
                  {players
                .slice()
                .sort(
                  (a, b) =>
                    b.goals - a.goals ||
                    b.assists - a.assists
                )
                .map((player) => (
                  <tr
                    key={player.id || player.key || player.name}
                    className="border-t border-white/[0.04] transition hover:bg-white/[0.03]"
                  >
                    <td className="max-w-[180px] truncate px-3 py-3 font-bold">
                      {player.name}
                    </td>
                    <td className="px-3 py-3 text-right text-zinc-400">
                      {player.appearances}
                    </td>
                    <td className="px-3 py-3 text-right font-bold text-yellow-400">
                      {player.goals} G
                    </td>
                    <td className="px-3 py-3 text-right text-zinc-400">
                      {player.assists} A
                    </td>
                  </tr>
                ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </section>
      </section>

      <section className="mt-6">
        <h2 className="mb-4 text-2xl font-black">
          {dictionary.matches.history}
        </h2>

        {loading ? (
          <div className="rounded-lg border border-white/10 bg-[#0b0b0b] p-5 text-zinc-400">
            {dictionary.common.loading}
          </div>
        ) : matches.length === 0 ? (
          <div className="rounded-lg border border-white/10 bg-[#0b0b0b] p-5 text-zinc-400">
            {dictionary.common.notAvailable}
          </div>
        ) : (
          <MatchesTable
            matches={matches}
            locale={locale}
            vsLabel={dictionary.common.vs}
          />
        )}
      </section>
    </div>
  )
}

function matchScore(match: Match, vsLabel: string) {
  if (match.status === "SCHEDULED") return vsLabel
  if (match.home_score === null || match.away_score === null) return "-"

  return `${match.home_score} - ${match.away_score}`
}

function MatchesTable({
  matches,
  locale,
  vsLabel,
}: {
  matches: Match[]
  locale: "pt" | "en"
  vsLabel: string
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-white/[0.06] bg-[#080808]">
      <table className="w-full min-w-[780px] text-left text-sm">
        <thead className="bg-white/[0.03] text-xs uppercase text-zinc-500">
          <tr>
            <th className="px-4 py-3">Data</th>
            <th className="px-4 py-3">Competição</th>
            <th className="px-4 py-3 text-right">Casa</th>
            <th className="px-4 py-3 text-center">Resultado</th>
            <th className="px-4 py-3">Fora</th>
            <th className="px-4 py-3">Estado</th>
          </tr>
        </thead>
        <tbody>
          {matches.map((match) => (
            <tr
              key={match.external_id}
              className="border-t border-white/[0.04] transition hover:bg-white/[0.03]"
            >
              <td className="whitespace-nowrap px-4 py-3 text-xs font-bold uppercase text-zinc-500">
                {new Date(match.starts_at).toLocaleDateString(
                  toHtmlLang(locale)
                )}
              </td>
              <td className="max-w-[220px] truncate px-4 py-3 text-zinc-400">
                {match.competition}
              </td>
              <td className="max-w-[180px] truncate px-4 py-3 text-right font-bold">
                {match.home_team}
              </td>
              <td className="px-4 py-3 text-center">
                <Link
                  href={`/matches/${encodeURIComponent(match.external_id)}`}
                  className="inline-flex min-w-20 justify-center rounded-md bg-yellow-400 px-3 py-2 font-black text-black"
                >
                  {matchScore(match, vsLabel)}
                </Link>
              </td>
              <td className="max-w-[180px] truncate px-4 py-3 font-bold">
                {match.away_team}
              </td>
              <td className="px-4 py-3">
                <span className="rounded-md border border-white/[0.06] bg-black px-2 py-1 text-xs font-black uppercase text-zinc-400">
                  {match.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TeamMatchesBlock({
  title,
  label,
  matches,
  empty,
  locale,
  scheduled = false,
}: {
  title: string
  label: string
  matches: Match[]
  empty: string
  locale: "pt" | "en"
  scheduled?: boolean
}) {
  return (
    <section className="rounded-lg border border-white/10 bg-[#0b0b0b] p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase text-yellow-400">
            {label}
          </p>
          <h2 className="mt-1 text-2xl font-black">
            {title}
          </h2>
        </div>
        <BarChart3 className="h-5 w-5 text-yellow-400" />
      </div>

      {matches.length === 0 ? (
        <EmptyState text={empty} />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-white/[0.06] bg-[#080808]">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="bg-white/[0.03] text-xs uppercase text-zinc-500">
              <tr>
                <th className="px-3 py-3">Data</th>
                <th className="px-3 py-3 text-right">Casa</th>
                <th className="px-3 py-3 text-center">Resultado</th>
                <th className="px-3 py-3">Fora</th>
              </tr>
            </thead>
            <tbody>
          {matches.slice(0, 5).map((match) => (
            <tr
              key={match.external_id}
              className="border-t border-white/[0.04] transition hover:bg-white/[0.03]"
            >
              <td className="whitespace-nowrap px-3 py-3 text-xs font-bold uppercase text-zinc-500">
                {new Date(
                  match.starts_at
                ).toLocaleDateString(toHtmlLang(locale))}
              </td>
              <td className="max-w-[180px] truncate px-3 py-3 text-right font-bold">
                  {match.home_team}
              </td>
              <td className="px-3 py-3 text-center">
                <Link
                  href={`/matches/${encodeURIComponent(match.external_id)}`}
                  className="inline-flex min-w-16 justify-center rounded-md bg-yellow-400 px-2 py-1.5 font-black text-black"
                >
                  {scheduled ? "vs" : matchScore(match, "vs")}
                </Link>
              </td>
              <td className="max-w-[180px] truncate px-3 py-3 font-bold">
                  {match.away_team}
              </td>
            </tr>
          ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

function StatCard({
  label,
  value,
}: {
  label: string
  value: number | string
}) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-[#071015] p-4">
      <Goal className="h-5 w-5 text-yellow-400" />
      <p className="mt-5 text-2xl font-black">
        {value}
      </p>
      <p className="mt-1 text-xs font-bold uppercase text-zinc-500">
        {label}
      </p>
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm text-zinc-400">
      {text}
    </div>
  )
}

