# QueensArena API Plan

## Can We Create Our Own API?

Yes. The app already has API routes. The next step is to make QueensArena API a clean internal data layer backed by Supabase.

The API can:

- Serve matches, teams, players, standings and stats to the app.
- Normalize data from providers.
- Store manual corrections.
- Track source and update time.
- Protect admin imports.
- Power future mobile apps.

The API cannot legally create official data from nothing. It needs one of:

- Licensed provider data.
- Public official sources used within their terms.
- Manual editorial entry.
- Club/league partnerships.

## Recommended Data Model

- competitions
- seasons
- teams
- players
- roster_memberships
- matches
- standings
- team_season_stats
- player_season_stats
- data_sources
- data_corrections

## Next Implementation Step

Build admin-first workflow:

1. Add manual match entry/editing.
2. Add manual team and player editing.
3. Add provider import logs.
4. Add source confidence status per row.
5. Expose read-only public API endpoints.

This lets QueensArena improve even without a perfect provider.
