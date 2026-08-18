"use client"

import Link from "next/link"
import {
  useRouter,
  useSearchParams,
} from "next/navigation"
import {
  BarChart3,
  Medal,
  Shield,
  Target,
  Trophy,
  UserRound,
} from "lucide-react"
import {
  useEffect,
  useMemo,
  useState,
} from "react"
import { useLanguage } from "@/components/language-provider"
import {
  findTrackedTeamByName,
  HISTORICAL_SEASONS,
  isSportKey,
  SPORTS,
  type SportKey,
} from "@/lib/sports-config"

interface Match {
  external_id: string
  status: string
  sport: string
  competition: string
  region: string
  home_team: string
  away_team: string
  home_score: number
  away_score: number
}

interface Player {
  player_id: number
  player_name: string | null
  team_name: string | null
  sport: string
  competition: string | null
  season: string
  goals: number
  assists: number
  appearances: number
}

interface MatchesResponse {
  matches: Match[]
}

interface PlayerStatsResponse {
  playerStats: Player[]
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

function getTeamHref(teamName: string) {
  const team = findTrackedTeamByName(teamName)

  return `/teams/${
    team
      ? team.key
      : encodeURIComponent(teamName)
  }`
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

function sortStandings(
  rows: StandingRow[]
) {
  return rows.sort((a, b) => {
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

export function StatsDashboard() {
  const { dictionary, locale } = useLanguage()
  const router = useRouter()
  const searchParams = useSearchParams()
  const sportParamValue =
    searchParams.get("sport") || ""
  const initialSport: SportKey | "" = isSportKey(
    sportParamValue
  )
    ? sportParamValue
    : ""
  const [matches, setMatches] =
    useState<Match[]>([])
  const [players, setPlayers] =
    useState<Player[]>([])
  const [selectedSport, setSelectedSport] =
    useState<SportKey | "">(initialSport)
  const [loading, setLoading] =
    useState(true)
  const [activeCompetition, setActiveCompetition] =
    useState<string>("")
  const [season, setSeason] =
    useState("2026")

  const copy = dictionary.statsPage as
    typeof dictionary.statsPage & {
      teamStatsTitle?: string
      teamStatsDescription?: string
      playerStatsTitle?: string
      playerStatsDescription?: string
      standingsNote?: string
      played?: string
      goalDifference?: string
      goalsFor?: string
      goalsAgainst?: string
      topScorers?: string
      topAssists?: string
      appearances?: string
      noPlayerStats?: string
      loadedResults?: string
      competitionsWithResults?: string
    }

  useEffect(() => {
    let active = true

    async function loadStats() {
      setLoading(true)
      const currentSportName =
        SPORTS.find(
          (sport) => sport.key === selectedSport
        )?.name || ""
      const params = new URLSearchParams({
        limit: "15000",
        season,
        t: String(Date.now()),
      })

      if (currentSportName) {
        params.set("sport", currentSportName)
      }

      const playerStatsParams =
        new URLSearchParams({
          limit: "5000",
          season,
          t: String(Date.now()),
        })

      if (currentSportName) {
        playerStatsParams.set(
          "sport",
          currentSportName
        )
      }

      const [matchesResponse, playerStatsResponse] =
        await Promise.all([
          fetch(
            `/api/football/matches?${params.toString()}`,
            {
              cache: "no-store",
            }
          ),
          fetch(
            `/api/public/player-stats?${playerStatsParams.toString()}`,
            {
              cache: "no-store",
            }
          ),
        ])

      const matchesData =
        (await matchesResponse.json()) as MatchesResponse
      const playerStatsData =
        (await playerStatsResponse.json()) as PlayerStatsResponse

      if (!active) return

      setMatches(matchesData.matches || [])
      setPlayers(
        playerStatsData.playerStats || []
      )
      setLoading(false)
    }

    void loadStats()

    return () => {
      active = false
    }
  }, [season, selectedSport])

  const selectedSportInfo = SPORTS.find(
    (sport) => sport.key === selectedSport
  )
  const sportName = selectedSportInfo?.name || ""

  const finishedMatches = useMemo(
    () =>
      matches.filter(
        (match) =>
          selectedSport &&
          sportName &&
          match.status === "FINISHED" &&
          normalize(match.sport) ===
            normalize(sportName)
      ),
    [matches, selectedSport, sportName]
  )

  const sportPlayers = useMemo(
    () =>
      players.filter(
        (player) =>
          selectedSport &&
          sportName &&
          normalize(player.sport) ===
            normalize(sportName)
      ),
    [players, selectedSport, sportName]
  )

  const standingsByCompetition = useMemo(() => {
    const map = new Map<
      string,
      Map<string, StandingRow>
    >()

    for (const match of finishedMatches) {
      if (!map.has(match.competition)) {
        map.set(match.competition, new Map())
      }

      const table = map.get(match.competition)

      if (!table) continue

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

    return [...map.entries()].map(
      ([competition, table]) => ({
        competition,
        rows: sortStandings([
          ...table.values(),
        ]),
      })
    )
  }, [finishedMatches])

  const selectedCompetition =
    activeCompetition ||
    standingsByCompetition[0]?.competition ||
    ""

  const activeTable =
    standingsByCompetition.find(
      (item) =>
        item.competition === selectedCompetition
    )?.rows || []

  const activePlayerStats = sportPlayers.filter(
    (player) =>
      !selectedCompetition ||
      player.competition === selectedCompetition
  )

  const topScorers = activePlayerStats
    .filter((player) => player.goals > 0)
    .sort((a, b) => b.goals - a.goals)
    .slice(0, 8)

  const topAssists = activePlayerStats
    .filter((player) => player.assists > 0)
    .sort((a, b) => b.assists - a.assists)
    .slice(0, 8)

  const topStats = [
    {
      label:
        copy.loadedResults ||
        dictionary.matches.recentTitle,
      value: finishedMatches.length,
      icon: Trophy,
    },
    {
      label:
        copy.competitionsWithResults ||
        dictionary.nav.leagues,
      value: standingsByCompetition.length,
      icon: Medal,
    },
    {
      label: dictionary.nav.teams,
      value: new Set(
        finishedMatches.flatMap((match) => [
          match.home_team,
          match.away_team,
        ])
      ).size,
      icon: Shield,
    },
    {
      label: dictionary.nav.players,
      value: new Set(
        sportPlayers.map(
          (player) => player.player_id
        )
      ).size,
      icon: UserRound,
    },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
      <section className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-lg border border-yellow-500/20 bg-yellow-500/10 px-3 py-2 text-xs font-bold uppercase text-yellow-300">
          <BarChart3 className="h-4 w-4" />
          {dictionary.nav.stats}
        </div>

        <h1 className="text-4xl font-black md:text-5xl">
          {copy.teamStatsTitle ||
            dictionary.standings.title}
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 md:text-base">
          {copy.teamStatsDescription ||
            dictionary.statsPage.description}
        </p>

        <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
          {SPORTS.map((sport) => (
            <button
              key={sport.key}
              onClick={() => {
                setSelectedSport(sport.key)
                setActiveCompetition("")
                router.replace(
                  `/stats?sport=${sport.key}`,
                  {
                    scroll: false,
                  }
                )
              }}
              className={`shrink-0 rounded-lg border px-4 py-2 text-sm font-bold transition ${
                selectedSport === sport.key
                  ? "border-yellow-400 bg-yellow-400 text-black"
                  : "border-white/[0.08] bg-white/[0.03] text-zinc-300 hover:border-yellow-400/30"
              }`}
              type="button"
            >
              {locale === "pt"
                ? sport.labelPt
                : sport.name}
            </button>
          ))}
        </div>
      </section>

      {!selectedSport ? (
        <section className="rounded-lg border border-white/[0.08] bg-[#0b0b0b] p-5 text-sm text-zinc-400">
          {dictionary.matchesPage.chooseSport}
        </section>
      ) : null}

      {selectedSport ? (
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {topStats.map((stat) => {
          const Icon = stat.icon

          return (
            <div
              key={stat.label}
              className="rounded-lg border border-white/[0.06] bg-[#071015] p-5"
            >
              <div className="flex items-center justify-between gap-4">
                <Icon className="h-5 w-5 text-yellow-400" />
                <span className="text-xs font-bold uppercase text-zinc-500">
                  {stat.label}
                </span>
              </div>

              <p className="mt-6 text-3xl font-black">
                {loading
                  ? dictionary.common.loading
                  : stat.value}
              </p>
            </div>
          )
        })}
      </section>
      ) : null}

      {selectedSport ? (
      <section className="mt-6 rounded-lg border border-white/[0.06] bg-[#0b0b0b] p-5">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-2xl font-black">
              {dictionary.standings.title}
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              {copy.standingsNote ||
                dictionary.statsPage.description}
            </p>
          </div>

          <Target className="hidden h-6 w-6 text-yellow-400 lg:block" />
        </div>

        <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
          {HISTORICAL_SEASONS.map((item) => (
            <button
              key={item}
              onClick={() => {
                setSeason(item)
                setActiveCompetition("")
                setLoading(true)
              }}
              className={`shrink-0 rounded-lg border px-4 py-2 text-sm font-bold transition ${
                season === item
                  ? "border-green-400 bg-green-400 text-black"
                  : "border-white/[0.08] bg-white/[0.03] text-zinc-300"
              }`}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm text-zinc-400">
            {dictionary.common.loading}
          </div>
        ) : standingsByCompetition.length === 0 ? (
          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm text-zinc-400">
            {dictionary.standings.empty}
          </div>
        ) : (
          <>
            <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
              {standingsByCompetition.map(
                (item) => (
                  <button
                    key={item.competition}
                    onClick={() =>
                      setActiveCompetition(
                        item.competition
                      )
                    }
                    className={`shrink-0 rounded-lg border px-4 py-2 text-sm font-bold transition ${
                      selectedCompetition ===
                      item.competition
                        ? "border-yellow-400 bg-yellow-400 text-black"
                        : "border-white/[0.08] bg-white/[0.03] text-zinc-300"
                    }`}
                    type="button"
                  >
                    {item.competition}
                  </button>
                )
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="text-xs uppercase text-zinc-500">
                  <tr className="border-b border-white/[0.06]">
                    <th className="py-3 pr-3">
                      #
                    </th>
                    <th className="py-3 pr-3">
                      {dictionary.pages.team}
                    </th>
                    <th className="py-3 pr-3 text-right">
                      {copy.played ||
                        dictionary.standings.played}
                    </th>
                    <th className="py-3 pr-3 text-right">
                      {dictionary.standings.won}
                    </th>
                    <th className="py-3 pr-3 text-right">
                      {dictionary.standings.drawn}
                    </th>
                    <th className="py-3 pr-3 text-right">
                      {dictionary.standings.lost}
                    </th>
                    <th className="py-3 pr-3 text-right">
                      {copy.goalDifference ||
                        "DG"}
                    </th>
                    <th className="py-3 text-right">
                      {dictionary.common.points}
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {activeTable.map(
                    (team, index) => (
                      <tr
                        key={team.team}
                        className="border-b border-white/[0.04]"
                      >
                        <td className="py-4 pr-3 font-black text-zinc-500">
                          {index + 1}
                        </td>
                        <td className="py-4 pr-3">
                          <Link
                            href={getTeamHref(
                              team.team
                            )}
                            className="font-bold hover:text-yellow-400"
                          >
                            {team.team}
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
                          {team.goalsFor -
                            team.goalsAgainst}
                        </td>
                        <td className="py-4 text-right font-black text-yellow-400">
                          {team.points}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
      ) : null}

      {selectedSport ? (
      <section className="mt-6 grid gap-6 xl:grid-cols-2">
        <PlayersTable
          title={
            copy.topScorers || "Melhores marcadoras"
          }
          description={
            copy.playerStatsDescription ||
            dictionary.statsPage.description
          }
          players={topScorers}
          statLabel={dictionary.pages.goals}
          statKey="goals"
        />

        <PlayersTable
          title={
            copy.topAssists || dictionary.pages.assists
          }
          description={
            copy.playerStatsDescription ||
            dictionary.statsPage.description
          }
          players={topAssists}
          statLabel={dictionary.pages.assists}
          statKey="assists"
        />
      </section>
      ) : null}
    </div>
  )
}

function PlayersTable({
  title,
  description,
  players,
  statLabel,
  statKey,
}: {
  title: string
  description: string
  players: Player[]
  statLabel: string
  statKey: "goals" | "assists"
}) {
  if (players.length === 0) {
    return null
  }

  return (
    <section className="rounded-lg border border-white/[0.06] bg-[#0b0b0b] p-5">
      <div className="mb-5">
        <h2 className="text-2xl font-black">
          {title}
        </h2>

        <p className="mt-1 text-sm text-zinc-500">
          {description}
        </p>
      </div>

      <div className="space-y-3">
          {players.map((player, index) => (
            <Link
              key={`${player.player_id}-${player.competition}-${player.season}`}
              href={`/players/${player.player_id}`}
              className="flex items-center justify-between gap-4 rounded-lg border border-white/[0.06] bg-[#080808] p-4 transition hover:border-yellow-400/25"
            >
              <div className="flex min-w-0 items-center gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-yellow-400 font-black text-black">
                  {index + 1}
                </span>

                <div className="min-w-0">
                  <p className="truncate font-black">
                    {player.player_name ||
                      "Jogadora"}
                  </p>

                  <p className="truncate text-sm text-zinc-500">
                    {player.team_name ||
                      player.competition ||
                      player.sport}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-xs font-bold uppercase text-zinc-500">
                  {statLabel}
                </p>

                <p className="text-2xl font-black text-yellow-400">
                  {player[statKey]}
                </p>
              </div>
            </Link>
          ))}
      </div>
    </section>
  )
}

