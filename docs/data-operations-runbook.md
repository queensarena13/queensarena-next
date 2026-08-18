# QueensArena Data Operations Runbook

## Antes de publicar

Executar:

```text
npm run data:sync:open
npm run verify:launch
npm run build
```

## O Que Cada Comando Faz

`npm run data:sync:open`

- Atualiza o catálogo QueensArena de competições, fontes e épocas monitorizadas.
- Importa StatsBomb Open Data, incluindo jogos, lineups e estatísticas por jogadora.
- Importa histórico TheSportsDB quando a API pública devolve eventos.
- Atualiza EHF Ticker.
- Importa calendário oficial IHF.
- Normaliza nomes, regiões e metadados.
- Recalcula classificações e estatísticas por equipa/época.

`npm run data:quality`

- Confirma totais mínimos.
- Bloqueia nomes genéricos como `1a Divisão - Women`.
- Bloqueia marcadores de codificação partida.
- Confirma cobertura mínima de modalidades principais.

`npm run verify:launch`

- Verifica ficheiros Play Store/PWA.
- Verifica URLs públicas críticas.
- Verifica endpoints públicos de dados.
- Corre a validação de qualidade dos dados.
- Confirma o bundle Android release.

## Totais Mínimos Atuais

- Jogos: 9200
- Equipas: 800
- Jogadoras: 3000
- Fontes/competições: 580
- Plantéis por época: 2000
- Estatísticas por jogadora/época: 4000
- Classificações: 1400
- Estatísticas equipa/época: 1400

## Quando Algo Falha

- Se falhar por totais baixos, correr `npm run data:sync:open`.
- Se falhar por nome genérico, correr `node scripts/normalize-supabase-data.mjs`.
- Se falhar por endpoint público, verificar Vercel e Supabase.
- Se falhar por `assetlinks.json`, confirmar SHA-256 na Play Console.

## Regra Editorial

A QueensArena deve mostrar apenas dados reais e atribuíveis. Quando uma fonte ainda não devolve dados suficientes, a app deve apresentar um estado vazio claro, fonte em acompanhamento ou cobertura em preparação.
