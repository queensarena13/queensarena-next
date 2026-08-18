"use client"

import Link from "next/link"
import { Search, UserRound } from "lucide-react"
import {
  useEffect,
  useMemo,
  useState,
} from "react"
import {
  useRouter,
  useSearchParams,
} from "next/navigation"
import { useLanguage } from "@/components/language-provider"
import {
  isSportKey,
  SPORTS,
  type SportKey,
} from "@/lib/sports-config"

interface Player {
  id?: number
  key?: string
  name: string
  sport: string
  position: string | null
  nationality: string | null
  goals: number
  assists: number
  appearances: number
  provider?: string | null
  data_status?: string | null
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

interface PublicPlayersResponse {
  players?: Player[]
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
}

export function PlayersDirectory() {
  const { dictionary, locale } = useLanguage()
  const router = useRouter()
  const searchParams = useSearchParams()
  const sportParam = searchParams.get("sport")
  const sportParamValue = sportParam || ""
  const initialSport: SportKey | "" = isSportKey(
    sportParamValue
  )
    ? sportParamValue
    : ""
  const copy = dictionary.statsPage as
    typeof dictionary.statsPage & {
      playerStatsDescription?: string
      noPlayerStats?: string
    }
  const [players, setPlayers] =
    useState<Player[]>([])
  const [selectedSport, setSelectedSport] =
    useState<SportKey | "">(initialSport)
  const [query, setQuery] = useState("")
  const [loading, setLoading] =
    useState(true)

  useEffect(() => {
    let active = true

    async function loadPlayers() {
      const [storedResponse, liveResponse] =
        await Promise.all([
          fetch(
            `/api/public/players?limit=4000&t=${Date.now()}`,
            {
              cache: "no-store",
            }
          ),
          fetch(`/api/players/live?t=${Date.now()}`, {
            cache: "no-store",
          }),
        ])

      if (!active) return

      const storedPlayersData =
        (await storedResponse.json()) as PublicPlayersResponse
      const storedPlayers =
        storedPlayersData.players || []
      const livePlayersData =
        (await liveResponse.json()) as PlayersResponse
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
        storedPlayers.map((player) =>
          `${player.teams?.name || ""}-${player.name}`.toLowerCase()
        )
      )

      setPlayers([
        ...storedPlayers,
        ...livePlayers.filter(
          (player) =>
            !existingNames.has(
              `${player.teams?.name || ""}-${player.name}`.toLowerCase()
            )
        ),
      ])
      setLoading(false)
    }

    void loadPlayers()

    return () => {
      active = false
    }
  }, [])

  const selectedSportInfo = SPORTS.find(
    (sport) => sport.key === selectedSport
  )
  const sportName = selectedSportInfo?.name || ""

  const filteredPlayers = useMemo(() => {
    const normalized = query
      .trim()
      .toLowerCase()

    if (!selectedSport || !sportName) {
      return []
    }

    const sportPlayers = players.filter(
      (player) =>
        normalize(player.sport) ===
        normalize(sportName)
    )

    if (!normalized) {
      return sportPlayers
    }

    return sportPlayers.filter((player) =>
      [
        player.name,
        player.teams?.name,
        player.position,
        player.nationality,
      ]
        .filter(Boolean)
        .some((value) =>
          value
            ?.toLowerCase()
            .includes(normalized)
        )
    )
  }, [players, query, selectedSport, sportName])

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
      <section className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-lg border border-yellow-500/20 bg-yellow-500/10 px-3 py-2 text-xs font-bold uppercase text-yellow-300">
          <UserRound className="h-4 w-4" />
          {dictionary.nav.players}
        </div>

        <h1 className="text-4xl font-black md:text-5xl">
          {dictionary.nav.players}
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 md:text-base">
          {copy.playerStatsDescription ||
            dictionary.statsPage.description}
        </p>

        <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
          {SPORTS.map((sport) => (
            <button
              key={sport.key}
              onClick={() => {
                setSelectedSport(sport.key)
                router.replace(
                  `/players?sport=${sport.key}`,
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

      <div className="mb-6 flex items-center gap-3 rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-3">
        <Search className="h-5 w-5 text-zinc-500" />
        <input
          value={query}
          onChange={(event) =>
            setQuery(event.target.value)
          }
          placeholder={
            dictionary.search.placeholder
          }
          className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-600"
        />
      </div>

      {!selectedSport ? (
        <div className="rounded-lg border border-white/[0.08] bg-[#0b0b0b] p-5 text-zinc-400">
          Escolhe uma modalidade para veres apenas as jogadoras dessa modalidade.
        </div>
      ) : loading ? (
        <div className="rounded-lg border border-white/[0.08] bg-[#0b0b0b] p-5 text-zinc-400">
          {dictionary.common.loading}
        </div>
      ) : filteredPlayers.length === 0 ? (
        <div className="hidden" aria-hidden="true" />
      ) : (
        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filteredPlayers.map((player) => (
            <Link
              key={player.id || player.key || player.name}
              href={
                player.id
                  ? `/players/${player.id}`
                  : `/players?sport=${selectedSport}`
              }
              className="rounded-lg border border-white/[0.06] bg-[#0b0b0b] p-5 transition hover:border-yellow-400/25 hover:bg-white/[0.03]"
            >
              <article>
                <p className="text-xs font-bold uppercase text-yellow-400">
                  {player.position || player.sport}
                </p>

                <h2 className="mt-3 text-xl font-black">
                  {player.name}
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  {player.teams?.name ||
                    player.nationality ||
                    dictionary.pages.team}
                </p>

                <p className="mt-2 text-xs font-bold uppercase text-zinc-600">
                  {player.provider ||
                    player.sourceLabel ||
                    "QueensArena"}
                </p>

                <div className="mt-5 grid grid-cols-3 gap-2 text-center text-sm">
                  <div>
                    <p className="text-xs uppercase text-zinc-500">
                      {dictionary.pages.goals}
                    </p>
                    <p className="font-black text-yellow-400">
                      {player.goals}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-zinc-500">
                      {dictionary.pages.assists}
                    </p>
                    <p className="font-black text-yellow-400">
                      {player.assists}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-zinc-500">
                      {dictionary.pages.appearances}
                    </p>
                    <p className="font-black text-yellow-400">
                      {player.appearances}
                    </p>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </section>
      )}
    </div>
  )
}

