"use client"

import { Trophy } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { TRACKED_COMPETITIONS } from "@/lib/sports-config"

export function Tournaments() {
  const { dictionary } = useLanguage()

  function getSourceLabel(source: string) {
    if (source === "football-data") {
      return dictionary.competitions.footballData
    }

    if (source === "thesportsdb") {
      return dictionary.competitions.theSportsDb
    }

    if (source === "pending") {
      return dictionary.competitions.pending
    }

    return dictionary.competitions.manual
  }

  return (
    <section className="mt-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-black">
            {dictionary.competitions.title}
          </h3>

          <p className="mt-1 text-sm text-zinc-500">
            {dictionary.competitions.description}
          </p>
        </div>
      </div>

      <div className="grid gap-3 xl:grid-cols-2">
        {TRACKED_COMPETITIONS.map(
          (competition) => (
            <div
              key={competition.key}
              className="
                rounded-lg
                border
                border-white/[0.05]
                bg-[#0b0b0b]
                p-5
                transition-all
                hover:border-yellow-500/20
              "
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="mb-4 inline-flex items-center gap-2 rounded-md bg-yellow-500/10 px-3 py-1 text-xs font-semibold text-yellow-300">
                    <Trophy className="h-3.5 w-3.5" />
                    {competition.region}
                  </div>

                  <h4 className="text-xl font-black">
                    {competition.name}
                  </h4>

                  <p className="mt-2 text-sm text-zinc-500">
                    {competition.sport}
                  </p>
                </div>

                <div className="rounded-md border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-right">
                  <p className="text-[10px] font-semibold uppercase text-zinc-500">
                    {
                      dictionary.competitions
                        .dataSource
                    }
                  </p>

                  <p className="mt-1 text-xs font-bold text-white">
                    {getSourceLabel(
                      competition.source
                    )}
                  </p>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </section>
  )
}
