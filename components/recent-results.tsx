"use client"

import { useEffect, useState } from "react"
import { BadgeCheck } from "lucide-react"
import { useLanguage } from "@/components/language-provider"

interface Result {
  external_id: string
  sport: string
  home_team: string
  away_team: string
  home_score: number
  away_score: number
  venue: string
  status: string
  competition: string
  region: string
}

interface MatchesResponse {
  matches: Result[]
}

const RESULTS_REFRESH_MS = 5 * 60_000

export function RecentResults() {
  const { dictionary } = useLanguage()
  const [results, setResults] =
    useState<Result[]>([])
  const [loading, setLoading] =
    useState(true)

  useEffect(() => {
    let active = true

    async function loadResults() {
      const response = await fetch(
        `/api/football/matches?view=recent&limit=6&t=${Date.now()}`,
        {
          cache: "no-store",
        }
      )
      const data =
        (await response.json()) as MatchesResponse

      if (!active) return

      setResults(data.matches || [])
      setLoading(false)
    }

    void loadResults()
    const intervalId = setInterval(() => {
      void loadResults()
    }, RESULTS_REFRESH_MS)

    return () => {
      active = false
      clearInterval(intervalId)
    }
  }, [])

  return (
    <section className="rounded-lg border border-white/[0.05] bg-[#0b0b0b] p-5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-2xl font-black">
            {dictionary.matches.recentTitle}
          </h3>

          <p className="mt-1 text-sm text-zinc-500">
            {
              dictionary.matches
                .recentDescription
            }
          </p>
        </div>

        <BadgeCheck className="h-5 w-5 text-yellow-400" />
      </div>

      {loading ? (
        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm text-zinc-400">
          {dictionary.common.loading}
        </div>
      ) : results.length === 0 ? (
        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm text-zinc-400">
          {dictionary.common.sourceUnavailable}
        </div>
      ) : (
        <div className="space-y-3">
          {results.map((match) => (
            <div
              key={match.external_id}
              className="
                flex
                items-center
                justify-between
                gap-4
                rounded-lg
                border
                border-white/[0.05]
                bg-[#080808]
                p-4
              "
            >
              <div className="min-w-0">
                <p className="text-sm text-zinc-500">
                  {match.sport} ·{" "}
                  {match.competition}
                </p>

                <div className="mt-2 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                  <span className="truncate font-semibold text-white">
                    {match.home_team}
                  </span>

                  <span className="text-xl font-black text-yellow-400">
                    {match.home_score} -{" "}
                    {match.away_score}
                  </span>

                  <span className="truncate text-right font-semibold text-white">
                    {match.away_team}
                  </span>
                </div>

                <p className="mt-2 truncate text-xs text-zinc-600">
                  {match.region} · {match.venue}
                </p>
              </div>

              <div className="shrink-0 rounded-md border border-green-500/20 bg-green-500/10 px-3 py-1 text-xs font-bold uppercase text-green-300">
                {match.status}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

