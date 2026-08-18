import type { Metadata } from "next"
import { readFile } from "node:fs/promises"
import { join } from "node:path"
import Link from "next/link"
import {
  ArrowRight,
  ClipboardList,
  Database,
} from "lucide-react"

export const metadata: Metadata = {
  title: "SQL Supabase",
}

const sqlFiles = [
  {
    path: "supabase/upgrade.sql",
    filename: "upgrade.sql",
    title: "0. Preparar jogos e competições",
    description:
      "Acrescenta competição, fonte e região aos jogos guardados.",
  },
  {
    path: "supabase/data-provider-upgrade.sql",
    filename: "data-provider-upgrade.sql",
    title: "1. Preparar fornecedor de dados",
    description:
      "Acrescenta campos de fornecedor, IDs externos e tabela de fontes.",
  },
  {
    path: "supabase/queensarena-data-platform.sql",
    filename: "queensarena-data-platform.sql",
    title: "2. Ativar fornecedor próprio QueensArena",
    description:
      "Cria campos de validação, fontes, lotes de importação e correções para gerir dados próprios.",
  },
  {
    path: "supabase/season-stats-upgrade.sql",
    filename: "season-stats-upgrade.sql",
    title: "3. Preparar épocas, plantéis e estatísticas",
    description:
      "Cria tabelas para plantéis e estatísticas por época e competição.",
  },
  {
    path: "supabase/seed.sql",
    filename: "seed.sql",
    title: "4. Inserir competições e equipas base",
    description:
      "Garante que a base tem as competições e equipas acompanhadas pela app.",
  },
  {
    path: "supabase/analytics-events.sql",
    filename: "analytics-events.sql",
    title: "5. Preparar analítica de crescimento",
    description:
      "Cria a tabela de eventos para páginas vistas e sinais de utilização consentidos.",
  },
  {
    path: "supabase/data-cleanup.sql",
    filename: "data-cleanup.sql",
    title: "6. Limpar nomes e países base",
    description:
      "Corrige acentos importados com encoding antigo e preenche países nas equipas base.",
  },
  {
    path: "supabase/user-profiles-favorites.sql",
    filename: "user-profiles-favorites.sql",
    title: "7. Preparar contas, perfis e favoritos",
    description:
      "Cria perfis, favoritos e políticas para utilizadores autenticados.",
  },
  {
    path: "supabase/signup-emails.sql",
    filename: "signup-emails.sql",
    title: "8. Registar emails de criação de conta",
    description:
      "Guarda emails submetidos no registo para apoio, auditoria e recuperação de contas.",
  },
  {
    path: "supabase/editorial-sources.sql",
    filename: "editorial-sources.sql",
    title: "9. Preparar fontes editoriais",
    description:
      "Cria o catálogo de fontes de notícias, feeds e referências editoriais seguras.",
  },
  {
    path: "supabase/sports-poll.sql",
    filename: "sports-poll.sql",
    title: "10. Preparar enquete de modalidades",
    description:
      "Cria a tabela onde ficam guardadas as modalidades pedidas pelos utilizadores.",
  },
]

async function loadSqlFile(filename: string) {
  return readFile(
    join(process.cwd(), "supabase", filename),
    "utf8"
  )
}

export default async function AdminSqlPage() {
  const files = await Promise.all(
    sqlFiles.map(async (file) => ({
      ...file,
      sql: await loadSqlFile(file.filename),
    }))
  )

  const combinedSql = files
    .map(
      (file) =>
        `-- ${file.title}\n-- ${file.path}\n\n${file.sql}`
    )
    .join("\n\n")

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-8 text-white lg:px-8">
      <div className="mx-auto max-w-6xl">
        <p className="inline-flex items-center gap-2 rounded-lg border border-yellow-500/20 bg-yellow-500/10 px-3 py-2 text-xs font-black uppercase text-yellow-300">
          <Database className="h-4 w-4" />
          Supabase
        </p>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section>
            <h1 className="text-4xl font-black md:text-5xl">
              SQL pronto a copiar
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-400">
              Abre o SQL Editor no Supabase, copia o bloco
              combinado e executa. Depois volta ao Setup técnico
              para confirmar se as tabelas e dados aparecem como
              prontos.
            </p>
          </section>

          <section className="rounded-lg border border-white/[0.06] bg-[#0b0b0b] p-5">
            <p className="text-xs font-bold uppercase text-zinc-500">
              Ordem
            </p>
            <ol className="mt-3 space-y-2 text-sm text-zinc-300">
              {files.map((file) => (
                <li key={file.path}>{file.title}</li>
              ))}
            </ol>
            <Link
              href="/admin/setup"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-yellow-400 px-4 py-3 text-sm font-black text-black"
            >
              Ver setup
              <ArrowRight className="h-4 w-4" />
            </Link>
          </section>
        </div>

        <section className="mt-6 rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-5">
          <div className="flex items-center gap-3">
            <ClipboardList className="h-5 w-5 text-yellow-300" />
            <h2 className="text-xl font-black text-yellow-100">
              Bloco combinado
            </h2>
          </div>
          <textarea
            readOnly
            value={combinedSql}
            className="mt-4 h-[420px] w-full resize-y rounded-lg border border-white/[0.08] bg-black p-4 font-mono text-xs leading-5 text-zinc-200 outline-none"
          />
        </section>

        <section className="mt-6 space-y-4">
          {files.map((file) => (
            <article
              key={file.path}
              className="rounded-lg border border-white/[0.06] bg-[#0b0b0b] p-5"
            >
              <p className="text-xs font-bold uppercase text-yellow-400">
                {file.path}
              </p>
              <h2 className="mt-2 text-2xl font-black">
                {file.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-zinc-500">
                {file.description}
              </p>
              <textarea
                readOnly
                value={file.sql}
                className="mt-4 h-64 w-full resize-y rounded-lg border border-white/[0.08] bg-black p-4 font-mono text-xs leading-5 text-zinc-200 outline-none"
              />
            </article>
          ))}
        </section>
      </div>
    </main>
  )
}
