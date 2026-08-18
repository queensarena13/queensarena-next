# Supabase - contas e favoritos QueensArena

## Objetivo

Ativar a camada profissional de conta de utilizador:

- perfil por utilizador;
- email associado à conta;
- favoritos associados à conta;
- favoritos locais como fallback quando a utilizadora não inicia sessão.

## Passo Manual No Supabase

1. Abrir o Supabase Dashboard.
2. Entrar no projeto QueensArena.
3. Ir a `SQL Editor`.
4. Criar uma nova query.
5. Copiar todo o conteúdo de:

```text
supabase/user-profiles-favorites.sql
```

6. Executar a query.

## Como Confirmar

Depois de executar, confirmar no Table Editor que existem:

- `public.profiles`
- `public.favorites.team_key`
- `public.favorites.team_name`
- `public.favorites.sport`
- `public.favorites.updated_at`

Também confirmar em Authentication que novas contas continuam a ser criadas normalmente.

## Comportamento Esperado Na App

- Sem sessão: favoritos continuam guardados no dispositivo.
- Com sessão: favoritos são sincronizados com a conta.
- Ao iniciar sessão: favoritos locais e favoritos da conta são unidos.
- Ao sair: a conta termina sessão, mas os favoritos locais continuam no dispositivo.

## Segurança

- `profiles` tem RLS ativo.
- Cada utilizadora só lê/atualiza o próprio perfil.
- `favorites` mantém RLS por `auth.uid() = user_id`.
- Não existe leitura pública de perfis ou favoritos.
