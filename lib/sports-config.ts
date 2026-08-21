export const SPORTS = [
  {
    key: "football",
    name: "Football",
    labelPt: "Futebol",
  },
  {
    key: "handball",
    name: "Handball",
    labelPt: "Andebol",
  },
  {
    key: "futsal",
    name: "Futsal",
    labelPt: "Futsal",
  },
  {
    key: "beach-handball",
    name: "Beach Handball",
    labelPt: "Andebol de praia",
  },
  {
    key: "volleyball",
    name: "Volleyball",
    labelPt: "Voleibol",
  },
  {
    key: "beach-volleyball",
    name: "Beach Volleyball",
    labelPt: "Voleibol de praia",
  },
] as const

export type SportKey = (typeof SPORTS)[number]["key"]

export const HISTORICAL_SEASONS = [
  "2026",
  "2025",
  "2024",
  "2023",
  "2022",
  "2021",
  "2020",
] as const

export type DataSourceStatus =
  | "live-api"
  | "provider-ready"
  | "manual-watchlist"
  | "pending"

export const TRACKED_COMPETITIONS = [
  {
    key: "cev-eurovolley-2026-feminino",
    name: "CEV Trendyol EuroVolley 2026 Feminino",
    sport: "Volleyball",
    region: "Europa",
    source: "manual",
    sourceStatus: "manual-watchlist",
    sourceLabel: "CEV",
    sourceUrl:
      "https://eurovolley.cev.eu/en/2026/women/",
    note:
      "24 seleções e 76 jogos, de 21 de agosto a 6 de setembro de 2026. O calendário deve ser importado e validado a partir da CEV.",
  },
  {
    key: "liga-solverde-feminina",
    name: "Liga Solverde.pt Feminina",
    sport: "Volleyball",
    region: "Portugal",
    source: "manual",
    sourceStatus: "live-api",
    sourceLabel: "Federação Portuguesa de Voleibol",
    sourceUrl:
      "https://www.portugalvoleibol.com/classificacao/index",
    note:
      "Competição feminina portuguesa importada a partir da fonte oficial da Federação Portuguesa de Voleibol.",
  },
  {
    key: "taca-portugal-voleibol-feminina",
    name: "Taça de Portugal Feminina de Voleibol",
    sport: "Volleyball",
    region: "Portugal",
    source: "manual",
    sourceStatus: "live-api",
    sourceLabel: "Federação Portuguesa de Voleibol",
    sourceUrl:
      "https://www.portugalvoleibol.com/classificacao/tpf.php",
    note:
      "Prova feminina portuguesa autorizada para integração a partir da fonte oficial FPV.",
  },
  {
    key: "segunda-divisao-voleibol-feminina",
    name: "Campeonato Nacional 2.ª Divisão Feminina de Voleibol",
    sport: "Volleyball",
    region: "Portugal",
    source: "manual",
    sourceStatus: "live-api",
    sourceLabel: "Federação Portuguesa de Voleibol",
    sourceUrl:
      "https://www.portugalvoleibol.com/classificacao/index",
    note:
      "Competição feminina portuguesa importada a partir da fonte oficial da Federação Portuguesa de Voleibol.",
  },
  {
    key: "supertaca-voleibol-feminina",
    name: "Supertaça Feminina de Voleibol",
    sport: "Volleyball",
    region: "Portugal",
    source: "manual",
    sourceStatus: "manual-watchlist",
    sourceLabel: "Federação Portuguesa de Voleibol",
    sourceUrl:
      "https://www.portugalvoleibol.com/classificacao/stfem.php",
    note:
      "Prova feminina portuguesa autorizada para integração a partir da fonte oficial FPV.",
  },
  {
    key: "voleibol-praia-clubes-feminino",
    name: "Campeonato Nacional de Clubes de Voleibol de Praia Feminino",
    sport: "Beach Volleyball",
    region: "Portugal",
    source: "manual",
    sourceStatus: "manual-watchlist",
    sourceLabel: "Federação Portuguesa de Voleibol",
    sourceUrl:
      "https://www.portugalvoleibol.com/classificacao/vpf.php",
    note:
      "Competição feminina de voleibol de praia importada a partir da fonte oficial FPV.",
  },
  {
    key: "liga-bpi",
    name: "Liga BPI",
    sport: "Football",
    region: "Portugal",
    source: "manual",
    sourceStatus: "live-api",
    sourceLabel: "FPF",
    sourceUrl: "https://www.fpf.pt/",
    note:
      "Competição portuguesa com cobertura acompanhada para importação oficial ou editorial.",
  },
  {
    key: "taça-portugal-feminina",
    name: "Taça de Portugal Feminina",
    sport: "Football",
    region: "Portugal",
    source: "manual",
    sourceStatus: "manual-watchlist",
    sourceLabel: "FPF",
    sourceUrl: "https://www.fpf.pt/",
    note:
      "Prova portuguesa com cobertura acompanhada para calendário, resultados e equipas.",
  },
  {
    key: "supertaça-feminina",
    name: "Supertaça Feminina",
    sport: "Football",
    region: "Portugal",
    source: "manual",
    sourceStatus: "manual-watchlist",
    sourceLabel: "FPF",
    sourceUrl: "https://www.fpf.pt/",
    note:
      "Prova portuguesa com cobertura acompanhada para importação quando a fonte estiver ligada.",
  },
  {
    key: "uefa-womens-euro",
    name: "UEFA Women's EURO",
    sport: "Football",
    region: "Europa",
    source: "manual",
    sourceStatus: "provider-ready",
    sourceLabel: "UEFA",
    sourceUrl: "https://www.uefa.com/womenseuro/",
    note:
      "Competição de seleções com integração planeada via fornecedor.",
  },
  {
    key: "uefa-womens-champions-league",
    name: "UEFA Women's Champions League",
    sport: "Football",
    region: "Europa",
    source: "thesportsdb",
    sourceStatus: "live-api",
    sourceLabel: "TheSportsDB / UEFA",
    sourceUrl:
      "https://www.uefa.com/womenschampionsleague/",
    theSportsDbLeagueId: 4889,
    note:
      "Jogos carregados automaticamente quando disponíveis na API.",
  },
  {
    key: "womens-national-teams",
    name: "Seleções femininas",
    sport: "Football",
    region: "Mundo",
    source: "manual",
    sourceStatus: "manual-watchlist",
    sourceLabel: "FIFA / UEFA / Federações",
    sourceUrl:
      "https://www.fifa.com/en/tournaments/womens/womensworldcup",
    note:
      "Área para jogos, calendários e rankings de seleções femininas.",
  },
  {
    key: "american-nwsl",
    name: "NWSL",
    sport: "Football",
    region: "EUA",
    source: "thesportsdb",
    sourceStatus: "live-api",
    sourceLabel: "TheSportsDB / NWSL",
    sourceUrl: "https://www.nwslsoccer.com/",
    theSportsDbLeagueId: 4521,
    note:
      "Liga profissional norte-americana com feed automático quando disponível.",
  },
  {
    key: "france-feminine-division-1",
    name: "Feminine Division 1",
    sport: "Football",
    region: "França",
    source: "api-sports",
    sourceStatus: "live-api",
    sourceLabel: "API-SPORTS",
    sourceUrl: "https://www.fff.fr/",
    note:
      "Liga francesa feminina com jogos históricos importados para acompanhamento e estatísticas.",
  },
  {
    key: "italy-serie-a-women",
    name: "Serie A Women",
    sport: "Football",
    region: "Itália",
    source: "api-sports",
    sourceStatus: "live-api",
    sourceLabel: "API-SPORTS",
    sourceUrl: "https://www.figc.it/",
    note:
      "Liga italiana feminina com resultados importados e estatísticas derivadas.",
  },
  {
    key: "netherlands-eredivisie-women",
    name: "Eredivisie Women",
    sport: "Football",
    region: "Países Baixos",
    source: "api-sports",
    sourceStatus: "live-api",
    sourceLabel: "API-SPORTS",
    sourceUrl: "https://www.onsoranje.nl/",
    note:
      "Liga neerlandesa feminina com cobertura histórica disponível na QueensArena.",
  },
  {
    key: "brasil-brasileiro-women",
    name: "Brasileiro Women",
    sport: "Football",
    region: "Brasil",
    source: "api-sports",
    sourceStatus: "live-api",
    sourceLabel: "API-SPORTS",
    sourceUrl: "https://www.cbf.com.br/",
    note:
      "Competição brasileira feminina com resultados importados para ampliar a cobertura internacional.",
  },
  {
    key: "australia-a-league-women",
    name: "A-League Women",
    sport: "Football",
    region: "Austrália",
    source: "api-sports",
    sourceStatus: "live-api",
    sourceLabel: "API-SPORTS",
    sourceUrl: "https://aleagues.com.au/",
    note:
      "Liga australiana feminina com jogos importados para calendário e resultados.",
  },
  {
    key: "liga-portuguesa-andebol-feminino",
    name: "Campeonato Nacional 1.ª Divisão Feminina de Andebol",
    sport: "Handball",
    region: "Portugal",
    source: "manual",
    sourceStatus: "live-api",
    sourceLabel: "FAP",
    sourceUrl: "https://portal.fpa.pt/",
    note:
      "Liga portuguesa de andebol feminino com cobertura acompanhada para calendário, resultados e classificação.",
  },
  {
    key: "taça-portugal-andebol-feminina",
    name: "Taça de Portugal Feminina de Andebol",
    sport: "Handball",
    region: "Portugal",
    source: "manual",
    sourceStatus: "live-api",
    sourceLabel: "FAP",
    sourceUrl: "https://portal.fpa.pt/",
    note:
      "Taça nacional de andebol feminino com cobertura acompanhada para importação de jogos.",
  },
  {
    key: "supertaça-andebol-feminina",
    name: "Supertaça Feminina de Andebol",
    sport: "Handball",
    region: "Portugal",
    source: "manual",
    sourceStatus: "live-api",
    sourceLabel: "FAP",
    sourceUrl: "https://portal.fpa.pt/",
    note:
      "Prova portuguesa de andebol com cobertura editorial ou oficial acompanhada.",
  },
  {
    key: "divisão-honra-andebol-feminina",
    name: "Divisão de Honra Feminina de Andebol",
    sport: "Handball",
    region: "Portugal",
    source: "manual",
    sourceStatus: "live-api",
    sourceLabel: "FAP",
    sourceUrl: "https://portal.fpa.pt/",
    note:
      "Competição portuguesa com cobertura futura em avaliação.",
  },
  {
    key: "segunda-divisão-andebol-feminina",
    name: "Campeonato Nacional 2.ª Divisão Feminina de Andebol",
    sport: "Handball",
    region: "Portugal",
    source: "manual",
    sourceStatus: "manual-watchlist",
    sourceLabel: "FAP",
    sourceUrl: "https://portal.fpa.pt/",
    note:
      "Competição portuguesa em avaliação para fonte fiável.",
  },
  {
    key: "womens-ehf-champions-league",
    name: "EHF Champions League Women",
    sport: "Handball",
    region: "Europa",
    source: "thesportsdb",
    sourceStatus: "live-api",
    sourceLabel: "TheSportsDB / EHF",
    sourceUrl: "https://ehfcl.eurohandball.com/women/",
    theSportsDbLeagueId: 5274,
    note:
      "Competição europeia de andebol feminino com feed automático quando disponível.",
  },
  {
    key: "womens-ehf-european-league",
    name: "EHF European League Women",
    sport: "Handball",
    region: "Europa",
    source: "api-sports",
    sourceStatus: "live-api",
    sourceLabel: "API-SPORTS / EHF",
    sourceUrl: "https://www.eurohandball.com/",
    note:
      "Competição europeia de clubes com resultados importados e estatísticas derivadas.",
  },
  {
    key: "womens-ehf-european-cup",
    name: "European Cup Women",
    sport: "Handball",
    region: "Europa",
    source: "api-sports",
    sourceStatus: "live-api",
    sourceLabel: "API-SPORTS / EHF",
    sourceUrl: "https://www.eurohandball.com/",
    note:
      "Competição europeia de clubes com histórico disponível na base QueensArena.",
  },
  {
    key: "germany-handball-bundesliga-women",
    name: "1. Bundesliga Women",
    sport: "Handball",
    region: "Alemanha",
    source: "api-sports",
    sourceStatus: "live-api",
    sourceLabel: "API-SPORTS",
    sourceUrl: "https://www.handball-bundesliga-frauen.de/",
    note:
      "Liga alemã feminina com resultados importados para acompanhamento estatístico.",
  },
  {
    key: "france-handball-division-1-women",
    name: "Division 1 Women",
    sport: "Handball",
    region: "França",
    source: "api-sports",
    sourceStatus: "live-api",
    sourceLabel: "API-SPORTS",
    sourceUrl: "https://ligue-feminine-handball.fr/",
    note:
      "Liga francesa de andebol feminino com cobertura histórica importada.",
  },
  {
    key: "spain-handball-division-honor-women",
    name: "Division de Honor Women",
    sport: "Handball",
    region: "Espanha",
    source: "api-sports",
    sourceStatus: "live-api",
    sourceLabel: "API-SPORTS",
    sourceUrl: "https://www.rfebm.com/",
    note:
      "Liga espanhola de andebol feminino com resultados importados.",
  },
  {
    key: "denmark-handball-kvindeligaen",
    name: "Bambusa Kvindeligaen Women",
    sport: "Handball",
    region: "Dinamarca",
    source: "api-sports",
    sourceStatus: "live-api",
    sourceLabel: "API-SPORTS",
    sourceUrl: "https://tophaandbold.dk/",
    note:
      "Liga dinamarquesa feminina com dados históricos disponíveis.",
  },
  {
    key: "norway-handball-rema-1000",
    name: "REMA 1000-ligaen women",
    sport: "Handball",
    region: "Noruega",
    source: "api-sports",
    sourceStatus: "live-api",
    sourceLabel: "API-SPORTS",
    sourceUrl: "https://www.handball.no/",
    note:
      "Liga norueguesa feminina com resultados importados para estatísticas.",
  },
  {
    key: "hungary-handball-nb-i-women",
    name: "NB I Women",
    sport: "Handball",
    region: "Hungria",
    source: "api-sports",
    sourceStatus: "live-api",
    sourceLabel: "API-SPORTS",
    sourceUrl: "https://www.mksz.hu/",
    note:
      "Liga húngara feminina com cobertura histórica importada.",
  },
  {
    key: "romania-handball-liga-nationala-women",
    name: "Liga Nationala Women",
    sport: "Handball",
    region: "Roménia",
    source: "api-sports",
    sourceStatus: "live-api",
    sourceLabel: "API-SPORTS",
    sourceUrl: "https://frh.ro/",
    note:
      "Liga romena feminina com dados importados para resultados e classificação.",
  },
  {
    key: "turkey-handball-superlig-women",
    name: "Superlig Women",
    sport: "Handball",
    region: "Turquia",
    source: "api-sports",
    sourceStatus: "live-api",
    sourceLabel: "API-SPORTS",
    sourceUrl: "https://www.thf.org.tr/",
    note:
      "Liga turca feminina com cobertura histórica disponível.",
  },
  {
    key: "italy-handball-serie-a-women",
    name: "Serie A Women Handball",
    sport: "Handball",
    region: "Itália",
    source: "api-sports",
    sourceStatus: "live-api",
    sourceLabel: "API-SPORTS",
    sourceUrl: "https://www.figh.it/",
    note:
      "Liga italiana de andebol feminino com resultados importados.",
  },
  {
    key: "world-womens-handball-championship",
    name: "World Women's Handball Championship",
    sport: "Handball",
    region: "Mundo",
    source: "thesportsdb",
    sourceStatus: "live-api",
    sourceLabel: "TheSportsDB / IHF",
    sourceUrl: "https://www.ihf.info/",
    theSportsDbLeagueId: 4896,
    note:
      "Competição internacional de seleções com feed automático quando disponível.",
  },
  {
    key: "european-womens-handball-championship",
    name: "European Women's Handball Championship",
    sport: "Handball",
    region: "Europa",
    source: "thesportsdb",
    sourceStatus: "live-api",
    sourceLabel: "TheSportsDB / EHF",
    sourceUrl: "https://www.eurohandball.com/",
    theSportsDbLeagueId: 4893,
    note:
      "Competição europeia de seleções com feed automático quando disponível.",
  },
  {
    key: "campeonato-nacional-futsal-feminino",
    name: "Campeonato Nacional Feminino de Futsal",
    sport: "Futsal",
    region: "Portugal",
    source: "manual",
    sourceStatus: "manual-watchlist",
    sourceLabel: "FPF",
    sourceUrl: "https://www.fpf.pt/",
    note:
      "Competição portuguesa de futsal feminino com cobertura própria acompanhada.",
  },
  {
    key: "taça-portugal-futsal-feminina",
    name: "Taça de Portugal Feminina de Futsal",
    sport: "Futsal",
    region: "Portugal",
    source: "manual",
    sourceStatus: "manual-watchlist",
    sourceLabel: "FPF",
    sourceUrl: "https://www.fpf.pt/",
    note:
      "Taça portuguesa de futsal feminino com cobertura acompanhada para importação.",
  },
  {
    key: "supertaça-futsal-feminina",
    name: "Supertaça Feminina de Futsal",
    sport: "Futsal",
    region: "Portugal",
    source: "manual",
    sourceStatus: "manual-watchlist",
    sourceLabel: "FPF",
    sourceUrl: "https://www.fpf.pt/",
    note:
      "Prova portuguesa de futsal feminino com cobertura acompanhada para importação.",
  },
  {
    key: "uefa-womens-futsal-euro",
    name: "UEFA Women's Futsal EURO",
    sport: "Futsal",
    region: "Europa",
    source: "manual",
    sourceStatus: "provider-ready",
    sourceLabel: "UEFA",
    sourceUrl:
      "https://www.uefa.com/womensfutsaleuro/",
    note:
      "Competição europeia de seleções com integração planeada via fornecedor.",
  },
  {
    key: "andebol-praia-feminino-portugal",
    name: "Portugal Beach Handball Tour Sénior Feminino",
    sport: "Beach Handball",
    region: "Portugal",
    source: "manual",
    sourceStatus: "live-api",
    sourceLabel: "FAP",
    sourceUrl: "https://portal.fpa.pt/",
    note:
      "Circuito sénior feminino de andebol de praia importado a partir da fonte oficial FAP.",
  },
  {
    key: "circuito-regional-andebol-praia-senior-feminino",
    name: "Circuito Regional de Andebol de Praia Sénior Feminino",
    sport: "Beach Handball",
    region: "Portugal",
    source: "manual",
    sourceStatus: "live-api",
    sourceLabel: "FAP",
    sourceUrl: "https://portal.fpa.pt/",
    note:
      "Etapas séniores femininas de andebol de praia importadas a partir da fonte oficial FAP.",
  },
  {
    key: "seleções-andebol-praia-feminino",
    name: "Seleções femininas de Andebol de Praia",
    sport: "Beach Handball",
    region: "Mundo",
    source: "manual",
    sourceStatus: "manual-watchlist",
    sourceLabel: "IHF / EHF / FAP",
    sourceUrl: "https://www.ihf.info/",
    note:
      "Área para competições internacionais e seleções de andebol de praia feminino.",
  },
] as const

export const WOMENS_FOOTBALL_COMPETITIONS =
  TRACKED_COMPETITIONS.filter(
    (competition) =>
      competition.sport === "Football"
  )

export const PORTUGUESE_WOMENS_FOOTBALL_TEAMS =
  [
    "SL Benfica",
    "Sporting CP",
    "SC Braga",
    "SCU Torreense",
    "Racing Power FC",
    "SF Damaiense",
    "Valadares Gaia FC",
    "CS Maritimo",
    "Rio Ave FC",
    "Vitoria SC",
  ] as const

export const US_WOMENS_FOOTBALL_TEAMS =
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
  ] as const

export const EUROPEAN_WOMENS_FOOTBALL_TEAMS =
  [
    "Arsenal Women",
    "Barcelona Femeni",
    "Bayern Munich Women",
    "Chelsea Women",
    "Juventus Women",
    "Manchester United Women",
    "OL Lyonnes",
    "Paris Saint-Germain Women",
    "Real Madrid Femenino",
    "Roma Women",
    "Sporting CP Women",
    "VfL Wolfsburg Women",
  ] as const

export const PORTUGUESE_WOMENS_HANDBALL_TEAMS =
  [
    "SL Benfica Handball Women",
    "Madeira SAD Women",
    "Colegio de Gaia Women",
    "Alavarium Love Tiles Women",
    "ABC Women",
    "Maiastars Women",
    "CA Leca Women",
  ] as const

export const EUROPEAN_WOMENS_HANDBALL_TEAMS =
  [
    "Brest Bretagne Handball Women",
    "Gyori Audi ETO KC Women",
    "CSM Bucuresti Women",
    "Team Esbjerg Women",
    "France Handball Women",
    "Germany Handball Women",
    "Norway Handball Women",
    "Denmark Handball Women",
  ] as const

export const WOMENS_NATIONAL_TEAMS =
  [
    "Portugal Women",
    "Spain Women",
    "England Women",
    "France Women",
    "Germany Women",
    "Netherlands Women",
    "Sweden Women",
    "United States Women",
    "Brazil Women",
    "Japan Women",
  ] as const

export const WOMENS_FUTSAL_TEAMS =
  [
    "Portugal Futsal Women",
    "Spain Futsal Women",
    "SL Benfica Futsal Women",
    "Sporting CP Futsal Women",
    "Nun'Alvares Futsal Women",
    "Novasemente Futsal Women",
    "Santa Luzia FC Futsal Women",
    "Golpilheira Futsal Women",
  ] as const

export const WOMENS_BEACH_HANDBALL_TEAMS =
  [
    "Portugal Beach Handball Women",
    "Spain Beach Handball Women",
    "Germany Beach Handball Women",
    "Netherlands Beach Handball Women",
    "Brazil Beach Handball Women",
    "Denmark Beach Handball Women",
  ] as const

const TEAM_ALIASES: Record<string, string> = {
  "Angel City": "Angel City FC",
  "Denver Summit": "Denver Summit FC",
  "Portland Thorns": "Portland Thorns FC",
  "Racing Louisville": "Racing Louisville FC",
  "San Diego Wave": "San Diego Wave FC",
  "Seattle Reign": "Seattle Reign FC",
  "Utah Royals": "Utah Royals FC",
  "NJ/NY Gotham FC": "Gotham FC",
  "Barcelona Femenino": "Barcelona Femeni",
  "Barcelona Femeni": "Barcelona Femeni",
  "Gyori Audi ETO KC Women":
    "Gyori Audi ETO KC Women",
  "CSM Bucuresti Women": "CSM Bucuresti Women",
  "Benfica Futsal Women":
    "SL Benfica Futsal Women",
  "Sporting Futsal Women":
    "Sporting CP Futsal Women",
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

export function isSportKey(
  value: string
): value is SportKey {
  return SPORTS.some((sport) => sport.key === value)
}

export const TRACKED_TEAMS = [
  ...PORTUGUESE_WOMENS_FOOTBALL_TEAMS.map(
    (name) => ({
      key: `pt-football-${slugify(name)}`,
      name,
      sport: "Football",
      region: "Portugal",
      competition: "Liga BPI",
      sourceStatus: "manual-watchlist",
      sourceLabel: "FPF",
    })
  ),
  ...US_WOMENS_FOOTBALL_TEAMS.map(
    (name) => ({
      key: `us-football-${slugify(name)}`,
      name,
      sport: "Football",
      region: "EUA",
      competition: "NWSL",
      sourceStatus: "manual-watchlist",
      sourceLabel: "NWSL",
    })
  ),
  ...EUROPEAN_WOMENS_FOOTBALL_TEAMS.map(
    (name) => ({
      key: `eu-football-${slugify(name)}`,
      name,
      sport: "Football",
      region: "Europa",
      competition:
        "UEFA Women's Champions League",
      sourceStatus: "manual-watchlist",
      sourceLabel: "UEFA",
    })
  ),
  ...PORTUGUESE_WOMENS_HANDBALL_TEAMS.map(
    (name) => ({
      key: `pt-handball-${slugify(name)}`,
      name,
      sport: "Handball",
      region: "Portugal",
      competition:
        "Campeonato Nacional 1.ª Divisão Feminina de Andebol",
      sourceStatus: "manual-watchlist",
      sourceLabel: "FAP",
    })
  ),
  ...EUROPEAN_WOMENS_HANDBALL_TEAMS.map(
    (name) => ({
      key: `eu-handball-${slugify(name)}`,
      name,
      sport: "Handball",
      region: "Europa",
      competition: "EHF Champions League Women",
      sourceStatus: "manual-watchlist",
      sourceLabel: "EHF/IHF",
    })
  ),
  ...WOMENS_NATIONAL_TEAMS.map((name) => ({
    key: `national-football-${slugify(name)}`,
    name,
    sport: "Football",
    region: "Mundo",
    competition: "Seleções femininas",
    sourceStatus: "manual-watchlist",
    sourceLabel: "FIFA/UEFA",
  })),
  ...WOMENS_FUTSAL_TEAMS.map((name) => ({
    key: `futsal-${slugify(name)}`,
    name,
    sport: "Futsal",
    region: name.includes("Portugal") ||
      name.includes("Benfica") ||
      name.includes("Sporting") ||
      name.includes("Nun'Alvares") ||
      name.includes("Novasemente") ||
      name.includes("Santa Luzia") ||
      name.includes("Golpilheira")
      ? "Portugal"
      : "Europa",
    competition: name.includes("Futsal Women")
      ? "Campeonato Nacional Feminino de Futsal"
      : "Futsal feminino",
    sourceStatus: "manual-watchlist",
    sourceLabel: "FPF/UEFA",
  })),
  ...WOMENS_BEACH_HANDBALL_TEAMS.map((name) => ({
    key: `beach-handball-${slugify(name)}`,
    name,
    sport: "Beach Handball",
    region: name.includes("Portugal")
      ? "Portugal"
      : "Mundo",
    competition: name.includes("Portugal")
      ? "Andebol de Praia Feminino Portugal"
      : "Seleções femininas de Andebol de Praia",
    sourceStatus: "manual-watchlist",
    sourceLabel: "IHF/EHF/FAP",
  })),
] as const

export function normalizeTeamName(
  value: string
) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
}

export function normalizeCompetitionName(
  value: string
) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[ºª]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
}

export function canonicalCompetitionDisplayName(
  value: string,
  sport?: string | null
) {
  const key = normalizeCompetitionName(value)
  const sportKey = (sport || "").toLowerCase()

  if (
    sportKey === "football" &&
    [
      "1a divisao women",
      "1 divisao women",
      "1 liga feminina",
      "liga feminina",
      "campeonato nacional feminino",
      "campeonato nacional",
    ].includes(key)
  ) {
    return "Liga BPI"
  }

  if (
    sportKey === "futsal" &&
    [
      "1 liga feminina",
      "liga feminina",
      "liga feminina de futsal",
      "liga feminina placard",
      "liga feminina placard 2 fase 3 elim",
      "campeonato nacional feminino",
      "campeonato nacional",
      "campeonato nacional futsal feminino",
      "campeonato nacional feminino futsal",
    ].includes(key)
  ) {
    return "Campeonato Nacional Feminino de Futsal"
  }

  if (
    sportKey === "handball" &&
    [
      "1a divisao women",
      "1 divisao women",
      "1 liga feminina",
      "liga feminina",
      "campeonato nacional feminino",
      "campeonato nacional",
      "campeonato nacional 1 divisao feminina de andebol",
    ].includes(key)
  ) {
    return "Campeonato Nacional 1.ª Divisão Feminina de Andebol"
  }

  if (sportKey === "handball" && key === "serie a women") {
    return "Serie A Women Handball"
  }

  if (key === "american nwsl" || key === "nwsl women") {
    return "NWSL"
  }

  if (
    key === "womens champions league" ||
    key === "uefa womens champions league" ||
    key === "uefa champions league women"
  ) {
    return "UEFA Women's Champions League"
  }

  if (
    sportKey === "handball" &&
    key === "champions league women"
  ) {
    return "EHF Champions League Women"
  }

  if (
    key === "women s ehf champions league" ||
    key === "womens ehf champions league" ||
    key === "ehf champions league women"
  ) {
    return "EHF Champions League Women"
  }

  if (
    [
      "uefa womens euro",
      "uefa women s euro",
      "uefa womens european championship",
      "uefa women s european championship",
    ].includes(key)
  ) {
    return "UEFA Women's EURO"
  }

  if (
    [
      "world womens handball championship",
      "world women s handball championship",
      "world championship women",
    ].includes(key)
  ) {
    return "World Women's Handball Championship"
  }

  if (
    [
      "european womens handball championship",
      "european women s handball championship",
      "european championship women",
    ].includes(key)
  ) {
    return "European Women's Handball Championship"
  }

  return value
}

export function findTrackedTeamByName(
  teamName: string
) {
  const alias =
    TEAM_ALIASES[teamName] || teamName
  const normalizedAlias =
    normalizeTeamName(alias)

  return TRACKED_TEAMS.find(
    (team) =>
      normalizeTeamName(team.name) ===
      normalizedAlias
  )
}

export function getFootballDataCompetitionIds() {
  const configured =
    process.env.FOOTBALL_DATA_COMPETITIONS

  if (configured) {
    return configured
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean)
  }

  return WOMENS_FOOTBALL_COMPETITIONS.flatMap(
    (competition) =>
      "footballDataId" in competition
        ? [String(competition.footballDataId)]
        : []
  )
}

export function getTheSportsDbLeagueIds() {
  const configured =
    process.env.THESPORTSDB_LEAGUE_IDS

  if (configured) {
    return configured
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean)
  }

  return TRACKED_COMPETITIONS.flatMap(
    (competition) =>
      "theSportsDbLeagueId" in competition
        ? [
            String(
              competition.theSportsDbLeagueId
            ),
          ]
        : []
  )
}

export function getTheSportsDbLeagues() {
  return getTheSportsDbLeagueIds().map(
    (leagueId) => {
      const match =
        TRACKED_COMPETITIONS.find(
          (competition) =>
            "theSportsDbLeagueId" in
              competition &&
            String(
              competition.theSportsDbLeagueId
            ) === leagueId
        )

      return {
        id: leagueId,
        name: match?.name || leagueId,
        sport: match?.sport || "Football",
        region: match?.region || "Global",
      }
    }
  )
}

