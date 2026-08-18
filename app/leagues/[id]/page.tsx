import Link from "next/link"
import {
  ArrowRight,
  CalendarDays,
  Shield,
  Trophy,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getServerDictionary } from "@/lib/server-i18n"
import {
  findTrackedTeamByName,
  SPORTS,
  TRACKED_COMPETITIONS,
  TRACKED_TEAMS,
} from "@/lib/sports-config"
import { fetchQueensArenaMatches } from "@/lib/queensarena-data"

interface Props {
  params: Promise<{
    id: string
  }>
}

function buildMatchesHref(
  competition: (typeof TRACKED_COMPETITIONS)[number],
  season?: string
) {
  const sport =
    SPORTS.find(
      (item) => item.name === competition.sport
    )?.key || "football"

  const params = new URLSearchParams({
    sport,
    region: competition.region,
    competition: competition.key,
    section: "standings",
  })

  if (season) {
    params.set("season", season)
  }

  return `/matches?${params.toString()}`
}

function bestSeasonFromMatches(
  matches: Array<{
    starts_at: string
    season?: string | null
  }>
) {
  const seasons = new Map<string, number>()

  for (const match of matches) {
    const explicitSeason = String(
      match.season || ""
    )
    const season = /^\d{4}$/.test(explicitSeason)
      ? explicitSeason
      : String(
          new Date(
            match.starts_at
          ).getUTCFullYear()
        )

    if (!/^\d{4}$/.test(season)) continue

    seasons.set(
      season,
      (seasons.get(season) || 0) + 1
    )
  }

  const entries = [...seasons.entries()]
  const strongSeason = entries
    .filter(([, count]) => count >= 10)
    .sort((a, b) => Number(b[0]) - Number(a[0]))[0]

  return (
    strongSeason ||
    entries.sort(
      (a, b) =>
        b[1] - a[1] ||
        Number(b[0]) - Number(a[0])
    )[0]
  )?.[0]
}

function getTeamHref(teamName: string) {
  const team = findTrackedTeamByName(teamName)

  return `/teams/${
    team ? team.key : encodeURIComponent(teamName)
  }`
}

export default async function LeaguePage({
  params,
}: Props) {
  const { id } = await params
  const dictionary =
    await getServerDictionary()
  const decodedId = decodeURIComponent(id)
  const trackedCompetition =
    TRACKED_COMPETITIONS.find(
      (competition) =>
        competition.key === decodedId
    )

  if (trackedCompetition) {
    const matches = await fetchQueensArenaMatches({
      limit: 15000,
      sport: trackedCompetition.sport,
      competition: trackedCompetition.name,
    })
    const matchesHref = buildMatchesHref(
      trackedCompetition,
      bestSeasonFromMatches(matches)
    )
    const teams = TRACKED_TEAMS.filter(
      (team) =>
        team.sport === trackedCompetition.sport &&
        team.competition ===
          trackedCompetition.name
    )

    return (
      <main className="min-h-screen bg-[#050505] p-6 text-white lg:p-10">
        <section className="rounded-lg border border-white/[0.05] bg-[#0b0b0b] p-6 lg:p-10">
          <p className="text-sm font-bold uppercase text-yellow-400">
            {trackedCompetition.sport} /{" "}
            {trackedCompetition.region}
          </p>

          <h1 className="mt-4 text-4xl font-black lg:text-6xl">
            {trackedCompetition.name}
          </h1>

          <p className="mt-4 max-w-[760px] text-zinc-500">
            {trackedCompetition.note}
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              href={matchesHref}
              className="inline-flex items-center gap-2 rounded-lg bg-yellow-400 px-4 py-3 text-sm font-black text-black transition hover:bg-yellow-300"
            >
              Abrir competição
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <section className="mt-6 grid gap-3 md:grid-cols-3">
          <MetricCard
            icon={Trophy}
            label="Estado"
            value={
              trackedCompetition.sourceStatus ===
              "live-api"
                ? "Dados ligados"
                : "Cobertura acompanhada"
            }
          />
          <MetricCard
            icon={CalendarDays}
            label="Jogos recebidos"
            value={matches.length}
          />
          <MetricCard
            icon={Shield}
            label="Equipas"
            value={teams.length}
          />
        </section>

        <section className="mt-6 rounded-lg border border-white/[0.05] bg-[#0b0b0b] p-5">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="text-2xl font-black">
              {dictionary.nav.teams}
            </h2>
            <Link
              href={matchesHref.replace(
                "section=standings",
                "section=teams"
              )}
              className="text-sm font-bold text-yellow-400"
            >
              Ver jogos
            </Link>
          </div>

          {teams.length === 0 ? (
            <EmptyState text="As equipas aparecem aqui quando estiverem mapeadas para esta competição." />
          ) : (
            <div className="overflow-hidden rounded-lg border border-white/[0.06]">
              <table className="w-full text-left text-sm">
                <tbody>
              {teams.map((team) => (
                <tr
                  key={team.key}
                  className="border-b border-white/[0.04] transition hover:bg-white/[0.03]"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={getTeamHref(team.name)}
                      className="block truncate font-bold hover:text-yellow-400"
                    >
                      {team.name}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-xs font-bold uppercase text-zinc-500">
                    {trackedCompetition.sport}
                  </td>
                </tr>
              ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    )
  }

  const { data: league } = await supabase
    .from("leagues")
    .select("*")
    .eq("id", decodedId)
    .single()

  if (!league) {
    return (
      <main className="min-h-screen bg-black p-10 text-white">
        {dictionary.pages.leagueNotFound}
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#050505] p-6 text-white lg:p-10">
      <section className="rounded-lg border border-white/[0.05] bg-[#0b0b0b] p-6 lg:p-10">
        <p className="text-sm font-bold uppercase text-yellow-400">
          {league.sport}
        </p>

        <h1 className="mt-4 text-4xl font-black lg:text-6xl">
          {league.name}
        </h1>

        <p className="mt-4 max-w-[700px] text-zinc-500">
          {dictionary.pages.leagueDescription}
        </p>
      </section>
    </main>
  )
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Trophy
  label: string
  value: string | number
}) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-[#071015] p-5">
      <Icon className="h-5 w-5 text-yellow-400" />
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
    <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-5 text-sm text-zinc-400">
      {text}
    </div>
  )
}

