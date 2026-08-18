export type BroadcastSource = {
  name: string
  url: string
  type: "tv" | "streaming" | "official" | "partner"
  regions: string[]
  sports: string[]
  competitions?: string[]
  notePt: string
  noteEn: string
}

export type MatchBroadcastInfo = {
  channel: string
  url: string
  label: string
  notePt: string
  noteEn: string
  status: "confirmed" | "source-schedule" | "editorial-check"
}

export const BROADCAST_SOURCES: BroadcastSource[] = [
  {
    name: "SPORT TV",
    url: "https://www.sporttv.pt/",
    type: "tv",
    regions: ["Portugal"],
    sports: ["Football", "Futsal", "Handball"],
    notePt:
      "Operador desportivo português. Confirma sempre a grelha oficial antes do jogo.",
    noteEn:
      "Portuguese sports broadcaster. Always confirm the official schedule before the match.",
  },
  {
    name: "Canal 11",
    url: "https://www.canal11.pt/",
    type: "tv",
    regions: ["Portugal"],
    sports: ["Football", "Futsal"],
    competitions: [
      "Liga BPI",
      "Campeonato Nacional Feminino de Futsal",
      "Taça de Portugal Feminina",
      "Liga Feminina Placard",
    ],
    notePt:
      "Canal ligado ao ecossistema FPF. Útil para futebol e futsal português.",
    noteEn:
      "Channel connected to the Portuguese football ecosystem. Useful for Portuguese football and futsal.",
  },
  {
    name: "RTP",
    url: "https://www.rtp.pt/",
    type: "tv",
    regions: ["Portugal"],
    sports: ["Football", "Handball", "Futsal"],
    notePt:
      "Serviço público português. Pode transmitir seleções nacionais e eventos internacionais.",
    noteEn:
      "Portuguese public broadcaster. May show national teams and international events.",
  },
  {
    name: "W-Sport",
    url: "https://www.w-sport.com/pt/",
    type: "partner",
    regions: ["Portugal", "Europa", "Mundo"],
    sports: ["Football", "Handball", "Futsal", "Beach Handball"],
    notePt: "Transmissão desportiva.",
    noteEn: "Sports broadcast.",
  },
  {
    name: "Eurosport",
    url: "https://www.eurosport.fr/",
    type: "tv",
    regions: ["Europa", "Mundo"],
    sports: ["Football", "Handball", "Volleyball"],
    notePt:
      "Referência europeia para cobertura editorial, calendário e eventos internacionais.",
    noteEn:
      "European reference for editorial coverage, calendars and international events.",
  },
  {
    name: "EHF TV",
    url: "https://ehftv.com/",
    type: "streaming",
    regions: ["Europa", "Mundo"],
    sports: ["Handball", "Beach Handball"],
    competitions: [
      "EHF Champions League Women",
      "EHF European League Women",
      "European Women's Handball Championship",
    ],
    notePt:
      "Plataforma oficial EHF. Prioritária para andebol e andebol de praia europeu.",
    noteEn:
      "Official EHF platform. Priority source for European handball and beach handball.",
  },
  {
    name: "FIFA+",
    url: "https://www.plus.fifa.com/",
    type: "streaming",
    regions: ["Mundo"],
    sports: ["Football"],
    competitions: ["Seleções femininas"],
    notePt:
      "Plataforma oficial FIFA para conteúdos e transmissões selecionadas.",
    noteEn:
      "Official FIFA platform for selected content and broadcasts.",
  },
]

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
}

function includesMatch(values: string[], target?: string | null) {
  if (!target) return false

  const normalizedTarget = normalize(target)

  return values.some(
    (value) => normalize(value) === normalizedTarget
  )
}

export function getBroadcastSources({
  sport,
  region,
  competition,
}: {
  sport?: string | null
  region?: string | null
  competition?: string | null
}) {
  return BROADCAST_SOURCES.filter((source) => {
    const sportMatches =
      !sport || includesMatch(source.sports, sport)
    const regionMatches =
      !region ||
      includesMatch(source.regions, region) ||
      includesMatch(source.regions, "Mundo")
    const competitionMatches =
      !competition ||
      !source.competitions ||
      includesMatch(source.competitions, competition)

    return (
      sportMatches && regionMatches && competitionMatches
    )
  })
}

function teamIncludes(team: string, value: string) {
  return normalize(team).includes(normalize(value))
}

function isPortugueseFootballMatch(match: {
  sport?: string | null
  region?: string | null
  competition?: string | null
}) {
  return (
    normalize(match.sport || "") === "football" &&
    (normalize(match.region || "") === "portugal" ||
      normalize(match.competition || "").includes("liga bpi") ||
      normalize(match.competition || "").includes("taca de portugal"))
  )
}

export function getMatchBroadcastInfo(match: {
  sport?: string | null
  region?: string | null
  competition?: string | null
  homeTeam?: string | null
  awayTeam?: string | null
}): MatchBroadcastInfo[] {
  const homeTeam = match.homeTeam || ""
  const awayTeam = match.awayTeam || ""
  const teams = `${homeTeam} ${awayTeam}`
  const entries: MatchBroadcastInfo[] = []

  if (isPortugueseFootballMatch(match)) {
    if (teamIncludes(teams, "Benfica")) {
      entries.push({
        channel: "BTV",
        url: "https://www.slbenfica.pt/pt-pt/btv",
        label: "Benfica TV",
        notePt:
          "Jogo com equipa do Benfica. Confirmar emissão na grelha oficial da BTV.",
        noteEn:
          "Match involving Benfica. Confirm broadcast in the official BTV schedule.",
        status: "editorial-check",
      })
    }

    if (teamIncludes(teams, "Sporting")) {
      entries.push({
        channel: "Sporting TV",
        url: "https://www.sporting.pt/pt/sporting-tv",
        label: "Sporting TV",
        notePt:
          "Jogo com equipa do Sporting. Confirmar emissão na grelha oficial da Sporting TV.",
        noteEn:
          "Match involving Sporting. Confirm broadcast in the official Sporting TV schedule.",
        status: "editorial-check",
      })
    }

    entries.push({
      channel: "Canal 11",
      url: "https://www.canal11.pt/",
      label: "Canal 11",
      notePt:
        "Canal de referência para futebol e futsal português. Confirmar jogo na grelha oficial.",
      noteEn:
        "Reference channel for Portuguese football and futsal. Confirm the match in the official schedule.",
      status: "editorial-check",
    })
  }

  if (
    normalize(match.sport || "") === "handball" &&
    normalize(match.region || "") !== "portugal"
  ) {
    entries.push({
      channel: "EHF TV",
      url: "https://ehftv.com/",
      label: "EHF TV",
      notePt:
        "Plataforma oficial EHF para jogos europeus selecionados. Confirmar disponibilidade por território.",
      noteEn:
        "Official EHF platform for selected European matches. Confirm availability by territory.",
      status: "editorial-check",
    })
  }

  if (entries.length === 0) {
    return getBroadcastSources({
      sport: match.sport,
      region: match.region,
      competition: match.competition,
    })
      .slice(0, 2)
      .map((source) => ({
        channel: source.name,
        url: source.url,
        label: source.name,
        notePt: source.notePt,
        noteEn: source.noteEn,
        status: "editorial-check",
      }))
  }

  return entries
}
