# QueensArena Data API Roadmap

## Objetivo

A app pública deve ler dados da QueensArena Data API. Fornecedores externos são importadores, não dependências diretas da interface.

## Estratégia

O fornecedor principal é a própria QueensArena:

- Supabase como base central.
- API pública apenas de leitura para web, PWA e Android.
- Painel admin para criar e corrigir competições, equipas, jogadoras e jogos.
- Campos de fonte, estado e atualização para cada dado crítico.
- Fornecedores externos como adaptadores opcionais.

## Fontes Prioritárias

1. FPF Centro de Resultados/Joga+ para futebol e futsal português.
2. FAP, EHF e IHF para andebol e andebol de praia.
3. API-FOOTBALL para futebol internacional feminino.
4. API-HANDBALL para andebol indoor feminino.
5. StatsBomb Open Data para histórico, plantéis, eventos e estatística avançada.
6. football-data.org para competições FIFA/UEFA quando tiver cobertura útil.
7. TheSportsDB apenas como fallback.

## Camada Pública

Endpoints existentes:

- `/api/public/matches`
- `/api/public/teams`
- `/api/public/players`
- `/api/public/player-stats`
- `/api/public/competitions`
- `/api/public/sources`
- `/api/public/standings`
- `/api/public/team-stats`

Filtros prioritários:

- `sport`
- `competition`
- `season`
- `view`
- `limit`

Endpoint compatível:

- `/api/football/matches`

## Camada de Gestão

Painel principal:

- `/admin/data`

Permite criar:

- competição/fonte;
- equipa;
- jogo;
- jogadora;
- importações de fornecedor quando houver chave.

## Passo Obrigatório no Supabase

Executar o bloco combinado em `/admin/sql`, incluindo:

- `supabase/upgrade.sql`
- `supabase/data-provider-upgrade.sql`
- `supabase/queensarena-data-platform.sql`
- `supabase/season-stats-upgrade.sql`
- `supabase/seed.sql`
- `supabase/analytics-events.sql`

Sem `supabase/queensarena-data-platform.sql`, o painel manual não tem os campos de validação, fonte e histórico necessários.

## Prioridade de Lançamento

1. Validar nomes canónicos de competições por modalidade.
2. Criar/importar fontes oficiais prioritárias.
3. Adicionar equipas e jogos confirmados.
4. Confirmar que `/api/public/*` devolve dados por modalidade sem misturas.
5. Submeter Android como versão inicial enquanto a cobertura cresce.

## Importadores Ativos

- `scripts/sync-statsbomb-open-data.mjs`: importa histórico feminino StatsBomb para jogos, equipas e fontes.
- `scripts/sync-statsbomb-lineups-open-data.mjs`: importa jogadoras e plantéis a partir de lineups oficiais do dataset aberto.
- `scripts/sync-statsbomb-player-stats-open-data.mjs`: calcula estatísticas por jogadora, época e competição a partir dos eventos StatsBomb.
- `scripts/seed-tracked-competition-sources.mjs`: mantém o catálogo QueensArena de competições, fontes e épocas monitorizadas.
- `scripts/sync-ehf-ticker.mjs`: importa jogos femininos visíveis no EHF Ticker.
- `scripts/sync-thesportsdb-history.mjs`: importa histórico TheSportsDB.
- `scripts/sync-api-sports-*.mjs`: ficam preparados, mas dependem de conta API-SPORTS ativa.
