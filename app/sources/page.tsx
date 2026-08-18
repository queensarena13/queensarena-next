import type { Metadata } from "next"
import { ExternalLink } from "lucide-react"
import { OFFICIAL_SOURCES } from "@/lib/official-sources"
import { fetchEditorialSources } from "@/lib/editorial-sources"
import { fetchQueensArenaOfficialSources } from "@/lib/queensarena-data"
import { canonicalCompetitionDisplayName } from "@/lib/sports-config"

export const metadata: Metadata = {
  title: "Fontes e metodologia",
}

type OfficialSourceLike = {
  slug?: string
  season?: string | null
  sport?: string | null
  region?: string | null
  country?: string | null
  competition?: string | null
  name?: string | null
  notes?: string | null
  ingestion_method?: string | null
  status?: string | null
  source_url?: string | null
}

function getStatusLabel(status?: string | null) {
  if (status === "active") return "Fonte ativa"
  if (status === "watchlist") return "Em acompanhamento"
  if (status === "paused") return "Pausada"

  return "Em validação"
}

function methodLabel(method?: string | null) {
  if (method === "manual_csv") return "Importação QueensArena"
  if (method === "api") return "API"
  if (method === "html_review") return "Revisão de página oficial"

  return "Validação manual"
}

export default async function SourcesPage() {
  const officialSources =
    (await fetchQueensArenaOfficialSources()) as OfficialSourceLike[]
  const editorialSources = await fetchEditorialSources()
  const sources: OfficialSourceLike[] =
    officialSources.length > 0
      ? officialSources
      : (OFFICIAL_SOURCES as OfficialSourceLike[])

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-8 text-white lg:px-8">
      <div className="mx-auto max-w-6xl">
        <p className="inline-flex rounded-lg border border-yellow-500/20 bg-yellow-500/10 px-3 py-2 text-xs font-black uppercase text-yellow-300">
          Transparência
        </p>

        <h1 className="mt-6 text-4xl font-black md:text-5xl">
          Fontes e metodologia
        </h1>

        <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-400">
          A QueensArena está a construir o seu próprio agregador
          de dados. As fontes abaixo indicam de onde pretendemos
          validar calendários, resultados, equipas e competições
          antes de publicar ou corrigir dados na app.
        </p>

        <section className="mt-6 grid gap-3">
          {sources.map((source) => (
            <article
              key={`${source.slug || source.name}-${source.season || "all"}`}
              className="rounded-lg border border-white/[0.08] bg-[#0b0b0b] p-5"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase text-yellow-400">
                    {source.sport || "Sport"} /{" "}
                    {source.region || source.country || "Global"}
                  </p>
                  <h2 className="mt-2 text-xl font-black">
                    {canonicalCompetitionDisplayName(
                      source.competition || source.name || "Fonte",
                      source.sport || undefined
                    )}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-zinc-500">
                    {source.notes ||
                      "Fonte acompanhada pela QueensArena para validação de dados."}
                  </p>
                </div>

                <div className="shrink-0 rounded-lg border border-white/[0.08] bg-black px-4 py-3 text-sm">
                  <p className="font-black text-white">
                    {source.name || "QueensArena"}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {methodLabel(source.ingestion_method)} ·{" "}
                    {getStatusLabel(source.status)}
                  </p>
                </div>
              </div>

              {source.source_url ? (
                <a
                  href={source.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs font-bold text-zinc-300 transition hover:border-yellow-400/30 hover:text-white"
                >
                  Abrir fonte
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : null}
            </article>
          ))}
        </section>

        <section className="mt-10">
          <div className="mb-4">
            <p className="text-xs font-bold uppercase text-yellow-400">
              Dados e verificação
            </p>
            <h2 className="mt-2 text-3xl font-black">
              Fontes candidatas
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-500">
              Estas fontes podem ajudar a validar calendários,
              resultados, equipas, transmissões e contexto público.
              A integração automática só avança quando houver feed,
              API, página pública estável ou autorização.
            </p>
          </div>

          <div className="overflow-hidden rounded-lg border border-white/[0.06] bg-[#0b0b0b]">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-white/[0.03] text-xs uppercase text-zinc-500">
                <tr>
                  <th className="px-4 py-3">Fonte</th>
                  <th className="px-4 py-3">Região</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Cobertura</th>
                  <th className="px-4 py-3 text-right">Link</th>
                </tr>
              </thead>
              <tbody>
                {editorialSources.map((source) => (
                  <tr
                    key={source.slug}
                    className="border-t border-white/[0.04] transition hover:bg-white/[0.03]"
                  >
                    <td className="px-4 py-3 font-bold">
                      {source.name}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-zinc-400">
                      {source.region}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-zinc-400">
                      {source.category}
                    </td>
                    <td className="max-w-[260px] truncate px-4 py-3 text-zinc-500">
                      {source.coverage.slice(0, 4).join(", ")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <a
                        href={source.sports_url || source.homepage_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-md border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs font-bold text-yellow-400 transition hover:border-yellow-400/30"
                      >
                        Abrir
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  )
}
