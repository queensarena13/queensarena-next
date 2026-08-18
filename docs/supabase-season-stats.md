# Modelo de dados por época

Este bloco prepara a QueensArena para navegar assim:

`modalidade > época > país/região > competição > equipa > plantel > jogadora`

## Ficheiro a correr no Supabase

Executar no SQL Editor do Supabase:

`supabase/season-stats-upgrade.sql`

## Tabelas novas

- `roster_memberships`: liga uma jogadora a uma equipa, época e competição.
- `player_season_stats`: estatísticas da jogadora por época e competição.
- `team_season_stats`: estatísticas da equipa por época e competição.

## Porque isto é importante

Antes, a tabela `players` guardava estatísticas gerais. Isso não chega para uma app desportiva séria, porque uma jogadora pode mudar de equipa, jogar épocas diferentes e ter números diferentes em cada competição.

Com este modelo, podemos mostrar:

- plantel de uma equipa numa época concreta;
- estatísticas da jogadora nessa época;
- estatísticas por competição;
- histórico desde 2020;
- comparações futuras entre equipas e jogadoras.

## Ordem recomendada

1. Correr `supabase/data-provider-upgrade.sql`.
2. Correr `supabase/season-stats-upgrade.sql`.
3. Confirmar `SUPABASE_SERVICE_ROLE_KEY` no Vercel.
4. Confirmar `SPORTMONKS_API_TOKEN` no Vercel.
5. Importar equipas por competição e época em `/admin/data`.
6. Importar plantéis por equipa e época em `/admin/data`.
