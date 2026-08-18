# Plano de qualidade de dados

## Princípios

- Mostrar apenas dados reais, editoriais ou importados com origem identificável.
- Separar sempre modalidade, competição, equipa, jogadora e jogo.
- Evitar misturar modalidades em páginas específicas.
- Preferir pouca cobertura fiável a muita cobertura frágil.
- Guardar fonte, estado e última atualização sempre que possível.

## Estados de dados

- `verified`: confirmado por fonte oficial ou revisão editorial.
- `imported`: recebido por fornecedor ou importador automático.
- `editorial`: criado manualmente pela QueensArena com base em fonte consultada.
- `pending`: ainda por rever.

## Fontes aceitáveis

- Federação ou liga oficial.
- Clube oficial.
- Comunicado oficial de competição.
- API licenciada ou gratuita dentro dos termos.
- Importação manual validada pela equipa QueensArena.

## Fluxo de lançamento

1. Criar competição em `/admin/data`.
2. Registar URL da fonte oficial.
3. Criar equipas dessa competição.
4. Criar jogos confirmados.
5. Adicionar jogadoras quando houver plantéis oficiais.
6. Validar endpoints públicos:
   - `/api/public/matches?sport=Handball`
   - `/api/public/teams?sport=Handball`
   - `/api/public/players?sport=Handball`
   - `/api/public/competitions`

## Próxima automação

Depois do lançamento inicial, criar importadores por fonte oficial quando a estrutura da fonte for estável. Cada importador deve guardar lote, contagem importada, avisos e erro quando falhar.
