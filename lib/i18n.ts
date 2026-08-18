export type Locale = "pt" | "en"

export const defaultLocale: Locale = "pt"

export const localeCookieName =
  "queensarena-locale"

export function toHtmlLang(locale: Locale) {
  return locale === "pt" ? "pt-PT" : "en"
}

export function parseLocale(
  value: string | null | undefined
): Locale {
  return value === "en" || value === "pt"
    ? value
    : defaultLocale
}

export const dictionaries = {
  pt: {
    common: {
      appName: "QueensArena",
      live: "Em direto",
      all: "Tudo",
      profile: "Perfil",
      loading: "A carregar...",
      viewAll: "Ver tudo",
      favorite: "Adicionar aos favoritos",
      removeFavorite: "Remover dos favoritos",
      favorites: "Favoritos",
      enabled: "Ativo",
      disabled: "Inativo",
      notAvailable: "Dados em validação.",
      officialData: "Dados oficiais",
      sourceUnavailable:
        "A fonte oficial não devolveu dados neste momento.",
      lastUpdated: "Atualizado",
      points: "pts",
      vs: "vs",
    },
    nav: {
      home: "Início",
      leagues: "Competições",
      matches: "Jogos",
      teams: "Equipas",
      players: "Jogadoras",
      fixtures: "Calendário",
      dashboard: "Painel",
      stats: "Estatísticas",
    },
    footer: {
      about: "Sobre",
      accountDeletion: "Eliminar conta",
      advertise: "Publicidade",
      contact: "Contacto",
      cookies: "Cookies",
      editorialPolicy: "Política editorial",
      feedback: "Feedback",
      privacy: "Privacidade",
      sources: "Fontes e dados",
      terms: "Termos",
      watch: "Onde ver",
      tagline:
        "Resultados e calendário de desporto feminino.",
    },
    home: {
      eyebrow: "Desporto feminino",
      title: "The game belongs to queens.",
      subtitle:
        "Resultados, calendários, equipas e jogadoras numa experiência feita para seguir no telemóvel.",
      primaryAction: "Ver jogos em direto",
      secondaryAction: "Calendário",
      secondaryTeams: "Equipas e seleções",
      modalitiesAction: "Modalidades",
      competitionsAction: "Competições",
      clubsAction: "Clubes",
      activeClubs: "Clubes reais",
      matchesPlayed: "Jogos registados",
      competitions: "Competições",
      tracked: "Acompanhadas",
      topbarTitle: "Desporto feminino",
      topbarSubtitle:
        "Resultados, calendário e competições em tempo real.",
      platformLabel: "Futebol + Andebol",
      platformDescription:
        "Cobertura QueensArena com dados reais onde a fonte já responde, com prioridade a Portugal, Europa, EUA, futsal e andebol feminino.",
    },
    homeTopics: {
      live: "Entrar por modalidade e competição.",
      fixtures: "Calendário por época.",
      standings: "Classificações e rankings.",
      teams: "Clubes, seleções, futsal, andebol e andebol de praia.",
      players: "Golos, assistências e perfis.",
      leagues: "Provas acompanhadas.",
      favorites: "Equipas guardadas neste telemóvel.",
    },
    homeTrust: {
      verifiableDataTitle: "Dados verificáveis",
      verifiableDataText:
        "Separação clara entre dados oficiais, dados importados e cobertura em validação.",
      languagesTitle: "PT e EN",
      languagesText:
        "Interface preparada para português de Portugal e inglês.",
      localFavoritesTitle: "Favoritos locais",
      localFavoritesText:
        "Equipas guardadas no telemóvel sem criar fricção no primeiro uso.",
      notificationsTitle: "Notificações",
      notificationsText:
        "Base técnica pronta para avisos de jogos e resultados quando a fonte real estiver ligada.",
    },
    instagram: {
      title: "Junta-te a comunidade QueensArena",
      description:
        "Bastidores, calendários, resultados e novidades da QueensArena.",
      action: "Seguir no Instagram",
    },
    beta: {
      message:
        "QueensArena: dados reais disponíveis e novas competições em expansão.",
      feedback: "Enviar feedback",
    },
    ads: {
      label: "Publicidade",
      title:
        "Dá visibilidade à tua marca no desporto feminino",
      description:
        "Espaços diretos para clubes, academias, eventos e marcas parceiras.",
      action: "Anunciar na QueensArena",
    },
    consent: {
      title: "Privacidade, dados e anúncios",
      description:
        "Usamos cookies essenciais para a app funcionar. Analítica ajuda-nos a perceber crescimento. Publicidade só é ativada com consentimento e de forma discreta.",
      essentials: "Essenciais",
      essentialsDescription:
        "Idioma, favoritos, sessão e segurança.",
      analytics: "Analítica",
      analyticsDescription:
        "Medir páginas vistas, crescimento e utilização.",
      advertising: "Publicidade",
      advertisingDescription:
        "Carregar anúncios mínimos quando configurados.",
      acceptAll: "Aceitar tudo",
      saveChoice: "Guardar escolha",
      customize: "Personalizar",
      necessaryOnly: "Só necessários",
      learnMore: "Saber mais",
    },
    stats: {
      competitions: "Competições",
      matches: "Jogos oficiais",
      teams: "Equipas",
      liveCoverage: "Cobertura em direto",
    },
    matches: {
      liveTitle: "Jogos em direto",
      liveEmpty:
        "Não há jogos oficiais em direto neste momento.",
      scheduledTitle: "Próximos jogos",
      scheduledDescription:
        "Calendário feminino de Portugal, Europa, EUA, futsal e andebol.",
      recentTitle: "Resultados recentes",
      recentDescription:
        "Resultados finais das competições acompanhadas.",
      officialProvider:
        "Fonte oficial ligada: TheSportsDB",
      matchNotFound: "Jogo não encontrado.",
      teamNotFound: "Equipa não encontrada.",
      history: "Histórico de jogos e resultados.",
      status: "Estado",
    },
    standings: {
      title: "Classificação",
      empty:
        "Ainda não há classificação carregada.",
      played: "J",
      won: "V",
      drawn: "E",
      lost: "D",
    },
    competitions: {
      title: "Competições acompanhadas",
      description:
        "Portugal, Europa, EUA, futsal e andebol feminino acompanhados por fonte oficial sempre que disponível.",
      dataSource: "Fonte de dados",
      footballData: "Football-Data",
      theSportsDb: "TheSportsDB",
      manual: "Manual/Supabase",
      pending: "A ligar",
      portuguêse: "Portugal",
      european: "Europa",
    },
    search: {
      placeholder:
        "Pesquisar equipas, jogadoras, competições...",
      noResults: "Sem resultados.",
      teams: "Equipas",
      players: "Jogadoras",
      leagues: "Competições",
    },
    notifications: {
      title: "Notificações",
      empty: "Ainda não há notificações.",
      description:
        "Ativa alertas no telemóvel para jogos e resultados.",
      enable: "Ativar",
      enabled:
        "Notificações ativas neste dispositivo.",
      blocked:
        "O browser bloqueou as notificações. Podes alterar isto nas definicoes do site.",
      unsupported:
        "Este browser não suporta notificações.",
      testBody:
        "Notificações ativas para jogos femininos.",
    },
    matchesPage: {
      guidedNavigation: "Navegação guiada",
      description:
        "Escolhe uma modalidade. Depois filtra por país ou região e entra na competição certa.",
      sport: "Modalidade",
      sportMeta: "Desporto",
      year: "Ano",
      seasonMeta: "Época",
      region: "País ou região",
      competition: "Competição",
      oneCompetition: "competição",
      manyCompetitions: "competições",
      coverageTitle: "Cobertura da competição",
      coverageDescription:
        "A cobertura apresenta apenas dados confirmados pela fonte ligada. Quando a fonte ainda não disponibiliza jogos, a secção fica sinalizada como sem dados.",
      withDataNow: "Com dados agora",
      enterDirectly: "Entrar diretamente",
      shortcutsDescription:
        "Atalhos criados a partir dos jogos reais recebidos da fonte ligada.",
      upcomingMatches: "Jogos futuros",
      finishedMatches: "Jogos acabados",
      futurePill: "Futuros",
      finishedPill: "Acabados",
      chooseCompetition:
        "Escolhe uma competição para ver os dados disponíveis.",
      chooseSport:
        "Escolhe primeiro uma modalidade para veres países, regiões e competições.",
      liveCount: "em direto",
      liveEmpty:
        "Não há jogos em direto nesta competição neste momento.",
      upcomingEmpty:
        "Ainda não há jogos futuros disponíveis para esta seleção.",
      finishedEmpty:
        "Ainda não há jogos acabados disponíveis para esta seleção.",
      standingsEmpty:
        "A classificação aparece quando existirem resultados acabados suficientes para esta competição.",
      teamsEmpty:
        "Ainda não há equipas disponíveis para esta seleção.",
      viewMatch: "Ver jogo",
    },
    teamsPage: {
      title: "Equipas",
      description:
        "Consulta equipas de futebol feminino, futsal, andebol e andebol de praia.",
      all: "Todas",
      portugal: "Portugal",
      usa: "EUA",
      football: "Futebol",
      selections: "Seleções",
      futsal: "Futsal",
      handball: "Andebol",
      beachHandball: "Andebol de praia",
      favoriteTeams: "Equipas favoritas",
      noFavorites:
        "Toca no coração de uma equipa para a guardar aqui.",
      competition: "Competição",
      coverageTitle: "Cobertura das equipas",
      coverageDescription:
        "A página combina equipas acompanhadas pela QueensArena com equipas devolvidas pela API ligada quando disponíveis.",
      matches: "Jogos",
      upcoming: "Futuros",
      finished: "Acabados",
      lastData: "Último dado",
    },
    statsPage: {
      title: "Estatísticas",
      description:
        "Resumo da cobertura real ligada a app.",
      trackedSports: "Modalidades",
      regions: "Regiões",
      favoriteTeams: "Favoritos",
      autoRefresh: "Atualização automática",
      liveRefresh: "Jogos em direto: 30 segundos",
      calendarRefresh:
        "Calendário e resultados: 5 minutos",
      dataSource: "Fonte oficial",
      matchFeed: "TheSportsDB + Supabase",
      teamStatsTitle: "Classificação",
      teamStatsDescription:
        "Classificações de equipas e estatísticas de jogadoras.",
      playerStatsDescription:
        "Dados de jogadoras vindos da base de dados.",
      standingsNote:
        "Classificação calculada com os resultados já carregados na app.",
      played: "J",
      goalDifference: "DG",
      topScorers: "Melhores marcadoras",
      topAssists: "Assistências",
      noPlayerStats: "",
      loadedResults: "Resultados carregados",
      competitionsWithResults:
        "Competições com tabela",
    },
    playersPage: {
      coverageTitle: "Jogadoras",
      coverageDescription: "",
    },
    auth: {
      welcome: "Bem-vinda",
      description:
        "Acede ao teu painel de desporto feminino.",
      email: "Email",
      password: "Palavra-passe",
      login: "Entrar",
      signup: "Criar conta",
      created: "Conta criada.",
      loginFirst: "Inicia sessão primeiro.",
    },
    pages: {
      leagueNotFound:
        "Competição não encontrada.",
      leagueDescription:
        "Competição profissional de futebol feminino com clubes e atletas de elite.",
      playerNotFound:
        "Jogadora não encontrada.",
      position: "Posição",
      team: "Equipa",
      nationality: "Nacionalidade",
      age: "Idade",
      goals: "Golos",
      assists: "Assistências",
      appearances: "Jogos",
    },
  },
  en: {
    common: {
      appName: "QueensArena",
      live: "Live",
      all: "All",
      profile: "Profile",
      loading: "Loading...",
      viewAll: "View all",
      favorite: "Add to favourites",
      removeFavorite: "Remove from favourites",
      favorites: "Favourites",
      enabled: "Enabled",
      disabled: "Disabled",
      notAvailable: "No data yet.",
      officialData: "Official data",
      sourceUnavailable:
        "The official source did not return data right now.",
      lastUpdated: "Updated",
      points: "pts",
      vs: "vs",
    },
    nav: {
      home: "Home",
      leagues: "Competitions",
      matches: "Matches",
      teams: "Teams",
      players: "Players",
      fixtures: "Calendar",
      dashboard: "Dashboard",
      stats: "Stats",
    },
    footer: {
      about: "About",
      accountDeletion: "Account deletion",
      advertise: "Advertise",
      contact: "Contact",
      cookies: "Cookies",
      editorialPolicy: "Editorial policy",
      feedback: "Feedback",
      privacy: "Privacy",
      sources: "Data sources",
      terms: "Terms",
      watch: "Where to watch",
      tagline: "Women's sports scores and calendar.",
    },
    home: {
      eyebrow: "Women's sport",
      title: "The game belongs to queens.",
      subtitle:
        "Scores, calendars, teams and players in a mobile-first experience.",
      primaryAction: "See live matches",
      secondaryAction: "Calendar",
      secondaryTeams: "Teams and national sides",
      modalitiesAction: "Sports",
      competitionsAction: "Competitions",
      clubsAction: "Clubs",
      activeClubs: "Real clubs",
      matchesPlayed: "Recorded matches",
      competitions: "Competitions",
      tracked: "Tracked",
      topbarTitle: "Women's sport",
      topbarSubtitle:
        "Real-time scores, calendar and competitions.",
      platformLabel: "Football + Handball",
      platformDescription:
        "QueensArena coverage with real data where the source already responds, prioritising Portugal, Europe, the USA, futsal and women's handball.",
    },
    homeTopics: {
      live: "Browse by sport and competition.",
      fixtures: "Season-by-season calendar.",
      standings: "Standings and rankings.",
      teams: "Clubs, national sides, futsal, handball and beach handball.",
      players: "Goals, assists and profiles.",
      leagues: "Tracked competitions.",
      favorites: "Teams saved on this phone.",
    },
    homeTrust: {
      verifiableDataTitle: "Verifiable data",
      verifiableDataText:
        "Clear separation between official data, imported data and coverage under validation.",
      languagesTitle: "PT and EN",
      languagesText:
        "Interface prepared for Portuguese from Portugal and English.",
      localFavoritesTitle: "Local favourites",
      localFavoritesText:
        "Teams saved on the phone without friction on first use.",
      notificationsTitle: "Notifications",
      notificationsText:
        "Technical base ready for match and result alerts when the real source is connected.",
    },
    instagram: {
      title: "Join the QueensArena community",
      description:
        "Behind the scenes, calendars, results and QueensArena updates.",
      action: "Follow on Instagram",
    },
    beta: {
      message:
        "QueensArena: real data available and new competitions expanding.",
      feedback: "Send feedback",
    },
    ads: {
      label: "Advertising",
      title:
        "Give your brand visibility in women's sport",
      description:
        "Direct spaces for clubs, academies, events and partner brands.",
      action: "Advertise on QueensArena",
    },
    consent: {
      title: "Privacy, data and ads",
      description:
        "We use essential cookies so the app works. Analytics helps us understand growth. Advertising is only enabled with consent and in a discreet way.",
      essentials: "Essentials",
      essentialsDescription:
        "Language, favourites, session and security.",
      analytics: "Analytics",
      analyticsDescription:
        "Measure page views, growth and usage.",
      advertising: "Advertising",
      advertisingDescription:
        "Load minimal ads when configured.",
      acceptAll: "Accept all",
      saveChoice: "Save choice",
      customize: "Customize",
      necessaryOnly: "Necessary only",
      learnMore: "Learn more",
    },
    stats: {
      competitions: "Competitions",
      matches: "Official matches",
      teams: "Teams",
      liveCoverage: "Live coverage",
    },
    matches: {
      liveTitle: "Live matches",
      liveEmpty:
        "There are no official live matches right now.",
      scheduledTitle: "Upcoming fixtures",
      scheduledDescription:
        "Women's calendar for Portugal, Europe, USA, futsal and handball.",
      recentTitle: "Recent results",
      recentDescription:
        "Final scores from tracked competitions.",
      officialProvider:
        "Official source connected: TheSportsDB",
      matchNotFound: "Match not found.",
      teamNotFound: "Team not found.",
      history: "Match history and results.",
      status: "Status",
    },
    standings: {
      title: "Standings",
      empty: "No standings loaded yet.",
      played: "P",
      won: "W",
      drawn: "D",
      lost: "L",
    },
    competitions: {
      title: "Tracked competitions",
      description:
        "Portugal, Europe, USA, futsal and women's handball, using official data whenever available.",
      dataSource: "Data source",
      footballData: "Football-Data",
      theSportsDb: "TheSportsDB",
      manual: "Manual/Supabase",
      pending: "Connecting",
      portuguêse: "Portugal",
      european: "Europe",
    },
    search: {
      placeholder:
        "Search teams, players, competitions...",
      noResults: "No results.",
      teams: "Teams",
      players: "Players",
      leagues: "Competitions",
    },
    notifications: {
      title: "Notifications",
      empty: "No notifications yet.",
      description:
        "Enable alerts for matches and results.",
      enable: "Enable",
      enabled:
        "Notifications are enabled on this device.",
      blocked:
        "Notifications are blocked. You can change this in site settings.",
      unsupported:
        "This browser does not support notifications.",
      testBody:
        "Notifications enabled for women's matches.",
    },
    matchesPage: {
      guidedNavigation: "Guided navigation",
      description:
        "Choose a sport. Then filter by country or region and open the right competition.",
      sport: "Sport",
      sportMeta: "Sport",
      year: "Year",
      seasonMeta: "Season",
      region: "Country or region",
      competition: "Competition",
      oneCompetition: "competition",
      manyCompetitions: "competitions",
      coverageTitle: "Competition coverage",
      coverageDescription:
        "Coverage only presents data confirmed by the connected source. When the source has not yet made matches available, the section is marked as having no data.",
      withDataNow: "With data now",
      enterDirectly: "Go directly",
      shortcutsDescription:
        "Shortcuts created from real matches received from the connected source.",
      upcomingMatches: "Upcoming matches",
      finishedMatches: "Finished matches",
      futurePill: "Upcoming",
      finishedPill: "Finished",
      chooseCompetition:
        "Choose a competition to see the available data.",
      chooseSport:
        "Choose a sport first to see countries, regions and competitions.",
      liveCount: "live",
      liveEmpty:
        "There are no live matches in this competition right now.",
      upcomingEmpty:
        "There are no upcoming matches available for this selection yet.",
      finishedEmpty:
        "There are no finished matches available for this selection yet.",
      standingsEmpty:
        "Standings appear when there are enough finished results for this competition.",
      teamsEmpty:
        "There are no teams available for this selection yet.",
      viewMatch: "View match",
    },
    teamsPage: {
      title: "Teams",
      description:
        "Browse women's football, futsal, handball and beach handball teams.",
      all: "All",
      portugal: "Portugal",
      usa: "USA",
      football: "Football",
      selections: "National teams",
      futsal: "Futsal",
      handball: "Handball",
      beachHandball: "Beach handball",
      favoriteTeams: "Favourite teams",
      noFavorites:
        "Tap a team's heart to save it here.",
      competition: "Competition",
      coverageTitle: "Team coverage",
      coverageDescription:
        "This page combines teams tracked by QueensArena with teams returned by the connected API when available.",
      matches: "Matches",
      upcoming: "Upcoming",
      finished: "Finished",
      lastData: "Last data",
    },
    statsPage: {
      title: "Stats",
      description:
        "A clear summary of the real coverage connected to the app.",
      trackedSports: "Sports",
      regions: "Regions",
      favoriteTeams: "Favourites",
      autoRefresh: "Automatic refresh",
      liveRefresh: "Live matches: 30 seconds",
      calendarRefresh:
        "Calendar and results: 5 minutes",
      dataSource: "Official source",
      matchFeed: "TheSportsDB + Supabase",
      teamStatsTitle: "Standings",
      teamStatsDescription:
        "Team standings and player statistics.",
      playerStatsDescription:
        "Player data from the database.",
      standingsNote:
        "Standings calculated from results already loaded into the app.",
      played: "P",
      goalDifference: "GD",
      topScorers: "Top scorers",
      topAssists: "Assists",
      noPlayerStats: "",
      loadedResults: "Loaded results",
      competitionsWithResults:
        "Competitions with standings",
    },
    playersPage: {
      coverageTitle: "Players",
      coverageDescription: "",
    },
    auth: {
      welcome: "Welcome back",
      description:
        "Access your women's sports dashboard.",
      email: "Email",
      password: "Password",
      login: "Log in",
      signup: "Sign up",
      created: "Account created.",
      loginFirst: "Please log in first.",
    },
    pages: {
      leagueNotFound:
        "Competition not found.",
      leagueDescription:
        "Professional women's football competition featuring elite clubs and athletes.",
      playerNotFound: "Player not found.",
      position: "Position",
      team: "Team",
      nationality: "Nationality",
      age: "Age",
      goals: "Goals",
      assists: "Assists",
      appearances: "Appearances",
    },
  },
} as const

export type Dictionary =
  (typeof dictionaries)[Locale]

export function getDictionary(locale: Locale) {
  return dictionaries[locale]
}

