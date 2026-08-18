import { analyseMatchData } from "@/lib/data-quality"
import {
  fetchQueensArenaCompetitions,
  fetchQueensArenaMatches,
  fetchQueensArenaTeams,
} from "@/lib/queensarena-data"
import { getSetupStatus } from "@/lib/setup-status"

export interface LaunchCheck {
  title: string
  status: string
  ready: boolean
  text: string
}

export async function getLaunchReadiness() {
  const [setup, matches, teams, competitions] =
    await Promise.all([
      getSetupStatus(),
      fetchQueensArenaMatches({
        limit: 15000,
      }),
      fetchQueensArenaTeams({
        limit: 3000,
      }),
      fetchQueensArenaCompetitions(),
    ])

  const report = analyseMatchData(matches)
  const teamsWithMatchData = new Set(
    matches.flatMap((match) => [
      `${match.sport}:${match.home_team}`,
      `${match.sport}:${match.away_team}`,
    ])
  ).size
  const hasPortugalData = matches.some(
    (match) =>
      match.region === "Portugal" &&
      ["Football", "Futsal", "Handball"].includes(
        match.sport
      )
  )
  const coreCoverageReady =
    report.matches >= 500 &&
    report.competitionsWithMatches.length >= 10
  const teamDataReady = teamsWithMatchData >= 20
  const setupReady = setup.ready
  const legalBaseReady = true
  const sourceCatalogReady = competitions.length >= 20

  const checks: LaunchCheck[] = [
    {
      title: "Setup técnico",
      status: setupReady ? "Pronto" : "A rever",
      ready: setupReady,
      text: setupReady
        ? "Supabase, service role, cron e tabelas principais estão configurados."
        : "Há variáveis obrigatórias ou tabelas em falta no setup técnico.",
    },
    {
      title: "Cobertura real inicial",
      status: coreCoverageReady
        ? "Beta pronto"
        : "Insuficiente",
      ready: coreCoverageReady,
      text: `${report.matches} jogos reais em ${report.competitionsWithMatches.length} competições com dados.`,
    },
    {
      title: "Equipas com contexto",
      status: teamDataReady
        ? "Beta pronto"
        : "A melhorar",
      ready: teamDataReady,
      text: `${teamsWithMatchData} equipas já têm contexto derivado de jogos reais.`,
    },
    {
      title: "Dados portugueses",
      status: hasPortugalData
        ? "Cobertura inicial"
        : "Importação própria necessária",
      ready: hasPortugalData,
      text: hasPortugalData
        ? "Já existem dados portugueses ligados à base QueensArena; FPF/FAP continuam prioritários para cobertura oficial."
        : "Liga BPI, futsal e andebol português precisam de fonte oficial, feed autorizado ou importação própria.",
    },
    {
      title: "Base legal",
      status: "Base pronta",
      ready: legalBaseReady,
      text: "Privacidade, termos, cookies, contacto, fontes e eliminação de conta existem para submissão beta.",
    },
    {
      title: "Catálogo de fontes",
      status: sourceCatalogReady
        ? "Pronto"
        : "A reforçar",
      ready: sourceCatalogReady,
      text: `${competitions.length} fontes/competições estão registadas para auditoria e expansão de dados.`,
    },
    {
      title: "Publicidade automática",
      status: "A aguardar aprovação",
      ready: false,
      text: "AdSense/AdMob só deve entrar em produção depois de aprovação, consentimento e validação final da loja.",
    },
  ]

  const readyCount = checks.filter(
    (check) => check.ready
  ).length
  const betaReady =
    setupReady && coreCoverageReady && teamDataReady
  const monetizationReady =
    betaReady && hasPortugalData

  return {
    checkedAt: new Date().toISOString(),
    checks,
    readyCount,
    totalChecks: checks.length,
    betaReady,
    monetizationReady,
    setup,
    report,
    teamsTotal: teams.length,
    teamsWithMatchData,
    sourceCatalogTotal: competitions.length,
  }
}
