"use client"

import Link from "next/link"
import {
  useEffect,
  useMemo,
  useState,
} from "react"
import { useLanguage } from "@/components/language-provider"
import { findTrackedTeamByName } from "@/lib/sports-config"

interface Match {
  external_id: string
  status: string
  competition: string
  home_team: string
  away_team: string
  home_score: number
  away_score: number
}

interface MatchesResponse {
  matches: Match[]
}

interface Standing {
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

function createStanding(
  team: string
): Standing {
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
  row: Standing,
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

export function StandingsTable() {
  const [matches, setMatches] =
    useState<Match[]>([])
  const [loading, setLoading] =
    useState(true)
  const { dictionary } = useLanguage()
  const copy = dictionary.statsPage as
    typeof dictionary.statsPage & {
      standingsNote?: string
    }

  useEffect(() => {
    let active = true

    async function loadTable() {
      const response = await fetch(
        `/api/football/matches?limit=15000&season=2026&sport=Football&t=${Date.now()}`,
        {
          cache: "no-store",
        }
      )

      const data =
        (await response.json()) as MatchesResponse

      if (!active) return

      setMatches(data.matches || [])
      setLoading(false)
    }

    void loadTable()

    return () => {
      active = false
    }
  }, [])

  const table = useMemo(() => {
    const rows = new Map<string, Standing>()
    const finished = matches.filter(
      (match) => match.status === "FINISHED"
    )

    for (const match of finished) {
      const home =
        rows.get(match.home_team) ||
        createStanding(match.home_team)
      const away =
        rows.get(match.away_team) ||
        createStanding(match.away_team)

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

      rows.set(match.home_team, home)
      rows.set(match.away_team, away)
    }

    return [...rows.values()]
      .sort((a, b) => {
        const diffA =
          a.goalsFor - a.goalsAgainst
        const diffB =
          b.goalsFor - b.goalsAgainst

        return (
          b.points - a.points ||
          diffB - diffA ||
          b.goalsFor - a.goalsFor ||
          a.team.localeCompare(b.team)
        )
      })
      .slice(0, 8)
  }, [matches])

  return (
    <section className="rounded-lg border border-white/10 bg-black p-5 text-white">
      <h2 className="mb-2 text-2xl font-black">
        {dictionary.standings.title}
      </h2>

      <p className="mb-5 text-sm text-zinc-500">
        {copy.standingsNote ||
          "Classificação calculada com os resultados terminados."}
      </p>

      {loading ? (
        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm text-zinc-400">
          {dictionary.common.loading}
        </div>
      ) : table.length === 0 ? (
        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm text-zinc-400">
          {dictionary.standings.empty}
        </div>
      ) : (
        <div className="space-y-2">
          {table.map((team, index) => (
            <div
              key={team.team}
              className="grid grid-cols-[36px_1fr_42px_42px_56px] items-center gap-2 rounded-lg border border-white/10 p-3 text-sm"
            >
              <div className="font-bold text-zinc-500">
                #{index + 1}
              </div>

              <Link
                href={getTeamHref(team.team)}
                className="truncate font-semibold hover:text-yellow-400"
              >
                {team.team}
              </Link>

              <div>
                {team.played}
                {dictionary.standings.played}
              </div>

              <div>
                {team.won}
                {dictionary.standings.won}
              </div>

              <div className="text-right font-black text-yellow-400">
                {team.points}{" "}
                {dictionary.common.points}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

