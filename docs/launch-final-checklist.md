# QueensArena Launch Final Checklist

## Estado Atual

A app está pronta para teste interno Android e beta público controlado.

## Pronto Para Submissão Beta

- App pública em produção: `https://queensarena-next.vercel.app`.
- PWA manifest válido e com textos em português correto.
- Service worker presente.
- `robots.txt` e `sitemap.xml` servidos por Next.js.
- `privacy`, `terms`, `cookies`, `contact`, `sources`, `data-partnerships` e `account-deletion` disponíveis.
- `ads.txt` e `app-ads.txt` publicados.
- `assetlinks.json` publicado para a TWA.
- AAB release assinado disponível em `android/app/build/outputs/bundle/release/app-release.aab`.
- Play Store listing preparado em `docs/play-store/store-listing.md`.
- Data Safety draft preparado em `docs/play-store/data-safety.md`.
- Dados reais carregados no Supabase.
- Importadores ativos para StatsBomb Open Data, EHF Ticker, IHF, TheSportsDB e API-Sports quando a chave está disponível.
- Login/perfil e favoritos com fallback local e sincronização de conta quando a migração Supabase está aplicada.
- Guia de contas/favoritos preparado em `docs/supabase-user-accounts-setup.md`.
- Estratégia de updates documentada em `docs/app-update-strategy.md`.

## Verificações Técnicas Antes de Submeter

- `npm run lint`
- `npm run build`
- `npm run data:quality`
- `npm run verify:launch`
- Confirmar `https://queensarena-next.vercel.app/manifest.webmanifest`.
- Confirmar `https://queensarena-next.vercel.app/.well-known/assetlinks.json`.
- Confirmar `https://queensarena-next.vercel.app/ads.txt`.
- Confirmar `https://queensarena-next.vercel.app/app-ads.txt`.
- Confirmar páginas legais públicas.

## Ações Manuais na Play Console

1. Criar a app QueensArena.
2. Escolher categoria Sports.
3. Carregar o AAB release.
4. Ativar Play App Signing.
5. Copiar SHA-256 final da Play App Signing.
6. Comparar com `public/.well-known/assetlinks.json`.
7. Atualizar e fazer deploy se o SHA-256 mudar.
8. Preencher Data Safety.
9. Preencher classificação etária.
10. Preencher conteúdo da app e público-alvo.
11. Adicionar política de privacidade.
12. Adicionar screenshots e feature graphic.
13. Submeter para teste interno.

## Não Bloquear o Beta

- Fornecedor premium ainda em negociação.
- FPF/FAP/FPV/FPB ainda sem autorização formal/feed.
- AdSense/AdMob ainda sem aprovação final.

## Bloquear Produção Aberta

- Erros de autenticação, privacidade ou eliminação de conta.
- Dados por modalidade misturados em páginas dedicadas.
- Falta de SHA-256 correto no `assetlinks.json` depois da Play App Signing.
- Publicidade ativa sem declaração correta na Data Safety.
