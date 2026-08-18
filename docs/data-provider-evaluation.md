# Avaliação de Fornecedores de Dados

## Recomendação Atual

A QueensArena deve operar como agregador próprio, com importadores por fonte. Nenhum fornecedor gratuito resolve tudo sozinho.

Ordem recomendada:

1. FPF Centro de Resultados/Joga+ para futebol e futsal português.
2. FAP/EHF/IHF para andebol e andebol de praia, quando possível com autorização.
3. API-FOOTBALL para futebol internacional feminino.
4. API-HANDBALL para andebol indoor feminino.
5. StatsBomb Open Data para enriquecer histórico e estatística avançada de futebol feminino.
6. football-data.org como apoio limitado em competições FIFA/UEFA.
7. TheSportsDB como fallback multidesporto, não como fonte crítica.
8. Statscore/Livesport/Sportradar/Stats Perform apenas se houver proposta comercial viável.

## Matriz de Fontes

| Fonte | URL principal | Desportos-alvo | Gratuita / preço | Auth | Limites | Formato | Cobertura feminina relevante | Lacunas principais |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| football-data.org | https://www.football-data.org/ | Futebol | Camada gratuita confirmada; freemium | `X-Auth-Token`; anónimo só para listas | 10 req/min no plano free; 100 req/24h sem auth | JSON | Inclui UEFA Women's Euro e FIFA Women's World Cup; jogos, standings, equipas, pessoas e scorers | Não cobre futsal, andebol nem praia; profundidade feminina depende do plano |
| StatsBomb Open Data | https://github.com/statsbomb/open-data | Futebol | Gratuito para investigação/interesse genuíno | Sem auth para dados públicos | GitHub REST: 60 req/h sem auth | JSON | Forte em futebol feminino histórico: FA WSL, NWSL, Liga F, Frauen Bundesliga, UEFA Women's Euro; eventos, lineups e 360 parcial | Não é live; não cobre futsal, andebol nem praia |
| FPF Centro de Resultados / Joga+ | https://resultados.fpf.pt/ | Futebol, futsal | Público gratuito | Não observada autenticação | Não especificados | HTML estruturado; JSON/XML não documentados | Muito forte em Portugal: Liga BPI, divisões nacionais femininas, Liga Feminina Placard, Taças, sub-19/sub-15, clubes, equipas, jogadoras, classificações e detalhes de jogo | Não cobre andebol; não é API pública formal; integração mais frágil |
| API-FOOTBALL | https://www.api-football.com/ | Futebol | Free plan 100 req/dia; pago desde cerca de $19/mês | Header `x-apisports-key` | 100 req/dia no free; limites pagos por minuto | REST/JSON | Muito ampla no feminino: FA WSL, Women's Championship, NWSL, Champions League Women, World Cup Women, AFCON Women e outras | Não cobre futsal, andebol nem praia; free limita épocas |
| API-HANDBALL | https://api-sports.io/sports/handball | Andebol indoor | Free plan 100 req/dia | Header `x-apisports-key` | 100 req/dia no free; pagos com 300/450/900 req/min | REST/JSON | Ampla em andebol feminino indoor: 1a Divisao Women Portugal, EHF European League Women, Champions League Women, European Championship Women, World Championship Women | Não confirma beach handball; estatística por atleta pouco clara |
| TheSportsDB | https://www.thesportsdb.com/ | Multidesporto | v1 free com chave 123; premium cerca de $9/mês | v1 chave no URL; v2 `X-API-KEY` | Docs: 30 req/min free; comunidade aconselha <=2 req/s | JSON | Bom fallback; tem futebol feminino e andebol feminino; tabelas, eventos, lookups e algumas estatísticas | Qualidade comunitária; restrições para apps em stores; futsal/beach handball pouco demonstrado |
| EHF Ticker / Eurohandball + IHF | https://ticker.ehf.eu/ / https://beachticker.ehf.eu/ / https://www.ihf.info/ | Andebol indoor, andebol de praia | Público gratuito | Não observada autenticação | Não especificados | HTML/live pages; API pública não documentada | Fonte oficial essencial para player stats, match stats, standings, live scores europeus; beach handball oficial via beachticker; IHF publica fixtures/statistics/dashboards | Muito útil mas fraco como API; depende de autorização, scraping controlado ou feeds não documentados |

## Decisão Prática

Para lançamento, priorizar:

- Dados próprios em Supabase.
- Importação manual/CSV de fontes oficiais.
- API-FOOTBALL e API-HANDBALL apenas como importadores controlados por quota.
- StatsBomb para conteúdo histórico premium de futebol feminino.
- Contacto oficial com FPF e FAP para autorização ou feed.

## Estado Técnico Confirmado

- StatsBomb Open Data: importador criado e funcional para jogos históricos femininos.
- EHF Ticker: importador leve criado e funcional para jogos femininos ativos/visíveis no ticker.
- FPF Centro de Resultados/Joga+: bloqueia pedidos automatizados simples; precisa de autorização, feed ou abordagem oficial.
- FAP: site acessível e com WordPress JSON público, mas ainda sem endpoint claro de jogos/resultados estruturados.
- football-data.org: chave atual só expôs competições genéricas úteis de forma limitada; não trouxe catálogo feminino suficiente.
- API-SPORTS: conta atual devolve erro de conta suspensa; não usar até resolver no dashboard.

## Regra de Produção

Não depender diretamente de páginas públicas no frontend. Tudo deve entrar primeiro na QueensArena Data API, com:

- fonte;
- URL;
- modalidade;
- competição canónica;
- época;
- data de atualização;
- estado de validação.
