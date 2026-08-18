import Link from "next/link"
import {
  CheckCircle2,
  Database,
  KeyRound,
  Play,
  ShieldAlert,
} from "lucide-react"
import {
  createManualPlayerAction,
  importOfficialCatalogCsvAction,
  importOfficialMatchesCsvAction,
  importSportmonksSquadAction,
  importSportmonksTeamsAction,
  upsertManualCompetitionAction,
  upsertManualMatchAction,
  upsertManualTeamAction,
} from "./actions"
import { DATA_PROVIDER_CANDIDATES } from "@/lib/data-provider-candidates"

const checks = [
  {
    label: "Supabase service role",
    env: "SUPABASE_SERVICE_ROLE_KEY",
    neededFor: "Guardar equipas, jogadoras e notificações.",
  },
  {
    label: "Highlightly key",
    env: "HIGHLIGHTLY_API_KEY",
    neededFor:
      "Testar cobertura gratuita antes de comprar dados pagos.",
  },
  {
    label: "Sportmonks token",
    env: "SPORTMONKS_API_TOKEN",
    neededFor: "Buscar dados reais do fornecedor.",
  },
  {
    label: "STATSCORE API key",
    env: "STATSCORE_API_KEY",
    neededFor:
      "Ativar o fornecedor premium quando o contrato e a chave estiverem prontos.",
  },
  {
    label: "STATSCORE competitions",
    env: "STATSCORE_COMPETITIONS_JSON",
    neededFor:
      "Mapear competições QueensArena para IDs oficiais STATSCORE.",
  },
  {
    label: "Push broadcast secret",
    env: "PUSH_BROADCAST_SECRET",
    neededFor: "Proteger envios de notificações.",
  },
  {
    label: "Cron secret",
    env: "CRON_SECRET",
    neededFor:
      "Proteger sincronizações automáticas na Vercel.",
  },
  {
    label: "VAPID public key",
    env: "NEXT_PUBLIC_VAPID_PUBLIC_KEY",
    neededFor: "Ativar notificações no telemóvel.",
  },
  {
    label: "VAPID private key",
    env: "VAPID_PRIVATE_KEY",
    neededFor: "Assinar notificações push.",
  },
]

const nextSteps = [
  "Correr queensarena-data-platform.sql no Supabase.",
  "Criar as competições prioritárias com fonte oficial.",
  "Adicionar equipas e jogos confirmados.",
  "Adicionar jogadoras quando houver plantéis oficiais.",
  "Validar a app pública e só depois escalar importações.",
]

const providerPriorityLabel = {
  primary: "Prioridade",
  secondary: "Boa opção",
  fallback: "Fallback",
  premium: "Premium",
} as const

type PageProps = {
  searchParams?: Promise<{
    type?: string
    message?: string
    seasonId?: string
    competition?: string
    season?: string
    region?: string
  }>
}

export default async function AdminDataPage({
  searchParams,
}: PageProps) {
  const params = await searchParams
  const resultType = params?.type
  const resultMessage = params?.message
  const defaultSeasonId = params?.seasonId || ""
  const defaultCompetition =
    params?.competition || ""
  const defaultSeason = params?.season || ""
  const defaultRegion = params?.region || ""
  const configuredCount = checks.filter((item) =>
    Boolean(process.env[item.env])
  ).length
  const readyForImports =
    Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY) &&
    (Boolean(process.env.SPORTMONKS_API_TOKEN) ||
      Boolean(process.env.HIGHLIGHTLY_API_KEY) ||
      Boolean(process.env.STATSCORE_API_KEY))

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-6 text-white lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 inline-flex items-center gap-2 rounded-lg border border-yellow-500/20 bg-yellow-500/10 px-3 py-2 text-xs font-bold uppercase text-yellow-300">
          <Database className="h-4 w-4" />
          Dados
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section>
            <h1 className="text-4xl font-black">
              Integração de dados
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
              Este painel mostra o que falta para a
              QueensArena usar dados reais e permite importar
              equipas e jogadoras quando as chaves estiverem
              configuradas.
            </p>
          </section>

          <section className="rounded-lg border border-white/[0.06] bg-[#0b0b0b] p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase text-zinc-500">
                  Estado geral
                </p>
                <h2 className="mt-2 text-3xl font-black">
                  {configuredCount}/{checks.length}
                </h2>
              </div>

              {readyForImports ? (
                <CheckCircle2 className="h-9 w-9 text-green-400" />
              ) : (
                <ShieldAlert className="h-9 w-9 text-yellow-400" />
              )}
            </div>

            <p className="mt-4 text-sm leading-6 text-zinc-400">
              {readyForImports
                ? "Já podes importar dados reais."
                : "Ainda faltam chaves antes de importar dados reais."}
            </p>

            <Link
              href="/admin/data-quality"
              className="mt-5 inline-flex rounded-lg border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-sm font-black text-yellow-200"
            >
              Ver qualidade dos dados
            </Link>
          </section>
        </div>

        {process.env.HIGHLIGHTLY_API_KEY ? (
          <section className="mt-6 rounded-lg border border-white/[0.06] bg-[#0b0b0b] p-5">
            <h2 className="text-xl font-black">
              Diagnóstico Highlightly
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-500">
              Usa este teste para confirmar se a
              Highlightly encontra as competições femininas
              prioritárias antes de avançarmos para uma
              integração mais profunda.
            </p>
            <a
              href="/api/highlightly/probe"
              className="mt-5 inline-flex rounded-lg border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-sm font-black text-yellow-200"
            >
              Testar cobertura Highlightly
            </a>
          </section>
        ) : null}

        {resultMessage ? (
          <div
            className={`mt-6 rounded-lg border p-4 text-sm font-bold ${
              resultType === "success"
                ? "border-green-500/20 bg-green-500/10 text-green-300"
                : "border-yellow-500/20 bg-yellow-500/10 text-yellow-300"
            }`}
          >
            {resultMessage}
          </div>
        ) : null}

        <section className="mt-6 rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-5">
          <h2 className="text-xl font-black">
            QueensArena Data API
          </h2>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-yellow-100/80">
            A app deve ler primeiro da nossa base. Usa estes
            formulários para criar dados confirmados por fonte
            oficial enquanto os fornecedores pagos ficam apenas
            como importadores opcionais.
          </p>
        </section>

        <section className="mt-6 rounded-lg border border-white/[0.06] bg-[#0b0b0b] p-5">
          <h2 className="text-xl font-black">
            Fontes candidatas
          </h2>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-zinc-500">
            A app deve importar dados para a nossa base antes
            de os mostrar ao público. Esta matriz ajuda a
            escolher a fonte certa por modalidade e risco.
          </p>

          <div className="mt-5 grid gap-3 lg:grid-cols-2">
            {DATA_PROVIDER_CANDIDATES.map(
              (provider) => (
                <article
                  key={provider.name}
                  className="rounded-lg border border-white/[0.06] bg-black p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="font-black">
                        {provider.name}
                      </h3>
                      <p className="mt-1 text-xs font-bold uppercase text-zinc-500">
                        {provider.sports}
                      </p>
                    </div>
                    <span className="w-fit rounded-md border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-xs font-black text-yellow-300">
                      {
                        providerPriorityLabel[
                          provider.priority
                        ]
                      }
                    </span>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-zinc-300">
                    {provider.coverage}
                  </p>
                  <p className="mt-3 text-xs leading-5 text-zinc-500">
                    {provider.gaps}
                  </p>

                  <div className="mt-4 grid gap-2 text-xs text-zinc-400 sm:grid-cols-2">
                    <p>
                      <span className="font-bold text-zinc-200">
                        Preço:
                      </span>{" "}
                      {provider.cost}
                    </p>
                    <p>
                      <span className="font-bold text-zinc-200">
                        Formato:
                      </span>{" "}
                      {provider.format}
                    </p>
                    <p>
                      <span className="font-bold text-zinc-200">
                        Auth:
                      </span>{" "}
                      {provider.auth}
                    </p>
                    <p>
                      <span className="font-bold text-zinc-200">
                        Limites:
                      </span>{" "}
                      {provider.limits}
                    </p>
                  </div>

                  <a
                    href={provider.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs font-black text-yellow-200"
                  >
                    Abrir fonte
                  </a>
                </article>
              )
            )}
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-white/[0.06] bg-[#0b0b0b] p-5">
          <h2 className="text-xl font-black">
            Agregador oficial QueensArena
          </h2>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-zinc-500">
            Para não dependermos de um fornecedor único, as
            fontes oficiais ficam registadas na nossa base e os
            ficheiros validados podem ser importados por CSV ou
            JSON. A página pública de fontes já lê este
            catálogo.
          </p>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <a
              href="/sources"
              className="rounded-lg border border-white/[0.08] bg-black px-4 py-3 text-sm font-black text-yellow-200"
            >
              Ver fontes públicas
            </a>
            <a
              href="/api/public/sources"
              className="rounded-lg border border-white/[0.08] bg-black px-4 py-3 text-sm font-black text-yellow-200"
            >
              API de fontes
            </a>
            <a
              href="/api/public/competitions"
              className="rounded-lg border border-white/[0.08] bg-black px-4 py-3 text-sm font-black text-yellow-200"
            >
              API de competições
            </a>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-white/[0.06] bg-[#0b0b0b] p-5">
          <h2 className="text-xl font-black">
            Importar jogos oficiais por CSV
          </h2>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-zinc-500">
            Cola dados vindos de uma fonte oficial ou
            verificada. O importador cria/atualiza jogos e
            equipas como QueensArena Official.
          </p>

          <form
            action={importOfficialMatchesCsvAction}
            className="mt-5"
          >
            <textarea
              name="csv"
              placeholder="source_slug,sport,competition,season,region,home_team,away_team,starts_at,status,home_score,away_score,venue,source_url"
              className="min-h-48 w-full rounded-lg border border-white/[0.08] bg-black px-4 py-3 font-mono text-xs text-zinc-200 outline-none focus:border-yellow-400"
            />

            <button className="mt-4 inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-yellow-400 px-5 text-sm font-black text-black">
              <Play className="h-4 w-4" />
              Importar CSV oficial
            </button>
          </form>
        </section>

        <section className="mt-6 rounded-lg border border-white/[0.06] bg-[#0b0b0b] p-5">
          <h2 className="text-xl font-black">
            Importar equipas e jogadoras por CSV
          </h2>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-zinc-500">
            Usa linhas com <code>entity_type</code> igual a
            <code> team</code> ou <code> player</code>. O
            importador grava tudo como QueensArena Official.
          </p>

          <form
            action={importOfficialCatalogCsvAction}
            className="mt-5"
          >
            <textarea
              name="csv"
              placeholder="entity_type,name,team,sport,season,country,nationality,position,source_url"
              className="min-h-48 w-full rounded-lg border border-white/[0.08] bg-black px-4 py-3 font-mono text-xs text-zinc-200 outline-none focus:border-yellow-400"
            />

            <button className="mt-4 inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-yellow-400 px-5 text-sm font-black text-black">
              <Play className="h-4 w-4" />
              Importar catálogo oficial
            </button>
          </form>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <form
            action={upsertManualCompetitionAction}
            className="rounded-lg border border-white/[0.06] bg-[#0b0b0b] p-5"
          >
            <h2 className="text-xl font-black">
              Competição / fonte
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Cria a competição e regista a fonte usada pela
              QueensArena.
            </p>

            <div className="mt-5 grid gap-3">
              <input
                name="competition"
                placeholder="Competição"
                className="h-12 rounded-lg border border-white/[0.08] bg-black px-4 text-sm font-bold outline-none focus:border-yellow-400"
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  name="sport"
                  placeholder="Modalidade, ex: Handball"
                  className="h-12 rounded-lg border border-white/[0.08] bg-black px-4 text-sm font-bold outline-none focus:border-yellow-400"
                />
                <input
                  name="season"
                  placeholder="Época, ex: 2025/26"
                  className="h-12 rounded-lg border border-white/[0.08] bg-black px-4 text-sm font-bold outline-none focus:border-yellow-400"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  name="country"
                  placeholder="País"
                  className="h-12 rounded-lg border border-white/[0.08] bg-black px-4 text-sm font-bold outline-none focus:border-yellow-400"
                />
                <input
                  name="region"
                  placeholder="Região"
                  className="h-12 rounded-lg border border-white/[0.08] bg-black px-4 text-sm font-bold outline-none focus:border-yellow-400"
                />
              </div>
              <input
                name="sourceUrl"
                placeholder="URL da fonte oficial"
                className="h-12 rounded-lg border border-white/[0.08] bg-black px-4 text-sm font-bold outline-none focus:border-yellow-400"
              />
              <textarea
                name="notes"
                placeholder="Notas internas"
                className="min-h-24 rounded-lg border border-white/[0.08] bg-black px-4 py-3 text-sm font-bold outline-none focus:border-yellow-400"
              />
            </div>

            <button className="mt-5 inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-yellow-400 px-5 text-sm font-black text-black">
              <Play className="h-4 w-4" />
              Guardar competição
            </button>
          </form>

          <form
            action={upsertManualTeamAction}
            className="rounded-lg border border-white/[0.06] bg-[#0b0b0b] p-5"
          >
            <h2 className="text-xl font-black">
              Equipa
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Adiciona ou atualiza uma equipa numa modalidade.
            </p>

            <div className="mt-5 grid gap-3">
              <input
                name="name"
                placeholder="Nome da equipa"
                className="h-12 rounded-lg border border-white/[0.08] bg-black px-4 text-sm font-bold outline-none focus:border-yellow-400"
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  name="sport"
                  placeholder="Modalidade"
                  className="h-12 rounded-lg border border-white/[0.08] bg-black px-4 text-sm font-bold outline-none focus:border-yellow-400"
                />
                <input
                  name="country"
                  placeholder="País"
                  className="h-12 rounded-lg border border-white/[0.08] bg-black px-4 text-sm font-bold outline-none focus:border-yellow-400"
                />
              </div>
              <input
                name="region"
                placeholder="Região"
                className="h-12 rounded-lg border border-white/[0.08] bg-black px-4 text-sm font-bold outline-none focus:border-yellow-400"
              />
              <input
                name="logoUrl"
                placeholder="URL do logótipo"
                className="h-12 rounded-lg border border-white/[0.08] bg-black px-4 text-sm font-bold outline-none focus:border-yellow-400"
              />
              <input
                name="sourceUrl"
                placeholder="URL da fonte oficial"
                className="h-12 rounded-lg border border-white/[0.08] bg-black px-4 text-sm font-bold outline-none focus:border-yellow-400"
              />
            </div>

            <button className="mt-5 inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-yellow-400 px-5 text-sm font-black text-black">
              <Play className="h-4 w-4" />
              Guardar equipa
            </button>
          </form>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <form
            action={upsertManualMatchAction}
            className="rounded-lg border border-white/[0.06] bg-[#0b0b0b] p-5"
          >
            <h2 className="text-xl font-black">
              Jogo
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Cria ou atualiza um jogo confirmado.
            </p>

            <div className="mt-5 grid gap-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  name="sport"
                  placeholder="Modalidade"
                  className="h-12 rounded-lg border border-white/[0.08] bg-black px-4 text-sm font-bold outline-none focus:border-yellow-400"
                />
                <input
                  name="competition"
                  placeholder="Competição"
                  className="h-12 rounded-lg border border-white/[0.08] bg-black px-4 text-sm font-bold outline-none focus:border-yellow-400"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  name="homeTeam"
                  placeholder="Casa"
                  className="h-12 rounded-lg border border-white/[0.08] bg-black px-4 text-sm font-bold outline-none focus:border-yellow-400"
                />
                <input
                  name="awayTeam"
                  placeholder="Fora"
                  className="h-12 rounded-lg border border-white/[0.08] bg-black px-4 text-sm font-bold outline-none focus:border-yellow-400"
                />
              </div>
              <input
                name="startsAt"
                type="datetime-local"
                className="h-12 rounded-lg border border-white/[0.08] bg-black px-4 text-sm font-bold outline-none focus:border-yellow-400"
              />
              <div className="grid gap-3 sm:grid-cols-3">
                <input
                  name="homeScore"
                  placeholder="Golos casa"
                  type="number"
                  className="h-12 rounded-lg border border-white/[0.08] bg-black px-4 text-sm font-bold outline-none focus:border-yellow-400"
                />
                <input
                  name="awayScore"
                  placeholder="Golos fora"
                  type="number"
                  className="h-12 rounded-lg border border-white/[0.08] bg-black px-4 text-sm font-bold outline-none focus:border-yellow-400"
                />
                <select
                  name="status"
                  defaultValue="SCHEDULED"
                  className="h-12 rounded-lg border border-white/[0.08] bg-black px-4 text-sm font-bold outline-none focus:border-yellow-400"
                >
                  <option value="SCHEDULED">Agendado</option>
                  <option value="LIVE">Ao vivo</option>
                  <option value="HALFTIME">Intervalo</option>
                  <option value="FINISHED">Terminado</option>
                  <option value="POSTPONED">Adiado</option>
                  <option value="CANCELLED">Cancelado</option>
                </select>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  name="season"
                  placeholder="Época"
                  className="h-12 rounded-lg border border-white/[0.08] bg-black px-4 text-sm font-bold outline-none focus:border-yellow-400"
                />
                <input
                  name="region"
                  placeholder="Região"
                  className="h-12 rounded-lg border border-white/[0.08] bg-black px-4 text-sm font-bold outline-none focus:border-yellow-400"
                />
              </div>
              <input
                name="venue"
                placeholder="Pavilhão / estádio"
                className="h-12 rounded-lg border border-white/[0.08] bg-black px-4 text-sm font-bold outline-none focus:border-yellow-400"
              />
              <input
                name="sourceUrl"
                placeholder="URL da fonte oficial"
                className="h-12 rounded-lg border border-white/[0.08] bg-black px-4 text-sm font-bold outline-none focus:border-yellow-400"
              />
            </div>

            <button className="mt-5 inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-yellow-400 px-5 text-sm font-black text-black">
              <Play className="h-4 w-4" />
              Guardar jogo
            </button>
          </form>

          <form
            action={createManualPlayerAction}
            className="rounded-lg border border-white/[0.06] bg-[#0b0b0b] p-5"
          >
            <h2 className="text-xl font-black">
              Jogadora
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Adiciona uma jogadora com ligação opcional a
              equipa já criada.
            </p>

            <div className="mt-5 grid gap-3">
              <input
                name="name"
                placeholder="Nome da jogadora"
                className="h-12 rounded-lg border border-white/[0.08] bg-black px-4 text-sm font-bold outline-none focus:border-yellow-400"
              />
              <input
                name="teamName"
                placeholder="Equipa"
                className="h-12 rounded-lg border border-white/[0.08] bg-black px-4 text-sm font-bold outline-none focus:border-yellow-400"
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  name="sport"
                  placeholder="Modalidade"
                  className="h-12 rounded-lg border border-white/[0.08] bg-black px-4 text-sm font-bold outline-none focus:border-yellow-400"
                />
                <input
                  name="season"
                  placeholder="Época"
                  className="h-12 rounded-lg border border-white/[0.08] bg-black px-4 text-sm font-bold outline-none focus:border-yellow-400"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  name="position"
                  placeholder="Posição"
                  className="h-12 rounded-lg border border-white/[0.08] bg-black px-4 text-sm font-bold outline-none focus:border-yellow-400"
                />
                <input
                  name="nationality"
                  placeholder="Nacionalidade"
                  className="h-12 rounded-lg border border-white/[0.08] bg-black px-4 text-sm font-bold outline-none focus:border-yellow-400"
                />
              </div>
              <input
                name="sourceUrl"
                placeholder="URL da fonte oficial"
                className="h-12 rounded-lg border border-white/[0.08] bg-black px-4 text-sm font-bold outline-none focus:border-yellow-400"
              />
            </div>

            <button className="mt-5 inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-yellow-400 px-5 text-sm font-black text-black">
              <Play className="h-4 w-4" />
              Guardar jogadora
            </button>
          </form>
        </section>

        <section className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {checks.map((item) => {
            const configured = Boolean(
              process.env[item.env]
            )

            return (
              <div
                key={item.env}
                className="rounded-lg border border-white/[0.06] bg-[#0b0b0b] p-5"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="font-black">
                      {item.label}
                    </h2>
                    <p className="mt-1 text-xs text-zinc-500">
                      {item.env}
                    </p>
                  </div>

                  <KeyRound
                    className={`h-5 w-5 ${
                      configured
                        ? "text-green-400"
                        : "text-yellow-400"
                    }`}
                  />
                </div>

                <p
                  className={`mt-5 text-sm font-bold ${
                    configured
                      ? "text-green-300"
                      : "text-yellow-300"
                  }`}
                >
                  {configured
                    ? "Configurado"
                    : "Por configurar"}
                </p>

                <p className="mt-3 text-sm leading-6 text-zinc-500">
                  {item.neededFor}
                </p>
              </div>
            )
          })}
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <form
            action={importSportmonksTeamsAction}
            className="rounded-lg border border-white/[0.06] bg-[#0b0b0b] p-5"
          >
            <h2 className="text-xl font-black">
              Importar equipas
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Usa o ID da época no fornecedor para trazer
              equipas reais de uma competição.
            </p>

            <div className="mt-5 grid gap-3">
              <input
                name="seasonId"
                defaultValue={defaultSeasonId}
                placeholder="Season ID Sportmonks"
                className="h-12 rounded-lg border border-white/[0.08] bg-black px-4 text-sm font-bold outline-none focus:border-yellow-400"
              />
              <input
                name="competition"
                defaultValue={defaultCompetition}
                placeholder="Competição, ex: UEFA Women's Champions League"
                className="h-12 rounded-lg border border-white/[0.08] bg-black px-4 text-sm font-bold outline-none focus:border-yellow-400"
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  name="season"
                  defaultValue={defaultSeason}
                  placeholder="Época, ex: 2025"
                  className="h-12 rounded-lg border border-white/[0.08] bg-black px-4 text-sm font-bold outline-none focus:border-yellow-400"
                />
                <input
                  name="region"
                  defaultValue={defaultRegion}
                  placeholder="Região, ex: Europe"
                  className="h-12 rounded-lg border border-white/[0.08] bg-black px-4 text-sm font-bold outline-none focus:border-yellow-400"
                />
              </div>
            </div>

            <button
              className="mt-5 inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-yellow-400 px-5 text-sm font-black text-black disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!readyForImports}
            >
              <Play className="h-4 w-4" />
              Importar equipas
            </button>
          </form>

          <form
            action={importSportmonksSquadAction}
            className="rounded-lg border border-white/[0.06] bg-[#0b0b0b] p-5"
          >
            <h2 className="text-xl font-black">
              Importar jogadoras
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Depois das equipas, importa o plantel de cada
              equipa principal.
            </p>

            <div className="mt-5 grid gap-3">
              <input
                name="teamId"
                placeholder="Team ID Sportmonks"
                className="h-12 rounded-lg border border-white/[0.08] bg-black px-4 text-sm font-bold outline-none focus:border-yellow-400"
              />
              <input
                name="teamName"
                placeholder="Nome igual ao da equipa na app"
                className="h-12 rounded-lg border border-white/[0.08] bg-black px-4 text-sm font-bold outline-none focus:border-yellow-400"
              />
              <input
                name="competition"
                placeholder="Competição, ex: NWSL"
                className="h-12 rounded-lg border border-white/[0.08] bg-black px-4 text-sm font-bold outline-none focus:border-yellow-400"
              />
              <input
                name="season"
                placeholder="Época, ex: 2025"
                className="h-12 rounded-lg border border-white/[0.08] bg-black px-4 text-sm font-bold outline-none focus:border-yellow-400"
              />
            </div>

            <button
              className="mt-5 inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-yellow-400 px-5 text-sm font-black text-black disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!readyForImports}
            >
              <Play className="h-4 w-4" />
              Importar jogadoras
            </button>
          </form>
        </section>

        <section className="mt-6 rounded-lg border border-white/[0.06] bg-[#0b0b0b] p-5">
          <h2 className="text-xl font-black">
            Ordem recomendada
          </h2>

          <ol className="mt-4 grid gap-3 md:grid-cols-5">
            {nextSteps.map((step, index) => (
              <li
                key={step}
                className="rounded-lg border border-white/[0.06] bg-black p-4"
              >
                <p className="text-xs font-black text-yellow-300">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <p className="mt-3 text-sm leading-6 text-zinc-300">
                  {step}
                </p>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </main>
  )
}

