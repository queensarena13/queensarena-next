# Official Source Integration

QueensArena should prefer official public sources whenever a stable and respectful integration is possible.

## Integrated

- IHF official competition pages
  - Source: `https://www.ihf.info/`
  - Current importer: `scripts/sync-ihf-official-fixtures.mjs`
  - Coverage now enabled: `World Women's Handball Championship` 2025 fixtures and results.
  - Method: public HTML from official competition fixture pages, with `source_url` stored per match.

- EHF Ticker
  - Source: `https://ticker.ehf.eu/`
  - Current importer: `scripts/sync-ehf-ticker.mjs`
  - Method: official public ticker HTML, filtered to women's competitions and plausible dates.

## Identified But Not Used Programmatically

- FPF Centro de Resultados
  - Source: `https://resultados.fpf.pt/`
  - Status: official and useful for Portuguese football/futsal, but automated requests currently return `403 Forbidden`.
  - Decision: do not bypass protection. Use only after FPF provides permission, feed access, or a documented integration method.

- Federação Portuguesa de Andebol
  - Source: `https://portal.fpa.pt/`
  - Status: official, but no stable public data API was identified yet.
  - Decision: keep as manual/partner source until a documented feed or permission is available.

## Data Rules

- Store `source_url` on imported matches where possible.
- Mark official-page imports with a clear provider name, for example `IHF Official`.
- Reject implausible future dates from ticker-like pages.
- Prefer the best-covered season for competition links when the most recent season has only sample or partial data.
