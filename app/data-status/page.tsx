import type { Metadata } from "next"
import Link from "next/link"
import { CheckCircle2, Database } from "lucide-react"
import { analyseMatchData } from "@/lib/data-quality"
import { fetchMatches } from "@/lib/providers/matches-provider"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Estado dos dados",
}

export default async function DataStatusPage() {
  const matches = await fetchMatches()
  const report = analyseMatchData(matches)

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-8 text-white lg:px-8">
      <div className="mx-auto max-w-5xl">
        <p className="inline-flex rounded-lg border border-yellow-500/20 bg-yellow-500/10 px-3 py-2 text-xs font-black uppercase text-yellow-300">
          Fontes e dados
        </p>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section>
            <h1 className="text-4xl font-black md:text-5xl">
              Estado dos dados
            </h1>
            <p className="mt-4 text-sm leading-7 text-zinc-400">
              A QueensArena apresenta resultados recebidos das fontes ligadas
              e identifica a cobertura disponível em cada competição.
            </p>
          </section>

          <section className="rounded-lg border border-white/[0.06] bg-[#0b0b0b] p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase text-zinc-500">
                  Estado atual
                </p>
                <h2 className="mt-3 text-3xl font-black">Operacional</h2>
              </div>

              <CheckCircle2 className="h-9 w-9 text-green-400" />
            </div>

            <p className="mt-4 text-sm leading-6 text-zinc-400">
              Última verificação:{" "}
              {new Date(report.checkedAt).toLocaleString("pt-PT")}
            </p>
          </section>
        </div>

        <section className="mt-6 grid gap-3 md:grid-cols-3">
          <Metric label="Jogos recebidos" value={report.matches} />
          <Metric
            label="Competições acompanhadas"
            value={report.competitionsChecked.length}
          />
          <Metric
            label="Competições com jogos"
            value={report.competitionsWithMatches.length}
          />
        </section>

        <section className="mt-6 rounded-lg border border-white/[0.06] bg-[#0b0b0b] p-5">
          <div className="flex items-center gap-3">
            <Database className="h-5 w-5 text-yellow-400" />
            <h2 className="text-xl font-black">Fontes e cobertura</h2>
          </div>

          <p className="mt-4 text-sm leading-7 text-zinc-400">
            A cobertura atual combina fontes oficiais, dados estruturados em
            Supabase e integrações externas autorizadas ou em validação. A base
            está preparada para receber equipas, jogadoras, plantéis,
            resultados e estatísticas à medida que a cobertura crescer.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {report.competitionsChecked.map((competition) => (
              <span
                key={competition}
                className="rounded-lg border border-white/[0.08] bg-black px-3 py-2 text-sm font-bold text-zinc-300"
              >
                {competition}
              </span>
            ))}
          </div>
        </section>

        {report.byCompetition.length > 0 ? (
          <section className="mt-6 rounded-lg border border-white/[0.06] bg-[#0b0b0b] p-5">
            <h2 className="text-xl font-black">Cobertura com jogos reais</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="text-xs uppercase text-zinc-500">
                  <tr className="border-b border-white/[0.06]">
                    <th className="py-3 pr-3">Competição</th>
                    <th className="py-3 pr-3">Região</th>
                    <th className="py-3 pr-3 text-right">Jogos</th>
                    <th className="py-3 pr-3 text-right">Futuros</th>
                    <th className="py-3 pr-3 text-right">Acabados</th>
                    <th className="py-3 text-right">Live</th>
                  </tr>
                </thead>
                <tbody>
                  {report.byCompetition.map((item) => (
                    <tr
                      key={item.competition}
                      className="border-b border-white/[0.04]"
                    >
                      <td className="py-4 pr-3 font-black">
                        {item.competition}
                      </td>
                      <td className="py-4 pr-3 text-zinc-400">
                        {item.region}
                      </td>
                      <td className="py-4 pr-3 text-right">{item.matches}</td>
                      <td className="py-4 pr-3 text-right">{item.upcoming}</td>
                      <td className="py-4 pr-3 text-right">{item.finished}</td>
                      <td className="py-4 text-right text-green-300">
                        {item.live}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href="/sources"
            className="inline-flex rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm font-black text-white transition hover:bg-white/[0.06]"
          >
            Ver fontes
          </Link>
          <Link
            href="/matches"
            className="inline-flex rounded-lg bg-yellow-400 px-4 py-3 text-sm font-black text-black transition hover:bg-yellow-300"
          >
            Ver jogos
          </Link>
        </div>
      </div>
    </main>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-[#0b0b0b] p-5">
      <p className="text-xs font-bold uppercase text-zinc-500">{label}</p>
      <p className="mt-3 text-3xl font-black">{value}</p>
    </div>
  )
}
