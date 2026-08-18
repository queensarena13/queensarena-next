"use client"

import { useEffect, useState } from "react"
import { CalendarDays } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { toHtmlLang } from "@/lib/i18n"

interface Fixture {
  external_id: string
  sport: string
  home_team: string
  away_team: string
  venue: string
  status: string
  starts_at: string
  competition: string
  region: string
}

interface MatchesResponse {
  generatedAt?: string
  matches: Fixture[]
}

const FIXTURES_REFRESH_MS = 5 * 60_000

export function UpcomingFixtures() {
  const { dictionary, locale } =
    useLanguage()
  const [fixtures, setFixtures] =
    useState<Fixture[]>([])
  const [loading, setLoading] =
    useState(true)

  useEffect(() => {
    let active = true

    async function loadFixtures() {
      const response = await fetch(
        `/api/football/matches?view=upcoming&limit=6&t=${Date.now()}`,
        {
          cache: "no-store",
        }
      )
      const data =
        (await response.json()) as MatchesResponse

      if (!active) return

      setFixtures(data.matches || [])
      setLoading(false)
    }

    void loadFixtures()
    const intervalId = setInterval(() => {
      void loadFixtures()
    }, FIXTURES_REFRESH_MS)

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
            {dictionary.matches.scheduledTitle}
          </h3>

          <p className="mt-1 text-sm text-zinc-500">
            {
              dictionary.matches
                .scheduledDescription
            }
          </p>
        </div>

        <CalendarDays className="h-5 w-5 text-yellow-400" />
      </div>

      {loading ? (
        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm text-zinc-400">
          {dictionary.common.loading}
        </div>
      ) : fixtures.length === 0 ? (
        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm text-zinc-400">
          {dictionary.common.sourceUnavailable}
        </div>
      ) : (
        <div className="space-y-3">
          {fixtures.map((fixture) => (
            <div
              key={fixture.external_id}
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
                  {fixture.sport} ·{" "}
                  {fixture.competition}
                </p>

                <div className="mt-2 flex min-w-0 items-center gap-3">
                  <span className="truncate font-semibold text-white">
                    {fixture.home_team}
                  </span>

                  <span className="text-yellow-400">
                    {dictionary.common.vs}
                  </span>

                  <span className="truncate font-semibold text-white">
                    {fixture.away_team}
                  </span>
                </div>

                <p className="mt-2 truncate text-xs text-zinc-600">
                  {fixture.region} · {fixture.venue}
                </p>
              </div>

              <div className="shrink-0 text-right">
                <div className="rounded-md border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-bold uppercase text-blue-300">
                  {fixture.status}
                </div>

                <p className="mt-2 text-sm text-zinc-500">
                  {new Date(
                    fixture.starts_at
                  ).toLocaleDateString(
                    toHtmlLang(locale)
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

