import Link from "next/link"
import { ArrowLeft, BarChart3, Shield, UserRound } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getServerDictionary } from "@/lib/server-i18n"

interface Props {
  params: Promise<{
    id: string
  }>
}

export default async function PlayerPage({
  params,
}: Props) {
  const { id } = await params
  const dictionary =
    await getServerDictionary()

  const { data: player } = await supabase
    .from("players")
    .select(
      `
      *,
      teams (
        id,
        name
      )
    `
    )
    .eq("id", id)
    .single()

  const { data: seasonStats } = await supabase
    .from("player_season_stats")
    .select("*")
    .eq("player_id", id)
    .order("season", {
      ascending: false,
    })

  const { data: roster } = await supabase
    .from("roster_memberships")
    .select(
      `
      id,
      season,
      competition,
      shirt_number,
      role,
      provider,
      teams (
        id,
        name
      )
    `
    )
    .eq("player_id", id)
    .order("season", {
      ascending: false,
    })

  if (!player) {
    return (
      <main className="min-h-screen bg-black p-10 text-white">
        {dictionary.pages.playerNotFound}
      </main>
    )
  }

  const profile = [
    {
      label: dictionary.pages.position,
      value: player.position,
    },
    {
      label: dictionary.pages.team,
      value: player.teams?.name,
    },
    {
      label: dictionary.pages.nationality,
      value: player.nationality,
    },
    {
      label: dictionary.pages.age,
      value: player.age,
    },
  ]

  const stats = [
    {
      label: dictionary.pages.goals,
      value: player.goals,
    },
    {
      label: dictionary.pages.assists,
      value: player.assists,
    },
    {
      label: dictionary.pages.appearances,
      value: player.appearances,
    },
  ]

  return (
    <main className="min-h-screen bg-[#050505] p-6 text-white lg:p-10">
      <Link
        href={`/players?sport=${String(player.sport || "").toLowerCase()}`}
        className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-yellow-400 transition hover:text-yellow-300"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar às jogadoras
      </Link>

      <section className="rounded-lg border border-white/[0.05] bg-[#0b0b0b] p-6 lg:p-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-start">
          {player.image_url ? (
            <div
              aria-hidden="true"
              className="h-28 w-28 shrink-0 rounded-lg bg-cover bg-center"
              style={{
                backgroundImage: `url(${player.image_url})`,
              }}
            />
          ) : (
            <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-lg border border-yellow-400/20 bg-yellow-400/10">
              <UserRound className="h-10 w-10 text-yellow-400" />
            </div>
          )}

          <div>
            <p className="text-sm font-bold uppercase text-yellow-400">
              {player.sport}
              {player.season
                ? ` / ${player.season}`
                : ""}
            </p>

            <h1 className="mt-4 text-4xl font-black lg:text-6xl">
              {player.name}
            </h1>

            <p className="mt-3 text-sm text-zinc-500">
              {player.provider
                ? `Fonte: ${player.provider}`
                : "Fonte: QueensArena"}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-4">
          {profile.map((item) => (
            <div
              key={item.label}
              className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-3"
            >
              <p className="text-xs font-bold uppercase text-zinc-500">
                {item.label}
              </p>

              <p className="mt-2 font-semibold">
                {item.value ||
                  dictionary.common.notAvailable}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 grid gap-3 md:grid-cols-3">
        {stats.map((item) => (
          <div
            key={item.label}
            className="rounded-lg border border-white/[0.05] bg-[#0b0b0b] p-5"
          >
            <p className="text-sm font-bold uppercase text-zinc-500">
              {item.label}
            </p>

            <h2 className="mt-3 text-4xl font-black text-yellow-400">
              {item.value || 0}
            </h2>
          </div>
        ))}
      </section>

      {roster?.length ? (
        <section className="mt-6 rounded-lg border border-white/[0.05] bg-[#0b0b0b] p-6">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-yellow-400" />
            <h2 className="text-2xl font-black">
              Plantéis e competições
            </h2>
          </div>

          <div className="mt-5 overflow-x-auto rounded-lg border border-white/[0.06]">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="bg-white/[0.03] text-xs uppercase text-zinc-500">
                <tr>
                  <th className="px-4 py-3">Época</th>
                  <th className="px-4 py-3">Equipa</th>
                  <th className="px-4 py-3">Competição</th>
                  <th className="px-4 py-3 text-right">Detalhe</th>
                </tr>
              </thead>
              <tbody>
            {roster.map((row) => {
              const team = Array.isArray(row.teams)
                ? row.teams[0]
                : row.teams

              return (
                <tr
                  key={row.id}
                  className="border-t border-white/[0.04] transition hover:bg-white/[0.03]"
                >
                  <td className="whitespace-nowrap px-4 py-3 text-xs font-bold uppercase text-yellow-400">
                    {row.season}
                  </td>
                  <td className="max-w-[180px] truncate px-4 py-3 font-bold">
                    {team?.name || dictionary.common.notAvailable}
                  </td>
                  <td className="max-w-[260px] truncate px-4 py-3 text-zinc-400">
                    {row.competition || dictionary.common.notAvailable}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-xs font-bold uppercase text-zinc-500">
                    {row.role || row.provider || "QueensArena"}
                    {row.shirt_number ? ` · #${row.shirt_number}` : ""}
                  </td>
                </tr>
              )
            })}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {seasonStats?.length ? (
        <section className="mt-6 rounded-lg border border-white/[0.05] bg-[#0b0b0b] p-6">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-5 w-5 text-yellow-400" />
            <h2 className="text-2xl font-black">
              Estatísticas por época
            </h2>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="text-xs uppercase text-zinc-500">
                <tr>
                  <th className="py-3">Época</th>
                  <th>Competição</th>
                  <th>J</th>
                  <th>Titular</th>
                  <th>Min</th>
                  <th>G</th>
                  <th>A</th>
                  <th>CA</th>
                  <th>CV</th>
                </tr>
              </thead>
              <tbody>
                {seasonStats.map((row) => (
                  <tr
                    key={row.id}
                    className="border-t border-white/[0.06]"
                  >
                    <td className="py-3 font-bold">
                      {row.season}
                    </td>
                    <td className="text-zinc-400">
                      {row.competition || "Todas"}
                    </td>
                    <td>{row.appearances}</td>
                    <td>{row.starts}</td>
                    <td>{row.minutes}</td>
                    <td className="font-bold text-yellow-400">
                      {row.goals}
                    </td>
                    <td>{row.assists}</td>
                    <td>{row.yellow_cards}</td>
                    <td>{row.red_cards}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </main>
  )
}
