import { ExternalMatch } from "@/lib/providers/matches-provider"
import {
  findTrackedTeamByName,
  getTheSportsDbLeagues,
  HISTORICAL_SEASONS,
  TRACKED_COMPETITIONS,
} from "@/lib/sports-config"

export interface DataQualityIssue {
  severity: "info" | "warning" | "error"
  title: string
  detail: string
}

function normalizeCompetitionName(value: string) {
  return value
    .replaceAll("Womens", "Women's")
    .replace(
      "Women's EHF Champions League",
      "EHF Champions League Women"
    )
    .replace("American NWSL", "NWSL")
}

function normalizeTeamName(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\b(w|women|feminino|feminina)\b/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
}

export function analyseMatchData(
  matches: ExternalMatch[]
) {
  const competitionsChecked =
    getTheSportsDbLeagues()
  const teamNames = new Set<string>()
  const normalizedTeams = new Map<
    string,
    Set<string>
  >()
  const unknownTeams = new Set<string>()
  const competitionsWithMatches =
    new Set<string>()
  const issues: DataQualityIssue[] = []
  const byCompetition = new Map<
    string,
    {
      competition: string
      sport: string
      region: string
      matches: number
      upcoming: number
      finished: number
      live: number
    }
  >()
  const now = Date.now()
  let missingSourceUrl = 0
  let officialWithoutSourceUrl = 0

  for (const match of matches) {
    const competitionName =
      normalizeCompetitionName(
        match.competition
      )

    competitionsWithMatches.add(
      competitionName
    )
    const competitionStats =
      byCompetition.get(competitionName) || {
        competition: competitionName,
        sport: match.sport,
        region: match.region,
        matches: 0,
        upcoming: 0,
        finished: 0,
        live: 0,
      }

    competitionStats.matches += 1
    competitionStats.upcoming +=
      match.status === "SCHEDULED" ? 1 : 0
    competitionStats.finished +=
      match.status === "FINISHED" ? 1 : 0
    competitionStats.live +=
      ["LIVE", "HALFTIME"].includes(
        match.status
      )
        ? 1
        : 0
    byCompetition.set(
      competitionName,
      competitionStats
    )

    for (const teamName of [
      match.home_team,
      match.away_team,
    ]) {
      teamNames.add(teamName)

      const normalizedTeam =
        normalizeTeamName(teamName)
      const variants =
        normalizedTeams.get(normalizedTeam) ||
        new Set<string>()
      variants.add(teamName)
      normalizedTeams.set(
        normalizedTeam,
        variants
      )

      if (!findTrackedTeamByName(teamName)) {
        unknownTeams.add(teamName)
      }
    }

    if (!match.source_url) {
      missingSourceUrl += 1

      if (
        match.source === "QueensArena Official"
      ) {
        officialWithoutSourceUrl += 1
      }
    }

    const startsAtMs = new Date(
      match.starts_at
    ).getTime()

    if (!Number.isFinite(startsAtMs)) {
      issues.push({
        severity: "error",
        title: "Data inválida",
        detail: `${match.home_team} vs ${match.away_team} não tem uma data válida.`,
      })
    }

    if (
      match.status === "SCHEDULED" &&
      startsAtMs < now - 3 * 60 * 60 * 1000
    ) {
      issues.push({
        severity: "warning",
        title: "Jogo antigo marcado como agendado",
        detail: `${match.home_team} vs ${match.away_team} parece já ter começado há demasiado tempo.`,
      })
    }
  }

  const duplicateTeamGroups = [
    ...normalizedTeams.values(),
  ]
    .map((variants) => [...variants].sort())
    .filter((variants) => variants.length > 1)

  if (duplicateTeamGroups.length > 0) {
    issues.push({
      severity: "warning",
      title: "Possíveis equipas duplicadas",
      detail: `${duplicateTeamGroups.length} grupo(s) de equipas têm nomes muito semelhantes e devem ser revistos.`,
    })
  }

  if (officialWithoutSourceUrl > 0) {
    issues.push({
      severity: "warning",
      title: "Dados oficiais sem link de fonte",
      detail: `${officialWithoutSourceUrl} jogo(s) QueensArena Official não têm URL de fonte associada.`,
    })
  } else if (missingSourceUrl > 0) {
    issues.push({
      severity: "info",
      title: "Jogos sem URL de fonte",
      detail: `${missingSourceUrl} jogo(s) ainda não têm URL de fonte associada.`,
    })
  }

  if (unknownTeams.size > 0) {
    issues.push({
      severity: "warning",
      title: "Equipas por mapear",
      detail: `${unknownTeams.size} equipa(s) ainda não têm correspondência no diretório.`,
    })
  }

  const checkedNames =
    competitionsChecked.map(
      (competition) => competition.name
    )
  const emptyCompetitions =
    checkedNames.filter(
      (competition) =>
        !competitionsWithMatches.has(competition)
    )

  if (emptyCompetitions.length > 0) {
    issues.push({
      severity: "info",
      title: "Competições sem eventos",
      detail: `${emptyCompetitions.length} competição(ões) não devolveram eventos nesta consulta.`,
    })
  }

  return {
    checkedAt: new Date().toISOString(),
    matches: matches.length,
    competitionsChecked: checkedNames,
    competitionsWithMatches: [
      ...competitionsWithMatches,
    ],
    teamsSeen: teamNames.size,
    unknownTeams: [...unknownTeams].sort(),
    duplicateTeamGroups,
    missingSourceUrl,
    officialWithoutSourceUrl,
    byCompetition: [...byCompetition.values()].sort(
      (a, b) => b.matches - a.matches
    ),
    trackedButEmpty:
      TRACKED_COMPETITIONS.filter(
        (competition) =>
          !competitionsWithMatches.has(
            normalizeCompetitionName(
              competition.name
            )
          )
      ).map((competition) => ({
        name: competition.name,
        sport: competition.sport,
        region: competition.region,
        sourceLabel: competition.sourceLabel,
      })),
    seasonsTracked: [...HISTORICAL_SEASONS],
    issues,
  }
}
