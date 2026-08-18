# QueensArena

QueensArena is a mobile-first Next.js app for women's football live scores, fixtures, results and standings, starting with Portugal and Europe.

## What This Version Does

- Focuses the product on women's football instead of all sports.
- Supports Portuguese from Portugal and English through the language switcher.
- Uses Supabase for matches, standings, teams, players, favourites, notifications and sync logs.
- Keeps public Supabase keys in environment variables instead of hardcoding them.
- Fetches real European women's football fixtures/results from TheSportsDB.
- Keeps Portuguese women's football competitions and Liga BPI teams as seeded real records in Supabase.

## Local Setup

Create `.env.local` with:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

FOOTBALL_DATA_API_KEY=your_football_data_key_optional
THESPORTSDB_LEAGUE_IDS=4889,4521,5274,4896,4893
```

Run the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Supabase

The starter database schema is in `supabase/schema.sql`. The first competition rows are in `supabase/seed.sql`.

In Supabase, open SQL Editor, run `schema.sql` once, then run `seed.sql` once. If the tables already exist, run `upgrade.sql` first and then `seed.sql`. The public app can read the main tables, while sync/admin writes should use `SUPABASE_SERVICE_ROLE_KEY` from server routes only.

## Sync Routes

- `/api/football/matches` gets official women's football matches from TheSportsDB.
- `/api/sync` gets matches from the configured football provider and queues them.
- `/api/sync/api/worker` processes queued matches into `matches`.
- `/api/standings-sync` refreshes standings.
- `/api/cleanup` removes old logs and notifications.

## Automatic Updates

The home screen refreshes live matches every 30 seconds. Upcoming fixtures and recent results refresh every 5 minutes. The `/api/football/matches` route is forced dynamic and sends no-cache headers so the app asks the provider for fresh data.

On Vercel, `vercel.json` also schedules background jobs every 15 minutes to sync and process match data, plus a daily cleanup job. Add `SUPABASE_SERVICE_ROLE_KEY` in Vercel project environment variables before relying on those jobs.
