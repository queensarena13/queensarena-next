function normalizeTeam(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\b(w|women|feminino|feminina|futsal|handball)\b/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
}

function favicon(domain: string) {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
}

const TEAM_DOMAINS: Record<string, string> = {
  "sl benfica": "slbenfica.pt",
  benfica: "slbenfica.pt",
  "sporting cp": "sporting.pt",
  sporting: "sporting.pt",
  "sc braga": "scbraga.pt",
  braga: "scbraga.pt",
  "cs maritimo": "csmaritimo.org.pt",
  maritimo: "csmaritimo.org.pt",
  "vitoria sc": "vitoriasc.pt",
  "vitoria sport clube": "vitoriasc.pt",
  "rio ave fc": "rioavefc.pt",
  "scu torreense": "torreense.com",
  torreense: "torreense.com",
  "racing power fc": "racingpowerfc.pt",
  "sf damaiense": "sfdamaiense.pt",
  "valadares gaia fc": "valadaresgaiafc.pt",
  "colegio de gaia": "colegiodegaia.pt",
  "madeira sad": "madeirasad.pt",
  "abc de braga": "abcdebraga.pt",
  maiastars: "maiastars.pt",
  "arsenal": "arsenal.com",
  "arsenal fc": "arsenal.com",
  "chelsea": "chelseafc.com",
  "chelsea fc": "chelseafc.com",
  "manchester united": "manutd.com",
  "manchester united fc": "manutd.com",
  "barcelona": "fcbarcelona.com",
  "fc barcelona": "fcbarcelona.com",
  "real madrid": "realmadrid.com",
  "real madrid femenino": "realmadrid.com",
  juventus: "juventus.com",
  "juventus fc": "juventus.com",
  roma: "asroma.com",
  "roma fc": "asroma.com",
  "bayern munich": "fcbayern.com",
  "vfl wolfsburg": "vfl-wolfsburg.de",
  "paris saint germain": "psg.fr",
  psg: "psg.fr",
  "ol lyonnes": "ol.fr",
  lyon: "ol.fr",
  "portland thorns fc": "thorns.com",
  "orlando pride": "orlandocitysc.com",
  "houston dash": "houstondynamofc.com",
  "washington spirit": "washingtonspirit.com",
  "angel city fc": "angelcity.com",
  "bay fc": "bayfc.com",
  "gotham fc": "gothamfc.com",
  "kansas city current": "kansascitycurrent.com",
  "north carolina courage": "nccourage.com",
  "racing louisville fc": "racingloufc.com",
  "san diego wave fc": "sandiegowavefc.com",
  "seattle reign fc": "reignfc.com",
  "utah royals fc": "rsl.com",
  "chicago stars fc": "chicagostars.com",
}

export function getTeamLogoUrl(
  name: string,
  logoUrl?: string | null
) {
  if (logoUrl) return logoUrl

  const normalized = normalizeTeam(name)
  const domain = TEAM_DOMAINS[normalized]

  return domain ? favicon(domain) : null
}
