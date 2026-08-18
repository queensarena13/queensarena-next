import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowRight,
  Database,
  Search,
} from "lucide-react"
import { fetchSportmonksLeagues } from "@/lib/providers/sportmonks-provider"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Sportmonks",
}

const preferredTerms = [
  "women",
  "femin",
  "nwsl",
  "liga bpi",
  "champions league",
  "euro",
]

function isPreferredLeague(name: string) {
  const normalized = name.toLowerCase()

  return preferredTerms.some((term) =>
    normalized.includes(term)
  )
}

export default async function AdminSportmonksPage({
  searchParams,
}: {
  searchParams?: Promise<{ search?: string }>
}) {
  const params = await searchParams
  const search = params?.search?.trim() || ""
  const leagues = await fetchSportmonksLeagues(
    search || undefined
  )
  const preferredLeagues = search
    ? leagues
    : leagues.filter((league) =>
        isPreferredLeague(league.name)
      )
  const visibleLeagues = (
    preferredLeagues.length
      ? preferredLeagues
      : leagues
  ).slice(0, 80)

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-8 text-white lg:px-8">
      <div className="mx-auto max-w-6xl">
        <p className="inline-flex items-center gap-2 rounded-lg border border-yellow-500/20 bg-yellow-500/10 px-3 py-2 text-xs font-black uppercase text-yellow-300">
          <Database className="h-4 w-4" />
          Sportmonks
        </p>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section>
            <h1 className="text-4xl font-black md:text-5xl">
              Ligas e épocas disponíveis
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-400">
              Esta página usa o token Sportmonks no servidor para
              descobrir IDs de ligas e épocas. Estes IDs são
              necessários para importar equipas e plantéis.
            </p>
          </section>

          <form className="rounded-lg border border-white/[0.06] bg-[#0b0b0b] p-5">
            <label className="text-xs font-bold uppercase text-zinc-500">
              Pesquisar liga
            </label>
            <div className="mt-3 flex gap-2">
              <input
                name="search"
                defaultValue={search}
                placeholder="NWSL, Women, Portugal..."
                className="h-12 min-w-0 flex-1 rounded-lg border border-white/[0.08] bg-black px-4 text-sm font-bold outline-none focus:border-yellow-400"
              />
              <button
                type="submit"
                className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-400 text-black"
              >
                <Search className="h-5 w-5" />
              </button>
            </div>
          </form>
        </div>

        <section className="mt-6 grid gap-3">
          {visibleLeagues.length === 0 ? (
            <div className="rounded-lg border border-white/[0.06] bg-[#0b0b0b] p-5 text-sm text-zinc-400">
              Não foram encontradas ligas para esta pesquisa.
            </div>
          ) : (
            visibleLeagues.map((league) => {
              const currentSeason =
                league.currentSeason ||
                league.currentseason ||
                null
              const seasons = (league.seasons || [])
                .slice()
                .sort((a, b) =>
                  b.name.localeCompare(a.name)
                )
                .slice(0, 6)

              return (
                <article
                  key={league.id}
                  className="rounded-lg border border-white/[0.06] bg-[#0b0b0b] p-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase text-yellow-400">
                        League ID {league.id}
                      </p>
                      <h2 className="mt-2 text-2xl font-black">
                        {league.name}
                      </h2>
                      <p className="mt-2 text-sm text-zinc-500">
                        {league.country?.name ||
                          "País não indicado"}
                      </p>
                    </div>

                    {currentSeason?.id ? (
                      <Link
                        href={`/admin/data?seasonId=${currentSeason.id}&competition=${encodeURIComponent(
                          league.name
                        )}&season=${encodeURIComponent(
                          currentSeason.name || "2026"
                        )}&region=${encodeURIComponent(
                          league.country?.name || "Global"
                        )}`}
                        className="inline-flex items-center gap-2 rounded-lg bg-yellow-400 px-4 py-3 text-sm font-black text-black"
                      >
                        Usar época atual
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    ) : null}
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {seasons.map((season) => (
                      <span
                        key={season.id}
                        className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs font-bold text-zinc-300"
                      >
                        {season.name} · ID {season.id}
                      </span>
                    ))}
                  </div>
                </article>
              )
            })
          )}
        </section>
      </div>
    </main>
  )
}
