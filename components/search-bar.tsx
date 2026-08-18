"use client"

import Link from "next/link"
import { Search } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { supabaseClient } from "@/lib/supabase-client"
import { useLanguage } from "@/components/language-provider"
import {
  SPORTS,
  TRACKED_COMPETITIONS,
  TRACKED_TEAMS,
  canonicalCompetitionDisplayName,
} from "@/lib/sports-config"

interface Team {
  id: string
  name: string
  href: string
}

interface Player {
  id: number
  name: string
}

interface League {
  id: string
  name: string
  href: string
}

interface DataSourceLeague {
  provider_league_id?: string | number | null
  sport?: string | null
  competition?: string | null
  country?: string | null
  region?: string | null
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

function sportKeyFromName(name?: string | null) {
  return (
    SPORTS.find((sport) => sport.name === name)
      ?.key || "football"
  )
}

function buildDynamicCompetitionKey(
  sport: string,
  region: string,
  competition: string
) {
  return `data-${slugify(sport)}-${slugify(region)}-${slugify(competition)}`
}

export function SearchBar({
  autoFocus = false,
}: {
  autoFocus?: boolean
}) {
  const { dictionary } = useLanguage()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState("")
  const [teams, setTeams] = useState<Team[]>(
    []
  )

  const [players, setPlayers] = useState<
    Player[]
  >([])

  const [leagues, setLeagues] = useState<
    League[]
  >([])

  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus()
    }
  }, [autoFocus])

  useEffect(() => {
    async function search() {
      if (query.length < 2) {
        setTeams([])
        setPlayers([])
        setLeagues([])
        return
      }

      const { data: teamsData } =
        await supabaseClient
          .from("teams")
          .select("*")
          .ilike("name", `%${query}%`)
          .limit(5)

      const { data: playersData } =
        await supabaseClient
          .from("players")
          .select("*")
          .ilike("name", `%${query}%`)
          .limit(5)

      const { data: leaguesData } =
        await supabaseClient
          .from("leagues")
          .select("*")
          .ilike("name", `%${query}%`)
          .limit(5)

      const { data: sourceLeaguesData } =
        await supabaseClient
          .from("data_sources")
          .select(
            "provider_league_id,sport,competition,country,region"
          )
          .ilike("competition", `%${query}%`)
          .eq("enabled", true)
          .limit(10)

      const normalizedQuery =
        query.toLowerCase()

      const localTeams = TRACKED_TEAMS.filter(
        (team) =>
          team.name
            .toLowerCase()
            .includes(normalizedQuery)
      )
        .slice(0, 5)
        .map((team) => ({
          id: team.key,
          name: team.name,
          href: `/teams/${team.key}`,
        }))

      const remoteTeams = (teamsData || []).map(
        (team) => ({
          id: String(team.id),
          name: team.name,
          href: `/teams/${encodeURIComponent(
            team.name
          )}`,
        })
      )

      const localLeagues =
        TRACKED_COMPETITIONS.filter(
          (league) =>
            league.name
              .toLowerCase()
              .includes(normalizedQuery)
        )
          .slice(0, 5)
          .map((league) => ({
            id: league.key,
            name: league.name,
            href: `/leagues#${league.key}`,
          }))

      const remoteLeagues = (
        leaguesData || []
      ).map((league) => ({
        id: String(league.id),
        name: league.name,
        href: `/leagues/${league.id}`,
      }))

      const sourceLeagues = (
        (sourceLeaguesData || []) as DataSourceLeague[]
      )
        .filter(
          (league) =>
            league.sport && league.competition
        )
        .map((league, index) => {
          const sport = league.sport || "Football"
          const region =
            league.region ||
            league.country ||
            "Global"
          const competition =
            canonicalCompetitionDisplayName(
              league.competition || "QueensArena",
              sport
            )
          const key =
            buildDynamicCompetitionKey(
              sport,
              region,
              competition
            )

          return {
            id: `${league.provider_league_id || index}-${key}`,
            name: competition,
            href: `/matches?sport=${sportKeyFromName(
              sport
            )}&region=${encodeURIComponent(
              region
            )}&competition=${encodeURIComponent(
              key
            )}&section=standings`,
          }
        })

      setTeams([
        ...localTeams,
        ...remoteTeams.filter(
          (team) =>
            !localTeams.some(
              (item) => item.name === team.name
            )
        ),
      ].slice(0, 5))
      setPlayers(playersData || [])
      setLeagues([
        ...localLeagues,
        ...sourceLeagues.filter(
          (league) =>
            !localLeagues.some(
              (item) =>
                item.name === league.name
            )
        ),
        ...remoteLeagues.filter(
          (league) =>
            !localLeagues.some(
              (item) =>
                item.name === league.name
            ) &&
            !sourceLeagues.some(
              (item) =>
                item.name === league.name
            )
        ),
      ].slice(0, 5))

      setOpen(true)
    }

    search()
  }, [query])

  return (
    <div className="relative">
      {/* INPUT */}
      <div
        className="
          flex
          items-center
          gap-3
          rounded-2xl
          border
          border-white/[0.08]
          bg-white/[0.03]
          px-5
          py-4
        "
      >
        <Search className="h-5 w-5 text-zinc-500" />

        <input
          ref={inputRef}
          type="text"
          placeholder={
            dictionary.search.placeholder
          }
          value={query}
          onChange={(e) =>
            setQuery(e.target.value)
          }
          className="
            w-full
            bg-transparent
            text-sm
            outline-none
            placeholder:text-zinc-500
          "
        />
      </div>

      {/* RESULTS */}
      {open && query.length >= 2 && (
        <div
          className="
            absolute
            left-0
            right-0
            top-[110%]
            z-50
            overflow-hidden
            rounded-3xl
            border
            border-white/[0.08]
            bg-[#0b0b0b]
            shadow-2xl
          "
        >
          {/* TEAMS */}
          {teams.length > 0 && (
            <div className="p-4">
              <p className="mb-3 px-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                {dictionary.search.teams}
              </p>

              <div className="space-y-2">
                {teams.map((team) => (
                  <Link
                    key={team.id}
                    href={team.href}
                    className="
                      block
                      rounded-2xl
                      px-4
                      py-3
                      transition-all
                      hover:bg-white/[0.05]
                    "
                  >
                    {team.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* PLAYERS */}
          {players.length > 0 && (
            <div className="border-t border-white/[0.05] p-4">
              <p className="mb-3 px-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                {dictionary.search.players}
              </p>

              <div className="space-y-2">
                {players.map((player) => (
                  <Link
                    key={player.id}
                    href={`/players/${player.id}`}
                    className="
                      block
                      rounded-2xl
                      px-4
                      py-3
                      transition-all
                      hover:bg-white/[0.05]
                    "
                  >
                    {player.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* LEAGUES */}
          {leagues.length > 0 && (
            <div className="border-t border-white/[0.05] p-4">
              <p className="mb-3 px-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                {dictionary.search.leagues}
              </p>

              <div className="space-y-2">
                {leagues.map((league) => (
                  <Link
                    key={league.id}
                    href={league.href}
                    className="
                      block
                      rounded-2xl
                      px-4
                      py-3
                      transition-all
                      hover:bg-white/[0.05]
                    "
                  >
                    {league.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* EMPTY */}
          {teams.length === 0 &&
            players.length === 0 &&
            leagues.length === 0 && (
              <div className="p-10 text-center">
                <p className="text-zinc-500">
                  {dictionary.search.noResults}
                </p>
              </div>
            )}
        </div>
      )}
    </div>
  )
}
