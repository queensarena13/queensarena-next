import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowRight,
  KeyRound,
  ShieldAlert,
} from "lucide-react"

export const metadata: Metadata = {
  title: "Chaves",
}

const missingKeys = [
  {
    name: "SUPABASE_SERVICE_ROLE_KEY",
    title: "Supabase secret/service role key",
    where:
      "Supabase Dashboard > Project Settings > API Keys",
    why: "Permite ao servidor guardar importações, subscrições push, plantéis e estatísticas. Nunca deve ir para código público.",
    link: "https://supabase.com/docs/guides/getting-started/api-keys",
  },
  {
    name: "HIGHLIGHTLY_API_KEY",
    title: "Highlightly API key",
    where:
      "Highlightly Dashboard ou RapidAPI > Football API > API key",
    why: "Permite testar gratuitamente cobertura de equipas, jogadoras, classificações, lineups e estatísticas antes de avançar para fornecedor pago.",
    link: "https://highlightly.net/football-api/documentation/",
  },
  {
    name: "SPORTMONKS_API_TOKEN",
    title: "Sportmonks API token",
    where:
      "MySportmonks > Dashboard > API tokens",
    why: "Permite importar equipas, plantéis, jogadoras, competições e estatísticas completas.",
    link: "https://docs.sportmonks.com/football",
  },
]

const vercelSteps = [
  "Abrir o projeto queensarena-next na Vercel.",
  "Ir a Settings > Environment Variables.",
  "Criar a variável em Production.",
  "Colar o valor privado da chave.",
  "Guardar e fazer novo deploy.",
]

export default function AdminKeysPage() {
  return (
    <main className="min-h-screen bg-[#050505] px-4 py-8 text-white lg:px-8">
      <div className="mx-auto max-w-6xl">
        <p className="inline-flex items-center gap-2 rounded-lg border border-yellow-500/20 bg-yellow-500/10 px-3 py-2 text-xs font-black uppercase text-yellow-300">
          <KeyRound className="h-4 w-4" />
          Chaves privadas
        </p>

        <section className="mt-6 rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-5">
          <div className="flex gap-3">
            <ShieldAlert className="mt-1 h-5 w-5 shrink-0 text-yellow-300" />
            <div>
              <h1 className="text-3xl font-black md:text-5xl">
                O que falta para dados reais
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-yellow-50/80">
                Estas chaves são privadas. Não devem ser publicadas
                no GitHub nem escritas em ficheiros públicos. Devem
                ficar apenas no Vercel e, se precisares localmente,
                no teu `.env.local`.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-2">
          {missingKeys.map((item) => (
            <article
              key={item.name}
              className="rounded-lg border border-white/[0.06] bg-[#0b0b0b] p-5"
            >
              <p className="text-xs font-bold uppercase text-yellow-400">
                {item.name}
              </p>
              <h2 className="mt-2 text-2xl font-black">
                {item.title}
              </h2>
              <p className="mt-4 text-sm leading-6 text-zinc-400">
                <span className="font-bold text-white">
                  Onde encontrar:
                </span>{" "}
                {item.where}
              </p>
              <p className="mt-3 text-sm leading-6 text-zinc-500">
                {item.why}
              </p>
              <a
                href={item.link}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm font-black text-white transition hover:border-yellow-400/30"
              >
                Abrir documentação
                <ArrowRight className="h-4 w-4 text-yellow-400" />
              </a>
            </article>
          ))}
        </section>

        <section className="mt-6 rounded-lg border border-white/[0.06] bg-[#0b0b0b] p-5">
          <h2 className="text-2xl font-black">
            Como adicionar na Vercel
          </h2>
          <ol className="mt-5 grid gap-3 md:grid-cols-5">
            {vercelSteps.map((step, index) => (
              <li
                key={step}
                className="rounded-lg border border-white/[0.06] bg-black p-4"
              >
                <p className="text-xs font-black text-yellow-400">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <p className="mt-3 text-sm leading-6 text-zinc-300">
                  {step}
                </p>
              </li>
            ))}
          </ol>

          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href="/admin/setup"
              className="rounded-lg bg-yellow-400 px-4 py-3 text-sm font-black text-black"
            >
              Ver setup técnico
            </Link>
            <Link
              href="/admin/data"
              className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm font-black text-white"
            >
              Ir para importação
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}
