import type { Metadata } from "next"
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  Info,
} from "lucide-react"
import { analyseMatchData } from "@/lib/data-quality"
import { fetchMatches } from "@/lib/providers/matches-provider"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Qualidade dos dados",
}

function getIssueIcon(severity: string) {
  if (severity === "error") {
    return AlertTriangle
  }

  if (severity === "warning") {
    return AlertTriangle
  }

  return Info
}

export default async function DataQualityPage() {
  const matches = await fetchMatches()
  const report = analyseMatchData(matches)

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-8 text-white lg:px-8">
      <div className="mx-auto max-w-6xl">
        <p className="inline-flex rounded-lg border border-yellow-500/20 bg-yellow-500/10 px-3 py-2 text-xs font-black uppercase text-yellow-300">
          Dados
        </p>

        <h1 className="mt-6 text-4xl font-black md:text-5xl">
          Qualidade dos dados
        </h1>

        <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-400">
          Auditoria aos dados recebidos e importados pela
          QueensArena: jogos, competições, equipas,
          duplicados e fontes oficiais.
        </p>

        <section className="mt-6 grid gap-3 md:grid-cols-4">
          <Metric
            label="Jogos recebidos"
            value={report.matches}
          />
          <Metric
            label="Competições verificadas"
            value={
              report.competitionsChecked.length
            }
          />
          <Metric
            label="Competições com jogos"
            value={
              report.competitionsWithMatches.length
            }
          />
          <Metric
            label="Equipas por mapear"
            value={report.unknownTeams.length}
          />
        </section>

        <section className="mt-6 grid gap-3 md:grid-cols-3">
          <Metric
            label="Equipas vistas"
            value={report.teamsSeen}
          />
          <Metric
            label="Grupos duplicados"
            value={report.duplicateTeamGroups.length}
          />
          <Metric
            label="Jogos sem fonte"
            value={report.missingSourceUrl}
          />
        </section>

        <section className="mt-6 rounded-lg border border-white/[0.06] bg-[#0b0b0b] p-5">
          <h2 className="text-xl font-black">
            Cobertura por competição
          </h2>

          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {report.byCompetition.map((item) => (
              <article
                key={item.competition}
                className="rounded-lg border border-white/[0.06] bg-black p-4"
              >
                <p className="text-xs font-bold uppercase text-yellow-400">
                  {item.region} · {item.sport}
                </p>
                <h3 className="mt-2 font-black">
                  {item.competition}
                </h3>
                <div className="mt-4 grid grid-cols-4 gap-2 text-center">
                  <SmallMetric
                    label="Jogos"
                    value={item.matches}
                  />
                  <SmallMetric
                    label="Fut."
                    value={item.upcoming}
                  />
                  <SmallMetric
                    label="Fim"
                    value={item.finished}
                  />
                  <SmallMetric
                    label="Live"
                    value={item.live}
                  />
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-white/[0.06] bg-[#0b0b0b] p-5">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-xl font-black">
              Problemas detetados
            </h2>

            {report.issues.length === 0 ? (
              <CheckCircle2 className="h-6 w-6 text-green-400" />
            ) : (
              <Database className="h-6 w-6 text-yellow-400" />
            )}
          </div>

          {report.issues.length === 0 ? (
            <p className="text-sm text-zinc-400">
              Não foram detetados problemas nesta consulta.
            </p>
          ) : (
            <div className="space-y-3">
              {report.issues.map((issue) => {
                const Icon = getIssueIcon(
                  issue.severity
                )

                return (
                  <article
                    key={`${issue.title}-${issue.detail}`}
                    className="rounded-lg border border-white/[0.06] bg-black p-4"
                  >
                    <div className="flex gap-3">
                      <Icon className="mt-1 h-5 w-5 shrink-0 text-yellow-400" />
                      <div>
                        <p className="font-black">
                          {issue.title}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-zinc-500">
                          {issue.detail}
                        </p>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>

        {report.duplicateTeamGroups.length > 0 ? (
          <section className="mt-6 rounded-lg border border-white/[0.06] bg-[#0b0b0b] p-5">
            <h2 className="text-xl font-black">
              Possíveis duplicados
            </h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {report.duplicateTeamGroups
                .slice(0, 24)
                .map((group) => (
                  <div
                    key={group.join("-")}
                    className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-4"
                  >
                    <p className="text-sm leading-6 text-yellow-100">
                      {group.join(" · ")}
                    </p>
                  </div>
                ))}
            </div>
          </section>
        ) : null}

        {report.unknownTeams.length > 0 ? (
          <section className="mt-6 rounded-lg border border-white/[0.06] bg-[#0b0b0b] p-5">
            <h2 className="text-xl font-black">
              Equipas por mapear
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {report.unknownTeams.map((team) => (
                <span
                  key={team}
                  className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 px-3 py-2 text-sm font-bold text-yellow-100"
                >
                  {team}
                </span>
              ))}
            </div>
          </section>
        ) : null}

        {report.trackedButEmpty.length > 0 ? (
          <section className="mt-6 rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-5">
            <h2 className="text-xl font-black text-yellow-100">
              Buracos de cobertura
            </h2>
            <div className="mt-4 grid gap-2 md:grid-cols-2">
              {report.trackedButEmpty.map((item) => (
                <div
                  key={item.name}
                  className="rounded-lg border border-yellow-500/20 bg-black/30 p-4"
                >
                  <p className="font-black text-yellow-100">
                    {item.name}
                  </p>
                  <p className="mt-1 text-sm text-yellow-100/70">
                    {item.region} · {item.sourceLabel}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  )
}

function SmallMetric({
  label,
  value,
}: {
  label: string
  value: number
}) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-2 py-3">
      <p className="text-lg font-black">
        {value}
      </p>
      <p className="mt-1 text-[10px] font-bold uppercase text-zinc-500">
        {label}
      </p>
    </div>
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
