import type { Metadata } from "next"
import Link from "next/link"
import {
  BarChart3,
  Database,
  FileText,
  Gauge,
  KeyRound,
  ListChecks,
  Rocket,
  Scale,
  Search,
  Settings2,
  TerminalSquare,
} from "lucide-react"

export const metadata: Metadata = {
  title: "Admin",
}

const adminLinks = [
  {
    href: "/admin/setup",
    title: "Setup técnico",
    text: "Chaves, tabelas Supabase e estado de prontidão.",
    icon: Settings2,
  },
  {
    href: "/admin/keys",
    title: "Chaves privadas",
    text: "Onde obter e como adicionar Supabase service role e Sportmonks token.",
    icon: KeyRound,
  },
  {
    href: "/admin/sportmonks",
    title: "Sportmonks",
    text: "Descobrir IDs de ligas e épocas disponíveis para importação.",
    icon: Search,
  },
  {
    href: "/admin/sql",
    title: "SQL Supabase",
    text: "Blocos SQL prontos a copiar para aplicar migrações e dados base.",
    icon: TerminalSquare,
  },
  {
    href: "/admin/data",
    title: "Integração de dados",
    text: "Chaves, importação de equipas e importação de jogadoras.",
    icon: Database,
  },
  {
    href: "/admin/data-quality",
    title: "Qualidade dos dados",
    text: "Auditoria a jogos, equipas por mapear e competições verificadas.",
    icon: Gauge,
  },
  {
    href: "/admin/launch",
    title: "Lançamento",
    text: "Checklist dinâmica para beta público, fornecedores pagos e monetização.",
    icon: Rocket,
  },
  {
    href: "/admin/legal",
    title: "Base legal",
    text: "Checklist portuguesa para RGPD, cookies, reclamações e atividade comercial.",
    icon: Scale,
  },
  {
    href: "/admin/monetization",
    title: "Monetização",
    text: "Prontidão para publicidade, patrocínios e parcerias.",
    icon: BarChart3,
  },
  {
    href: "/admin/growth",
    title: "Crescimento",
    text: "Visitas, páginas vistas e sinais de utilização da beta.",
    icon: BarChart3,
  },
  {
    href: "/admin/logs",
    title: "Logs",
    text: "Registos técnicos de sincronização e processos.",
    icon: FileText,
  },
  {
    href: "/data-status",
    title: "Estado público",
    text: "Página pública de transparência sobre dados.",
    icon: ListChecks,
  },
]

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-[#050505] px-4 py-8 text-white lg:px-8">
      <div className="mx-auto max-w-6xl">
        <p className="inline-flex rounded-lg border border-yellow-500/20 bg-yellow-500/10 px-3 py-2 text-xs font-black uppercase text-yellow-300">
          QueensArena
        </p>

        <h1 className="mt-6 text-4xl font-black md:text-5xl">
          Painel de controlo
        </h1>

        <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-400">
          Centro para acompanhar dados, base legal, monetização,
          setup técnico e qualidade operacional da app.
        </p>

        <section className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {adminLinks.map((item) => {
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg border border-white/[0.06] bg-[#0b0b0b] p-5 transition hover:border-yellow-400/30"
              >
                <Icon className="h-6 w-6 text-yellow-400" />
                <h2 className="mt-5 text-xl font-black">
                  {item.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-zinc-500">
                  {item.text}
                </p>
              </Link>
            )
          })}
        </section>
      </div>
    </main>
  )
}
