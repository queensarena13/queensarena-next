import type { Metadata } from "next"
import {
  AlertTriangle,
  CheckCircle2,
  Rocket,
} from "lucide-react"
import { getLaunchReadiness } from "@/lib/launch-readiness"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Lançamento",
}

export default async function LaunchPage() {
  const readiness = await getLaunchReadiness()

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-8 text-white lg:px-8">
      <div className="mx-auto max-w-6xl">
        <p className="inline-flex items-center gap-2 rounded-lg border border-yellow-500/20 bg-yellow-500/10 px-3 py-2 text-xs font-black uppercase text-yellow-300">
          <Rocket className="h-4 w-4" />
          Lançamento
        </p>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section>
            <h1 className="text-4xl font-black md:text-5xl">
              Prontidão para beta e lojas
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-400">
              Esta página cruza setup técnico, cobertura de
              dados, equipas, base legal, fontes e monetização.
              Serve para decidir se já podemos avançar para
              teste interno, beta público ou produção aberta.
            </p>
          </section>

          <section className="rounded-lg border border-white/[0.06] bg-[#0b0b0b] p-5">
            <p className="text-xs font-black uppercase text-zinc-500">
              Estado atual
            </p>
            <h2 className="mt-3 text-4xl font-black">
              {readiness.readyCount}/{readiness.totalChecks}
            </h2>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              {readiness.betaReady
                ? "Beta público recomendado. Monetização automática ainda deve esperar aprovação e tráfego."
                : "Ainda há bloqueios antes de abrir a app a mais pessoas."}
            </p>
          </section>
        </div>

        <section className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {readiness.checks.map((check) => (
            <article
              key={check.title}
              className="rounded-lg border border-white/[0.06] bg-[#0b0b0b] p-5"
            >
              <div className="flex items-start justify-between gap-4">
                {check.ready ? (
                  <CheckCircle2 className="h-6 w-6 text-green-400" />
                ) : (
                  <AlertTriangle className="h-6 w-6 text-yellow-400" />
                )}
                <span
                  className={`rounded-lg px-2 py-1 text-xs font-black uppercase ${
                    check.ready
                      ? "bg-green-500/10 text-green-300"
                      : "bg-yellow-500/10 text-yellow-300"
                  }`}
                >
                  {check.status}
                </span>
              </div>
              <h2 className="mt-5 text-lg font-black">
                {check.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-zinc-500">
                {check.text}
              </p>
            </article>
          ))}
        </section>

        <section className="mt-6 grid gap-3 md:grid-cols-4">
          <Metric
            label="Jogos reais"
            value={readiness.report.matches}
          />
          <Metric
            label="Competições com dados"
            value={
              readiness.report
                .competitionsWithMatches.length
            }
          />
          <Metric
            label="Equipas totais"
            value={readiness.teamsTotal}
          />
          <Metric
            label="Equipas com jogos"
            value={readiness.teamsWithMatchData}
          />
        </section>

        <section className="mt-6 rounded-lg border border-white/[0.06] bg-[#0b0b0b] p-5">
          <h2 className="text-2xl font-black">
            Próxima decisão
          </h2>
          <p className="mt-3 text-sm leading-7 text-zinc-400">
            Podemos avançar para teste interno Android e beta
            público controlado. Para produção aberta com
            monetização forte, as prioridades continuam a ser
            aprovação de anúncios, consentimento e cobertura
            oficial FPF/FAP ou fornecedor equivalente.
          </p>
        </section>
      </div>
    </main>
  )
}

function Metric({
  label,
  value,
}: {
  label: string
  value: number
}) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-[#0b0b0b] p-5">
      <p className="text-xs font-bold uppercase text-zinc-500">
        {label}
      </p>
      <p className="mt-3 text-3xl font-black">
        {value}
      </p>
    </div>
  )
}
