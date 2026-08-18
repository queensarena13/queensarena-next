"use client"

import Link from "next/link"
import {
  useEffect,
  useRef,
  useState,
} from "react"
import { Radio } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { notifyAppUpdate } from "@/lib/client-notifications"
import { findTrackedTeamByName } from "@/lib/sports-config"

interface Match {
  external_id: string
  home_team: string
  away_team: string
  home_score: number
  away_score: number
  status: string
  sport: string
  competition: string
  region: string
  starts_at?: string
}

interface MatchesResponse {
  success: boolean
  generatedAt?: string
  matches: Match[]
}

const LIVE_REFRESH_MS = 30_000

function getTeamHref(teamName: string) {
  const team = findTrackedTeamByName(teamName)

  return `/teams/${
    team
      ? team.key
      : encodeURIComponent(teamName)
  }`
}

export function RealtimeMatches() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [generatedAt, setGeneratedAt] =
    useState<string | null>(null)
  const { dictionary } = useLanguage()
  const signatureRef = useRef("")
  const loadedRef = useRef(false)

  useEffect(() => {
    let active = true

    async function loadMatches() {
      const response = await fetch(
        `/api/football/matches?view=live&limit=8&t=${Date.now()}`,
        {
          cache: "no-store",
        }
      )

      const data =
        (await response.json()) as MatchesResponse

      if (!active) return

      const nextSignature = (data.matches || [])
        .map(
          (match) =>
            `${match.external_id}:${match.status}:${match.home_score}-${match.away_score}`
        )
        .join("|")

      if (
        loadedRef.current &&
        signatureRef.current &&
        nextSignature &&
        signatureRef.current !== nextSignature
      ) {
        void notifyAppUpdate(
          "QueensArena",
          "Há uma atualização nos jogos em direto.",
          "/matches?section=live"
        )
      }

      signatureRef.current = nextSignature
      loadedRef.current = true
      setMatches(data.matches || [])
      setGeneratedAt(data.generatedAt || null)
      setLoading(false)
    }

    void loadMatches()
    const intervalId = setInterval(() => {
      void loadMatches()
    }, LIVE_REFRESH_MS)

    return () => {
      active = false
      clearInterval(intervalId)
    }
  }, [])

  return (
    <section
      id="live-matches"
      className="rounded-lg border border-white/10 bg-black p-5 text-white"
    >
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black">
            {dictionary.matches.liveTitle}
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            {dictionary.matches.officialProvider}
          </p>
        </div>

        <Radio className="h-5 w-5 text-green-400" />
      </div>

      {loading ? (
        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm text-zinc-400">
          {dictionary.common.loading}
        </div>
      ) : matches.length === 0 ? (
        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm text-zinc-400">
          <p>{dictionary.matches.liveEmpty}</p>

          {generatedAt && (
            <p className="mt-2 text-xs text-zinc-600">
              {dictionary.common.lastUpdated}:{" "}
              {new Date(
                generatedAt
              ).toLocaleTimeString()}
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {matches.map((match) => (
            <article
              key={match.external_id}
              className="
                rounded-lg
                border
                border-white/10
                bg-[#080808]
                p-4
                transition-all
                hover:border-yellow-400/30
              "
            >
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-zinc-500">
                  {match.sport} ·{" "}
                  {match.competition}
                </p>

                <span className="rounded-md border border-green-500/20 bg-green-500/10 px-3 py-1 text-xs font-bold uppercase text-green-300">
                  {match.status}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                <Link
                  href={getTeamHref(match.home_team)}
                  className="truncate font-bold hover:text-yellow-400"
                >
                  {match.home_team}
                </Link>

                <Link
                  href={`/matches/${encodeURIComponent(
                    match.external_id
                  )}`}
                  className="rounded-md bg-yellow-400 px-3 py-2 text-xl font-black text-black transition hover:bg-yellow-300"
                >
                  {match.home_score} - {match.away_score}
                </Link>

                <Link
                  href={getTeamHref(match.away_team)}
                  className="truncate text-right font-bold hover:text-yellow-400"
                >
                  {match.away_team}
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
