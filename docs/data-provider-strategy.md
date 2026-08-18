# QueensArena Data Provider Strategy

## Decision

QueensArena should not scrape consumer live-score products such as Flashscore or Sofascore directly for production data.

The safer route is:

1. Use licensed APIs when available.
2. Use official federation/league sources only when their terms allow reuse or when data is manually verified.
3. Keep every imported row tied to a source, provider, season and competition.
4. Normalize competition names before display so the public app never shows duplicate labels for the same competition.

## Provider Notes

### Flashscore / Livesport

Flashscore belongs to Livesport. Livesport describes itself as a major real-time sports data and information provider, with data collected and processed by its own staff, resources and technology.

This makes Livesport interesting as a possible commercial data partner, but not as a scraping target. If we want Flashscore-level coverage, we should contact Livesport or its B2B/data network, not extract data from the public app.

### Sofascore

Sofascore is a consumer sports results and statistics app. It has strong football, handball and multi-sport coverage, but there is no obvious public commercial API we can rely on for a professional app.

It can be used as a comparison/reference during manual quality checks, but not as a primary automated source unless they provide written API access.

### Statscore / LSports

Statscore is still a strong fit technically because it covers football, handball, futsal and volleyball-style multi-sport data. The quoted price is currently too high, so it remains a future licensed-provider option.

### Official Sources

Official federation and league pages are the best route for low-cost, niche women's sport coverage, provided we respect usage terms and rate limits.

Priority sources:

- FPF for Liga BPI, Taça de Portugal, Supertaça and futsal.
- FAP for Portuguese handball, handball cups and beach handball.
- UEFA, EHF, IHF and FIFA for international competitions.
- National federations for high-priority countries where licensed APIs are missing.

## Implementation Rules

- Never display raw provider names when they are vague, duplicated or inconsistent.
- Canonical examples:
  - Football + `1a Divisao Women` => `Liga BPI`
  - Football + `1.ª Liga Feminina` => `Liga BPI`
  - Futsal + `Campeonato Nacional` => `Campeonato Nacional Feminino de Futsal`
  - Handball + `Campeonato Nacional` => `Campeonato Nacional 1.ª Divisão Feminina de Andebol`
- Keep source metadata public in `/sources`.
- Keep sync jobs idempotent and reversible.
