import type { Metadata } from "next"
import { BarChart3 } from "lucide-react"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

export const metadata: Metadata = {
  title: "Crescimento",
}

interface AnalyticsEvent {
  event_type: string
  path: string | null
  referrer: string | null
  language: string | null
  viewport: string | null
  created_at: string
}

function countBy(values: (string | null)[]) {
  const counts = new Map<string, number>()

  for (const value of values) {
    const key = value || "Desconhecido"
    counts.set(key, (counts.get(key) || 0) + 1)
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
}

async function loadEvents() {
  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from("analytics_events")
      .select(
        "event_type,path,referrer,language,viewport,created_at"
      )
      .order("created_at", {
        ascending: false,
      })
      .limit(500)

    if (error) {
      return {
        events: [] as AnalyticsEvent[],
        error: error.message,
      }
    }

    return {
      events: (data || []) as AnalyticsEvent[],
      error: null,
    }
  } catch (error) {
    return {
      events: [] as AnalyticsEvent[],
      error:
        error instanceof Error
          ? error.message
          : "Não foi possível carregar analítica.",
    }
  }
}

export default async function AdminGrowthPage() {
  const { events, error } = await loadEvents()
  const pageViews = events.filter(
    (event) => event.event_type === "page_view"
  )
  const paths = countBy(
    pageViews.map((event) => event.path)
  )
  const languages = countBy(
    pageViews.map((event) => event.language)
  )
  const today = new Date()
    .toISOString()
    .slice(0, 10)
  const todayViews = pageViews.filter((event) =>
    event.created_at.startsWith(today)
  ).length

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-8 text-white lg:px-8">
      <div className="mx-auto max-w-6xl">
        <p className="inline-flex items-center gap-2 rounded-lg border border-yellow-500/20 bg-yellow-500/10 px-3 py-2 text-xs font-black uppercase text-yellow-300">
          <BarChart3 className="h-4 w-4" />
          Crescimento
        </p>

        <h1 className="mt-6 text-4xl font-black md:text-5xl">
          Analítica da beta
        </h1>

        <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-400">
          Visão simples das visitas registadas com consentimento. Para
          relatórios completos, liga também Google Analytics 4.
        </p>

        {error && (
          <div className="mt-6 rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-4 text-sm leading-6 text-yellow-100">
            Ainda falta aplicar a tabela{" "}
            <code className="rounded bg-black/40 px-1">
              supabase/analytics-events.sql
            </code>
            . Erro: {error}
          </div>
        )}

        <section className="mt-6 grid gap-3 md:grid-cols-3">
          <MetricCard label="Eventos" value={events.length} />
          <MetricCard
            label="Páginas vistas"
            value={pageViews.length}
          />
          <MetricCard label="Hoje" value={todayViews} />
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <TableBlock
            title="Páginas mais vistas"
            rows={paths}
          />
          <TableBlock title="Idiomas" rows={languages} />
        </section>
      </div>
    </main>
  )
}

function MetricCard({
  label,
  value,
}: {
  label: string
  value: number
}) {
  return (
    <div className="rounded-lg border border-white/[0.08] bg-[#0b0b0b] p-5">
      <p className="text-3xl font-black text-white">
        {value}
      </p>
      <p className="mt-2 text-xs font-bold uppercase text-zinc-500">
        {label}
      </p>
    </div>
  )
}

function TableBlock({
  title,
  rows,
}: {
  title: string
  rows: [string, number][]
}) {
  return (
    <section className="rounded-lg border border-white/[0.08] bg-[#0b0b0b] p-5">
      <h2 className="text-2xl font-black">
        {title}
      </h2>
      <div className="mt-4 space-y-2">
        {rows.map(([label, count]) => (
          <div
            key={label}
            className="flex items-center justify-between gap-3 rounded-lg border border-white/[0.06] bg-black/30 p-3 text-sm"
          >
            <span className="truncate text-zinc-300">
              {label}
            </span>
            <span className="font-black text-yellow-400">
              {count}
            </span>
          </div>
        ))}

        {rows.length === 0 && (
          <p className="rounded-lg border border-white/[0.06] bg-black/30 p-4 text-sm text-zinc-500">
            Sem dados.
          </p>
        )}
      </div>
    </section>
  )
}
