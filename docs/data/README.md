# QueensArena Official Aggregator

Este fluxo permite alimentar a base QueensArena com dados recolhidos/validados a partir de fontes oficiais ou primárias.

## 1. Semear fontes oficiais

```powershell
node scripts\seed-official-sources.mjs
```

As fontes ficam visíveis em:

- `/sources`
- `/api/public/sources`
- `/api/public/competitions`

## 2. Importar jogos oficiais

Usa o modelo:

```text
docs/data/official-matches-template.csv
```

Comando:

```powershell
node scripts\import-official-matches.mjs docs\data\official-matches-template.csv
```

Campos principais:

- `source_slug`
- `sport`
- `competition`
- `season`
- `region`
- `home_team`
- `away_team`
- `starts_at`
- `status`
- `home_score`
- `away_score`
- `venue`
- `source_url`

## 3. Importar equipas e jogadoras

Modelos:

```text
docs/data/official-teams-template.csv
docs/data/official-players-template.csv
```

Comandos:

```powershell
node scripts\import-official-catalog.mjs docs\data\official-teams-template.csv
node scripts\import-official-catalog.mjs docs\data\official-players-template.csv
```

## 4. Regras editoriais

- Usar `QueensArena Official` apenas quando a informação foi recolhida de uma fonte oficial, fonte primária ou documento verificado.
- Manter sempre `source_url` quando possível.
- Preferir `verified` para dados confirmados e `imported` para dados vindos de fornecedores externos.
- Se existir conflito entre fornecedor e fonte oficial, a fonte oficial deve prevalecer.
