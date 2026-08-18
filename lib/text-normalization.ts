const MOJIBAKE_MARKERS =
  /\uFFFD|ï¿½|Ã[\u0080-\u00bf¡-¿]|Â[\u0080-\u00bf¡-¿]/

const TEXT_REPLACEMENTS: Record<string, string> = {
  "NS\u00cd Runav\u00edk Women":
    "NS\u00cd Runav\u00edk Women",
}

const TEAM_ALIASES: Record<string, string> = {
  "benfica w": "SL Benfica",
  "benfica women": "SL Benfica",
  "sl benfica w": "SL Benfica",
  "sporting w": "Sporting CP",
  "sporting women": "Sporting CP",
  "sporting cp w": "Sporting CP",
  "sporting cp women": "Sporting CP",
  "braga w": "SC Braga",
  "sc braga w": "SC Braga",
  "sc braga women": "SC Braga",
  "maritimo w": "CS Mar\u00edtimo",
  "cs maritimo w": "CS Mar\u00edtimo",
  "cs mar\u00edtimo w": "CS Mar\u00edtimo",
  "damaiense w": "SF Damaiense",
  "sf damaiense w": "SF Damaiense",
  "torreense w": "SCU Torreense",
  "scu torreense w": "SCU Torreense",
  "racing power w": "Racing Power FC",
  "racing power fc w": "Racing Power FC",
  "valadares gaia w": "Valadares Gaia FC",
  "vitoria sc w": "Vit\u00f3ria SC",
  "vit\u00f3ria sc w": "Vit\u00f3ria SC",
  "gyor w": "Gy\u0151ri Audi ETO KC Women",
  "gyori audi eto kc w": "Gy\u0151ri Audi ETO KC Women",
  "gy\u0151ri audi eto kc w": "Gy\u0151ri Audi ETO KC Women",
  "csm bucuresti w": "CSM Bucure\u0219ti Women",
  "csm bucure\u0219ti w": "CSM Bucure\u0219ti Women",
  "kristiansand w": "Vipers Kristiansand Women",
  "esbjerg w": "Team Esbjerg Women",
  "brest bretagne w": "Brest Bretagne Handball Women",
}

const COMPETITION_ALIASES: Record<string, string> = {
  "american nwsl": "NWSL",
  "nwsl women": "NWSL",
  "uefa champions league women":
    "UEFA Women's Champions League",
  "uefa womens champions league":
    "UEFA Women's Champions League",
  "womens champions league":
    "UEFA Women's Champions League",
  "ehf champions league women":
    "EHF Champions League Women",
  "champions league women":
    "EHF Champions League Women",
  "women s ehf champions league":
    "EHF Champions League Women",
  "womens ehf champions league":
    "EHF Champions League Women",
  "uefa womens euro": "UEFA Women's EURO",
  "uefa women s euro": "UEFA Women's EURO",
  "world womens handball championship":
    "World Women's Handball Championship",
  "world women s handball championship":
    "World Women's Handball Championship",
  "world championship women":
    "World Women's Handball Championship",
  "european womens handball championship":
    "European Women's Handball Championship",
  "european women s handball championship":
    "European Women's Handball Championship",
  "european championship women":
    "European Women's Handball Championship",
}

const SPORT_COMPETITION_ALIASES: Record<
  string,
  string
> = {
  "football:1a divisao women": "Liga BPI",
  "football:1 divisao women": "Liga BPI",
  "football:1 divisao feminina": "Liga BPI",
  "football:1 liga feminina": "Liga BPI",
  "football:liga feminina": "Liga BPI",
  "football:campeonato nacional": "Liga BPI",
  "football:campeonato nacional feminino": "Liga BPI",
  "football:liga bpi": "Liga BPI",
  "handball:1a divisao women": "Campeonato Nacional 1.ª Divisão Feminina de Andebol",
  "handball:1 divisao women": "Campeonato Nacional 1.ª Divisão Feminina de Andebol",
  "handball:1 divisao feminina": "Campeonato Nacional 1.ª Divisão Feminina de Andebol",
  "handball:1 liga feminina": "Campeonato Nacional 1.ª Divisão Feminina de Andebol",
  "handball:liga feminina": "Campeonato Nacional 1.ª Divisão Feminina de Andebol",
  "handball:campeonato nacional": "Campeonato Nacional 1.ª Divisão Feminina de Andebol",
  "handball:campeonato nacional feminino": "Campeonato Nacional 1.ª Divisão Feminina de Andebol",
  "handball:campeonato nacional 1 divisao feminina de andebol": "Campeonato Nacional 1.ª Divisão Feminina de Andebol",
  "handball:serie a women": "Serie A Women Handball",
  "futsal:1 divisao feminina": "Campeonato Nacional Feminino de Futsal",
  "futsal:1 liga feminina": "Campeonato Nacional Feminino de Futsal",
  "futsal:liga feminina": "Campeonato Nacional Feminino de Futsal",
  "futsal:liga feminina de futsal": "Campeonato Nacional Feminino de Futsal",
  "futsal:liga feminina placard": "Campeonato Nacional Feminino de Futsal",
  "futsal:liga feminina placard 2 fase 3 elim": "Campeonato Nacional Feminino de Futsal",
  "futsal:campeonato nacional": "Campeonato Nacional Feminino de Futsal",
  "futsal:campeonato nacional feminino": "Campeonato Nacional Feminino de Futsal",
  "futsal:campeonato nacional futsal feminino": "Campeonato Nacional Feminino de Futsal",
  "futsal:campeonato nacional feminino futsal": "Campeonato Nacional Feminino de Futsal",
}

export function normalizeDisplayText(
  value: string | null | undefined
) {
  if (!value) return value || ""

  const decoded = MOJIBAKE_MARKERS.test(value)
    ? Buffer.from(value, "latin1").toString("utf8")
    : value

  return Object.entries(TEXT_REPLACEMENTS).reduce(
    (text, [from, to]) => text.replaceAll(from, to),
    decoded
  )
}

export function normalizeTeamNameKey(value: string) {
  return normalizeDisplayText(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\b(feminino|feminina)\b/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
}

export function normalizeCompetitionNameKey(
  value: string
) {
  return normalizeDisplayText(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
}

export function canonicalTeamName(
  value: string | null | undefined
) {
  const text = normalizeDisplayText(value)
  if (!text) return text

  const key = normalizeTeamNameKey(text)

  return TEAM_ALIASES[key] || text
}

export function canonicalCompetitionName(
  value: string | null | undefined,
  sport?: string | null
) {
  const text = normalizeDisplayText(value)
  if (!text) return text

  const key = normalizeCompetitionNameKey(text)
  const sportKey = sport
    ? `${sport.toLowerCase()}:${key}`
    : ""

  return (
    SPORT_COMPETITION_ALIASES[sportKey] ||
    COMPETITION_ALIASES[key] ||
    text
  )
}

export function competitionAliasesForFilter(
  value: string | null | undefined,
  sport?: string | null
) {
  const text = normalizeDisplayText(value)
  if (!text) return []

  const canonical = canonicalCompetitionName(text, sport)
  const aliases = new Set<string>([text, canonical])

  if (canonical === "Liga BPI") {
    aliases.add("1a Divisão - Women")
    aliases.add("1a Divisao - Women")
    aliases.add("1a Divis\u00c3\u00a3o - Women")
    aliases.add("1ª Liga Feminina")
    aliases.add("Campeonato Nacional")
  }

  if (
    canonical ===
    "Campeonato Nacional 1.ª Divisão Feminina de Andebol"
  ) {
    aliases.add("1a Divisao Women")
    aliases.add("1a Divisão Women")
    aliases.add("1a Divis\u00c3\u00a3o Women")
    aliases.add("1ª Liga Feminina")
    aliases.add("Campeonato Nacional")
  }

  if (
    canonical === "Campeonato Nacional Feminino de Futsal"
  ) {
    aliases.add("1ª Liga Feminina")
    aliases.add("Liga Feminina de Futsal")
    aliases.add("Liga Feminina Placard")
    aliases.add("Liga Feminina Placard -")
    aliases.add("Campeonato Nacional")
    aliases.add("Campeonato Nacional Feminino")
  }

  if (
    canonical === "UEFA Women's Champions League"
  ) {
    aliases.add("UEFA Champions League Women")
    aliases.add("Women's Champions League")
  }

  if (canonical === "EHF Champions League Women") {
    aliases.add("Women's EHF Champions League")
  }

  if (canonical === "NWSL") {
    aliases.add("American NWSL")
    aliases.add("NWSL Women")
  }

  return [...aliases]
}

export function canonicalLeagueName(
  value: string | null | undefined,
  sport?: string | null
) {
  const text = normalizeDisplayText(value)
  if (!text) return text

  const match = text.match(/^(.*)\s+(\d{4}(?:-\d{4})?)$/)
  if (!match) {
    return canonicalCompetitionName(text, sport)
  }

  return `${canonicalCompetitionName(
    match[1],
    sport
  )} ${match[2]}`
}

export function leagueAliasesForFilter(
  value: string | null | undefined,
  sport?: string | null
) {
  const text = normalizeDisplayText(value)
  if (!text) return []

  const match = text.match(/^(.*)\s+(\d{4}(?:-\d{4})?)$/)
  if (!match) return competitionAliasesForFilter(text, sport)

  return competitionAliasesForFilter(
    match[1],
    sport
  ).map((competition) => `${competition} ${match[2]}`)
}

export function inferCountryFromTeam(
  teamName: string,
  sport?: string | null
) {
  const name = normalizeDisplayText(teamName)

  if (
    sport === "Handball" &&
    [
      "Brest Bretagne Handball Women",
      "France Handball Women",
    ].includes(name)
  ) {
    return "France"
  }

  if (
    sport === "Handball" &&
    name === "Gy\u0151ri Audi ETO KC Women"
  ) {
    return "Hungary"
  }

  if (
    sport === "Handball" &&
    name === "CSM Bucure\u0219ti Women"
  ) {
    return "Romania"
  }

  if (
    sport === "Handball" &&
    [
      "Team Esbjerg Women",
      "Denmark Handball Women",
    ].includes(name)
  ) {
    return "Denmark"
  }

  if (
    sport === "Handball" &&
    name === "Germany Handball Women"
  ) {
    return "Germany"
  }

  if (
    sport === "Handball" &&
    name === "Norway Handball Women"
  ) {
    return "Norway"
  }

  if (
    [
      "SL Benfica",
      "Sporting CP",
      "SC Braga",
      "SCU Torreense",
      "Racing Power FC",
      "SF Damaiense",
      "Valadares Gaia FC",
      "CS Mar\u00edtimo",
      "Rio Ave FC",
      "Vit\u00f3ria SC",
      "Sporting CP Women",
    ].includes(name)
  ) {
    return "Portugal"
  }

  if (
    [
      "Angel City FC",
      "Bay FC",
      "Boston Legacy FC",
      "Chicago Stars FC",
      "Denver Summit FC",
      "Gotham FC",
      "Houston Dash",
      "Kansas City Current",
      "North Carolina Courage",
      "Orlando Pride",
      "Portland Thorns FC",
      "Racing Louisville FC",
      "San Diego Wave FC",
      "Seattle Reign FC",
      "Utah Royals FC",
      "Washington Spirit",
    ].includes(name)
  ) {
    return "United States"
  }

  if (
    [
      "Arsenal Women",
      "Chelsea Women",
      "Manchester United Women",
    ].includes(name)
  ) {
    return "England"
  }

  if (
    [
      "Barcelona Femen\u00ed",
      "Real Madrid Femenino",
    ].includes(name)
  ) {
    return "Spain"
  }

  if (
    [
      "Bayern Munich Women",
      "VfL Wolfsburg Women",
    ].includes(name)
  ) {
    return "Germany"
  }

  if (
    ["Juventus Women", "Roma Women"].includes(name)
  ) {
    return "Italy"
  }

  if (
    [
      "OL Lyonnes",
      "Paris Saint-Germain Women",
    ].includes(name)
  ) {
    return "France"
  }

  return null
}

