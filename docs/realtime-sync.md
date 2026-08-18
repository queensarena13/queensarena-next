# QueensArena realtime sync

## Current production setup

The app is deployed on Vercel Hobby. This plan only allows daily cron jobs, so server-side sync runs once per day:

- `/api/sync` queues matches from the provider.
- `/api/sync/api/worker` stores queued matches in Supabase and creates notifications when scores or statuses change.
- `/api/standings-sync` refreshes standings when a supported standings provider is configured.
- `/api/cleanup` removes old logs and notifications.

The public match pages still poll `/api/football/matches` every 30 seconds, so visitors see fresh provider data while the app is open.

## To get near realtime push notifications

Choose one of these before launch:

1. Upgrade Vercel to Pro and change `/api/sync` plus `/api/sync/api/worker` to run every 5 minutes.
2. Use Supabase scheduled jobs or another external scheduler to call the protected endpoints every 5 minutes.
3. Keep Vercel Hobby and treat push notifications as daily digest/low-frequency alerts until monetisation justifies the upgrade.

All scheduler calls must include:

```http
Authorization: Bearer <CRON_SECRET>
```

Do not expose `CRON_SECRET` in client-side code.
