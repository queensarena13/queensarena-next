# QueensArena Data Sources

The current free source, TheSportsDB, is useful for public fixtures and recent results, but it does not consistently cover every women's competition, player statistic, team roster, or full historical season.

Recommended next provider:

- STATSCORE: preferred premium candidate if it confirms women's football, futsal, handball, beach handball, squads, standings, player stats and commercial rights in writing.
- Sportmonks Football API: useful fallback for football live scores, fixtures, standings, squads, player stats, teams, seasons and events.
- API-Football/API-Sports can also be tested, but player identity and women's coverage should be validated per league before relying on it.

Required environment variables:

```env
SPORTMONKS_API_TOKEN=
STATSCORE_API_KEY=
STATSCORE_BASE_URL=https://api.statscore.com
STATSCORE_MATCHES_PATH=/matches
STATSCORE_AUTH_HEADER=Authorization
STATSCORE_AUTH_PREFIX=Bearer
STATSCORE_COMPETITIONS_JSON=[]
```

Recommended Supabase flow:

1. Store provider league/season IDs in a `data_sources` table.
2. Import teams by season.
3. Import squads by team.
4. Import fixtures/results by season.
5. Recalculate standings and player rankings after every sync.

Do not manually invent player goals, assists or appearances. Load them from the provider or official competition data.

## STATSCORE readiness

The app now has a safe STATSCORE connector in `lib/providers/statscore-provider.ts`.

It only activates when these values exist:

- `STATSCORE_API_KEY`
- `STATSCORE_COMPETITIONS_JSON`

Example competition mapping:

```json
[
  {
    "id": "PROVIDER_COMPETITION_ID",
    "name": "Liga BPI",
    "sport": "Football",
    "region": "Portugal",
    "season": "2026"
  }
]
```

When STATSCORE sends the final endpoint format, adjust:

- `STATSCORE_BASE_URL`
- `STATSCORE_MATCHES_PATH`
- `STATSCORE_AUTH_HEADER`
- `STATSCORE_AUTH_PREFIX`

The connector accepts a direct path with `{competitionId}`, for example:

```env
STATSCORE_MATCHES_PATH=/competitions/{competitionId}/matches
```

If the path has no placeholder, the app sends `competition_id` as a query parameter.

## Import endpoints

These endpoints are protected by `x-sync-secret`, using `PUSH_BROADCAST_SECRET` or `SYNC_SECRET`.

Import teams for a provider season:

```bash
curl -X POST https://queensarena-next.vercel.app/api/import/sportmonks/teams \
  -H "Content-Type: application/json" \
  -H "x-sync-secret: YOUR_SECRET" \
  -d '{"seasonId":"PROVIDER_SEASON_ID","season":"2025-2026","competition":"Liga BPI","region":"Portugal"}'
```

Import a squad:

```bash
curl -X POST https://queensarena-next.vercel.app/api/import/sportmonks/squad \
  -H "Content-Type: application/json" \
  -H "x-sync-secret: YOUR_SECRET" \
  -d '{"teamId":"PROVIDER_TEAM_ID","teamName":"SL Benfica","season":"2025-2026"}'
```

Required Supabase SQL:

- `supabase/data-provider-upgrade.sql`
- `supabase/push-subscriptions.sql`
