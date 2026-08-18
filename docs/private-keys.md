# Chaves privadas

## SUPABASE_SERVICE_ROLE_KEY

Encontrar em:

`Supabase Dashboard > Project Settings > API Keys`

Usar uma chave privada/secret/service role apenas no servidor. Nunca colocar esta chave em componentes de browser, repositórios públicos ou variáveis com prefixo `NEXT_PUBLIC_`.

## SPORTMONKS_API_TOKEN

Encontrar/criar em:

`MySportmonks > Dashboard > API tokens`

Esta chave desbloqueia importação completa de equipas, plantéis, jogadoras e estatísticas.

## Onde guardar

Guardar no Vercel, em:

`Project > Settings > Environment Variables > Production`

Variáveis necessárias:

```env
SUPABASE_SERVICE_ROLE_KEY=
SPORTMONKS_API_TOKEN=
```

Depois de adicionar, fazer novo deploy e confirmar em `/admin/setup`.
