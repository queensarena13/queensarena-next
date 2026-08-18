import type { Metadata } from "next"
import Link from "next/link"
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Database,
  KeyRound,
} from "lucide-react"
import { getSetupStatus } from "@/lib/setup-status"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Setup",
}

const sqlFiles = [
  "supabase/upgrade.sql",
  "supabase/data-provider-upgrade.sql",
  "supabase/season-stats-upgrade.sql",
]

export default async function AdminSetupPage() {
  const status = await getSetupStatus()

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-8 text-white lg:px-8">
      <div className="mx-auto max-w-6xl">
        <p className="inline-flex rounded-lg border border-yellow-500/20 bg-yellow-500/10 px-3 py-2 text-xs font-black uppercase text-yellow-300">
          Setup
        </p>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section>
            <h1 className="text-4xl font-black md:text-5xl">
              Prontidão técnica
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-400">
              Esta página verifica se as chaves estão configuradas
              e se o Supabase já tem as tabelas necessárias para
              dados reais, plantéis, estatísticas e notificações.
            </p>
          </section>

          <section className="rounded-lg border border-white/[0.06] bg-[#0b0b0b] p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase text-zinc-500">
                  Estado geral
                </p>
                <h2 className="mt-3 text-3xl font-black">
                  {status.ready
                    ? "Pronto"
                    : "Por concluir"}
                </h2>
              </div>

              {status.ready ? (
                <CheckCircle2 className="h-9 w-9 text-green-400" />
              ) : (
                <AlertTriangle className="h-9 w-9 text-yellow-400" />
              )}
            </div>

            <p className="mt-4 text-sm leading-6 text-zinc-400">
              Última verificação:{" "}
              {new Date(
                status.checkedAt
              ).toLocaleString("pt-PT")}
            </p>
          </section>
        </div>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <StatusPanel
            title="Variáveis"
            icon={KeyRound}
            items={status.env.map((item) => ({
              key: item.key,
              label: item.label,
              ready: item.ready,
              detail: item.public
                ? "Pública"
                : "Privada",
            }))}
          />

          <StatusPanel
            title="Tabelas Supabase"
            icon={Database}
            items={status.tables.map((item) => ({
              key: item.table,
              label: item.table,
              ready: item.ready,
              detail: item.ready
                ? `${item.count} registos`
                : item.message ||
                  "Tabela por criar",
            }))}
          />
        </section>

        <section className="mt-6 rounded-lg border border-white/[0.06] bg-[#0b0b0b] p-5">
          <div className="flex items-center gap-3">
            <Copy className="h-5 w-5 text-yellow-400" />
            <h2 className="text-2xl font-black">
              Próximas ações
            </h2>
          </div>

          <ol className="mt-5 grid gap-3 md:grid-cols-2">
            <li className="rounded-lg border border-white/[0.06] bg-black p-4 text-sm leading-6 text-zinc-300">
              Correr no SQL Editor do Supabase:
              <div className="mt-3 space-y-2">
                {sqlFiles.map((file) => (
                  <code
                    key={file}
                    className="block rounded-md bg-white/[0.05] px-3 py-2 text-xs text-yellow-200"
                  >
                    {file}
                  </code>
                ))}
              </div>
              <Link
                href="/admin/sql"
                className="mt-3 inline-flex rounded-lg bg-yellow-400 px-3 py-2 text-xs font-black text-black"
              >
                Abrir SQL pronto
              </Link>
            </li>

            <li className="rounded-lg border border-white/[0.06] bg-black p-4 text-sm leading-6 text-zinc-300">
              Adicionar no Vercel as chaves em falta, depois voltar
              a esta página e confirmar se fica tudo verde.
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  href="/admin/keys"
                  className="inline-flex rounded-lg bg-yellow-400 px-3 py-2 text-xs font-black text-black"
                >
                  Ver chaves
                </Link>
                <Link
                  href="/admin/data"
                  className="inline-flex rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs font-black text-white"
                >
                  Ir para dados
                </Link>
              </div>
            </li>
          </ol>
        </section>
      </div>
    </main>
  )
}

function StatusPanel({
  title,
  icon: Icon,
  items,
}: {
  title: string
  icon: typeof Database
  items: {
    key: string
    label: string
    ready: boolean
    detail: string
  }[]
}) {
  return (
    <section className="rounded-lg border border-white/[0.06] bg-[#0b0b0b] p-5">
      <div className="mb-5 flex items-center gap-3">
        <Icon className="h-5 w-5 text-yellow-400" />
        <h2 className="text-2xl font-black">
          {title}
        </h2>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between gap-4 rounded-lg border border-white/[0.06] bg-black p-4"
          >
            <div className="min-w-0">
              <p className="truncate font-black">
                {item.label}
              </p>
              <p className="mt-1 truncate text-xs text-zinc-500">
                {item.detail}
              </p>
            </div>

            {item.ready ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-green-400" />
            ) : (
              <AlertTriangle className="h-5 w-5 shrink-0 text-yellow-400" />
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
