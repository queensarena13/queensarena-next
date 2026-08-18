"use client"

import Link from "next/link"
import {
  useRouter,
  useSearchParams,
} from "next/navigation"
import {
  Heart,
  Radio,
  Shield,
} from "lucide-react"
import {
  useEffect,
  useMemo,
  useState,
} from "react"
import { DataStatusCard } from "@/components/data-status-card"
import { FavoriteButton } from "@/components/favorite-button"
import { TeamAvatar } from "@/components/team-avatar"
import { useLanguage } from "@/components/language-provider"
import {
  favoriteTeamsChangedEvent,
  getFavoriteTeams,
} from "@/lib/local-favorites"
import { syncFavoritesFromAccount } from "@/lib/synced-favorites"
import { toHtmlLang } from "@/lib/i18n"
import { TRACKED_TEAMS } from "@/lib/sports-config"

type Filter =
  | ""
  | "football"
  | "futsal"
  | "handball"
  | "beach-handball"

interface Team {
  id?: string | number
  key: string
  name: string
  sport: string
  region: string
  competition: string
  badge_url?: string | null
  sourceLabel: string
  sourceStatus: string
  matches_count?: number
  upcoming_count?: number
  finished_count?: number
  last_match_at?: string | null
}

interface TeamsResponse {
  generatedAt?: string
  sourceLabel?: string
  teams: Team[]
}

interface PublicTeam {
  id?: string | number
  name?: string | null
  sport?: string | null
  country?: string | null
  region?: string | null
  logo_url?: string | null
  provider?: string | null
  data_status?: string | null
  updated_at?: string | null
}

interface PublicTeamsResponse {
  generatedAt?: string
  teams?: PublicTeam[]
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

function teamKeyFromName(name: string) {
  const tracked = TRACKED_TEAMS.find(
    (team) =>
      team.name.toLowerCase() === name.toLowerCase()
  )

  return tracked?.key || slugify(name)
}

function normalizeTeamKey(team: {
  name: string
  sport: string
}) {
  return `${team.sport.toLowerCase()}:${team.name.toLowerCase()}`
}

function fallbackTeams(): Team[] {
  return TRACKED_TEAMS.map((team) => ({
    key: team.key,
    name: team.name,
    sport: team.sport,
    region: team.region,
    competition: team.competition,
    badge_url: null,
    sourceLabel: team.sourceLabel,
    sourceStatus: team.sourceStatus,
  }))
}

export function TeamsDirectory() {
  const { dictionary, locale } = useLanguage()
  const router = useRouter()
  const searchParams = useSearchParams()
  const filterParam = searchParams.get("filter")
  const initialFilter: Filter =
    filterParam === "football" ||
    filterParam === "futsal" ||
    filterParam === "handball" ||
    filterParam === "beach-handball"
      ? filterParam
      : ""
  const [filter, setFilter] =
    useState<Filter>(initialFilter)
  const [favorites, setFavorites] =
    useState<string[]>([])
  const [teams, setTeams] =
    useState<Team[]>(fallbackTeams)
  const [generatedAt, setGeneratedAt] =
    useState<string | null>(null)

  useEffect(() => {
    function sync() {
      setFavorites(getFavoriteTeams())
    }

    void syncFavoritesFromAccount().finally(sync)

    window.addEventListener(
      favoriteTeamsChangedEvent,
      sync
    )

    return () => {
      window.removeEventListener(
        favoriteTeamsChangedEvent,
        sync
      )
    }
  }, [])

  useEffect(() => {
    let active = true

    async function loadTeams() {
      const [publicResponse, liveResponse] =
        await Promise.all([
          fetch(
            `/api/public/teams?limit=3000&t=${Date.now()}`,
            {
              cache: "no-store",
            }
          ),
          fetch(
            `/api/teams/live?t=${Date.now()}`,
            {
              cache: "no-store",
            }
          ),
        ])

      const publicData =
        (await publicResponse.json()) as PublicTeamsResponse
      const liveData =
        (await liveResponse.json()) as TeamsResponse

      if (!active) return

      const merged = new Map<string, Team>()

      for (const team of fallbackTeams()) {
        merged.set(normalizeTeamKey(team), team)
      }

      for (const team of liveData.teams || []) {
        merged.set(normalizeTeamKey(team), team)
      }

      for (const team of publicData.teams || []) {
        if (!team.name || !team.sport) {
          continue
        }

        const key = normalizeTeamKey({
          name: team.name,
          sport: team.sport,
        })
        const existing = merged.get(key)

        merged.set(key, {
          id: team.id || existing?.id,
          key:
            existing?.key ||
            teamKeyFromName(team.name),
          name: team.name,
          sport: team.sport,
          region:
            team.country ||
            team.region ||
            existing?.region ||
            "Global",
          competition:
            existing?.competition ||
            "QueensArena",
          badge_url:
            team.logo_url ||
            existing?.badge_url ||
            null,
          sourceLabel:
            team.provider ||
            existing?.sourceLabel ||
            "QueensArena Data API",
          sourceStatus:
            team.data_status ||
            existing?.sourceStatus ||
            "verified",
          matches_count:
            existing?.matches_count || 0,
          upcoming_count:
            existing?.upcoming_count || 0,
          finished_count:
            existing?.finished_count || 0,
          last_match_at:
            existing?.last_match_at ||
            team.updated_at ||
            null,
        })
      }

      if (merged.size > 0) {
        setTeams(
          [...merged.values()].sort((a, b) =>
            a.name.localeCompare(b.name)
          )
        )
      }

      setGeneratedAt(
        publicData.generatedAt ||
          liveData.generatedAt ||
          null
      )
    }

    void loadTeams()

    return () => {
      active = false
    }
  }, [])

  const filters = [
    {
      key: "football" as const,
      label: dictionary.teamsPage.football,
    },
    {
      key: "futsal" as const,
      label: dictionary.teamsPage.futsal,
    },
    {
      key: "handball" as const,
      label: dictionary.teamsPage.handball,
    },
    {
      key: "beach-handball" as const,
      label: dictionary.teamsPage.beachHandball,
    },
  ]

  const filteredTeams = useMemo(() => {
    return teams.filter((team) => {
      if (!filter) return false
      if (filter === "football") {
        return team.sport === "Football"
      }
      if (filter === "futsal") {
        return team.sport === "Futsal"
      }
      if (filter === "beach-handball") {
        return team.sport === "Beach Handball"
      }

      return team.sport === "Handball"
    })
  }, [filter, teams])

  const favoriteTeams = filteredTeams.filter(
    (team) => favorites.includes(team.key)
  )

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
      <section className="mb-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-lg border border-yellow-500/20 bg-yellow-500/10 px-3 py-2 text-xs font-bold uppercase text-yellow-300">
              <Shield className="h-4 w-4" />
              {dictionary.nav.teams}
            </div>

            <h1 className="text-4xl font-black md:text-5xl">
              {dictionary.teamsPage.title}
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 md:text-base">
              {dictionary.teamsPage.description}
            </p>
          </div>
        </div>

        <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
          {filters.map((item) => (
            <button
              key={item.key}
              onClick={() => {
                setFilter(item.key)
                router.replace(
                  `/teams?filter=${item.key}`,
                  {
                    scroll: false,
                  }
                )
              }}
              className={`shrink-0 rounded-lg border px-4 py-2 text-sm font-bold transition ${
                filter === item.key
                  ? "border-yellow-400 bg-yellow-400 text-black"
                  : "border-white/[0.08] bg-white/[0.03] text-zinc-300"
              }`}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      {filter ? (
        <DataStatusCard
          title={dictionary.teamsPage.coverageTitle}
          description={
            dictionary.teamsPage.coverageDescription
          }
          locale={locale}
          updatedAt={
            generatedAt
              ? new Date(
                  generatedAt
                ).toLocaleString(toHtmlLang(locale))
              : null
          }
        />
      ) : null}

      {filter ? (
      <section className="mb-6 mt-6 rounded-lg border border-white/[0.06] bg-[#071015] p-5">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black">
              {dictionary.teamsPage.favoriteTeams}
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              {favoriteTeams.length > 0
                ? `${favoriteTeams.length} ${dictionary.common.favorites}`
                : dictionary.teamsPage.noFavorites}
            </p>
          </div>

          <Heart className="h-5 w-5 text-yellow-400" />
        </div>

        {favoriteTeams.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {favoriteTeams.map((team) => (
              <Link
                key={team.key}
                href={`/teams/${team.key}`}
                className="shrink-0 rounded-lg border border-yellow-400/20 bg-yellow-400/10 px-4 py-3 text-sm font-bold text-yellow-100"
              >
                {team.name}
              </Link>
            ))}
          </div>
        )}
      </section>
      ) : null}

      {!filter ? (
        <section className="rounded-lg border border-white/[0.06] bg-[#0b0b0b] p-5 text-sm text-zinc-400">
          Escolhe uma modalidade para veres apenas as equipas dessa modalidade.
        </section>
      ) : (
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {filteredTeams.map((team) => (
          <article
            key={team.key}
            className="rounded-lg border border-white/[0.06] bg-[#0b0b0b] p-5 transition hover:border-yellow-400/25"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div className="flex min-w-0 gap-3">
                <TeamAvatar
                  name={team.name}
                  logoUrl={team.badge_url}
                  size={48}
                />

                <div className="min-w-0">
                  <div className="mb-3 inline-flex items-center gap-2 rounded-md bg-white/[0.04] px-3 py-1 text-xs font-bold uppercase text-zinc-400">
                    <Radio className="h-3.5 w-3.5 text-green-400" />
                    {team.region}
                  </div>

                  <Link
                    href={`/teams/${team.key}`}
                    className="block truncate text-xl font-black hover:text-yellow-400"
                  >
                    {team.name}
                  </Link>
                </div>
              </div>

              <FavoriteButton
                teamId={
                  typeof team.id === "number"
                    ? team.id
                    : typeof team.id === "string"
                      ? Number(team.id)
                      : undefined
                }
                teamKey={team.key}
                teamName={team.name}
                sport={team.sport}
                compact
              />
            </div>

            <div className="space-y-2 border-t border-white/[0.06] pt-4 text-sm">
              <div className="grid grid-cols-3 gap-2 text-center">
                <TeamMetric
                  label={dictionary.teamsPage.matches}
                  value={team.matches_count || 0}
                />
                <TeamMetric
                  label={dictionary.teamsPage.upcoming}
                  value={team.upcoming_count || 0}
                />
                <TeamMetric
                  label={dictionary.teamsPage.finished}
                  value={team.finished_count || 0}
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <p className="text-xs font-bold uppercase text-zinc-500">
                  {dictionary.statsPage.trackedSports}
                </p>
                <p className="font-bold text-white">
                  {team.sport}
                </p>
              </div>

              <div className="flex items-center justify-between gap-4">
                <p className="text-xs font-bold uppercase text-zinc-500">
                  {dictionary.teamsPage.competition}
                </p>
                <p className="truncate text-right font-bold text-white">
                  {team.competition}
                </p>
              </div>

              {team.last_match_at && (
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs font-bold uppercase text-zinc-500">
                    {dictionary.teamsPage.lastData}
                  </p>
                  <p className="truncate text-right font-bold text-white">
                    {new Date(
                      team.last_match_at
                    ).toLocaleDateString(
                      toHtmlLang(locale)
                    )}
                  </p>
                </div>
              )}
            </div>
          </article>
        ))}
      </section>
      )}
    </div>
  )
}

function TeamMetric({
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

