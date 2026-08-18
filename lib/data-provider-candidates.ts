export type DataProviderPriority =
  | "primary"
  | "secondary"
  | "fallback"
  | "premium"

export type DataProviderCandidate = {
  name: string
  url: string
  sports: string
  cost: string
  auth: string
  limits: string
  format: string
  coverage: string
  gaps: string
  priority: DataProviderPriority
}

export const DATA_PROVIDER_CANDIDATES: DataProviderCandidate[] =
  [
    {
      name: "FPF Centro de Resultados / Joga+",
      url: "https://resultados.fpf.pt/",
      sports: "Futebol, futsal",
      cost: "Público gratuito",
      auth: "Sem autenticação observada",
      limits: "Não especificados",
      format: "HTML estruturado",
      coverage:
        "Portugal: Liga BPI, futsal feminino, taças, clubes, equipas, jogadoras, classificações e detalhes de jogo.",
      gaps:
        "Não é API pública documentada; integração exige autorização ou recolha controlada.",
      priority: "primary",
    },
    {
      name: "FAP / EHF / IHF",
      url: "https://portal.fpa.pt/",
      sports: "Andebol, andebol de praia",
      cost: "Público gratuito / acordo oficial",
      auth: "Sem autenticação observada nas páginas públicas",
      limits: "Não especificados",
      format: "HTML/live pages; feeds não documentados",
      coverage:
        "Andebol português, EHF, IHF, competições europeias, mundiais e beach handball.",
      gaps:
        "API pública formal não confirmada; precisa de autorização/feeds.",
      priority: "primary",
    },
    {
      name: "API-FOOTBALL",
      url: "https://www.api-football.com/",
      sports: "Futebol",
      cost: "Free 100 req/dia; pago desde cerca de $19/mês",
      auth: "Header x-apisports-key",
      limits:
        "100 req/dia no free; limites pagos variam por plano.",
      format: "REST/JSON",
      coverage:
        "Ampla cobertura feminina: NWSL, Champions League Women, World Cup Women, FA WSL e outras.",
      gaps:
        "Não cobre futsal, andebol nem praia; free limita épocas.",
      priority: "secondary",
    },
    {
      name: "API-HANDBALL",
      url: "https://api-sports.io/sports/handball",
      sports: "Andebol indoor",
      cost: "Free 100 req/dia; pago por plano",
      auth: "Header x-apisports-key",
      limits:
        "100 req/dia no free; pagos com 300/450/900 req/min.",
      format: "REST/JSON",
      coverage:
        "Andebol feminino indoor: Portugal, EHF, Champions League Women, European/World Championship Women.",
      gaps:
        "Beach handball não confirmado; estatística por atleta pouco clara.",
      priority: "secondary",
    },
    {
      name: "StatsBomb Open Data",
      url: "https://github.com/statsbomb/open-data",
      sports: "Futebol",
      cost: "Gratuito para investigação/interesse genuíno",
      auth: "Sem auth para dados públicos",
      limits: "GitHub REST: 60 req/h sem auth",
      format: "JSON",
      coverage:
        "Histórico forte de futebol feminino: FA WSL, NWSL, Liga F, Frauen Bundesliga, UEFA Women's Euro.",
      gaps:
        "Não é live; não cobre futsal, andebol nem praia.",
      priority: "secondary",
    },
    {
      name: "football-data.org",
      url: "https://www.football-data.org/",
      sports: "Futebol",
      cost: "Freemium",
      auth:
        "X-Auth-Token para clientes registados; anónimo só para listas.",
      limits:
        "10 req/min no free; 100 req/24h sem auth.",
      format: "JSON",
      coverage:
        "UEFA Women's Euro e FIFA Women's World Cup; jogos, standings, equipas, pessoas e scorers.",
      gaps:
        "Não cobre futsal, andebol nem praia; profundidade feminina depende do plano.",
      priority: "fallback",
    },
    {
      name: "TheSportsDB",
      url: "https://www.thesportsdb.com/",
      sports: "Multidesporto",
      cost: "v1 free; premium cerca de $9/mês",
      auth: "Chave no URL ou X-API-KEY",
      limits:
        "Docs indicam 30 req/min free; recomenda-se <=2 req/s.",
      format: "JSON",
      coverage:
        "Fallback multidesporto com algum futebol feminino e andebol feminino.",
      gaps:
        "Qualidade comunitária; restrições para apps em stores; futsal/beach handball pouco robustos.",
      priority: "fallback",
    },
    {
      name: "Statscore / Livesport / Sportradar / Stats Perform",
      url: "https://www.statscore.com/",
      sports: "Multidesporto",
      cost: "Comercial/premium",
      auth: "Contrato e chave/API",
      limits: "Por contrato",
      format: "API/feed",
      coverage:
        "Melhor hipótese para escala profissional e cobertura internacional.",
      gaps:
        "Preço elevado; precisa de teste por competição antes de pagar.",
      priority: "premium",
    },
  ]
