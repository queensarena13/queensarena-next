# QueensArena Play Store Prep

## Estratégia Recomendada

Publicar a QueensArena Android como Trusted Web Activity (TWA).

Este caminho usa a app web/PWA atual, abre o site em ecrã completo no Android e evita duplicar a aplicação em React Native nesta fase.

Referências oficiais:

- Android Trusted Web Activity: https://developer.android.com/develop/ui/views/layout/webapps/trusted-web-activities
- Google Play Data Safety: https://support.google.com/googleplay/android-developer/answer/16543315
- Google Play account deletion: https://support.google.com/googleplay/android-developer/answer/13327111

## Dados Base

- Nome público: QueensArena
- Package name: `com.queensarena`
- URL de produção: `https://queensarena-next.vercel.app`
- Categoria Play Store: Sports
- Idioma principal: Português (Portugal)
- Política de privacidade: `https://queensarena-next.vercel.app/privacy`
- Eliminação de conta: `https://queensarena-next.vercel.app/account-deletion`
- Contacto público: `queensarena13@gmail.com`

## Pronto

- PWA manifest existe em `public/manifest.webmanifest`.
- Service worker existe em `public/sw.js`.
- Ícone 512x512 existe em `public/queen-logo.png`.
- Página de privacidade pública existe em `/privacy`.
- Página de eliminação de conta existe em `/account-deletion`.
- Página de contacto pública existe em `/contact`.
- App está em produção na Vercel.
- QueensArena Data API devolve dados reais a partir do Supabase.
- Textos da ficha da loja estão em `docs/play-store/store-listing.md`.
- Draft Data Safety está em `docs/play-store/data-safety.md`.
- Template Digital Asset Links está em `docs/play-store/assetlinks.template.json`.
- Feature graphic existe em `docs/play-store/assets/feature-graphic-1024x500.png`.
- Duas screenshots base existem em `docs/play-store/assets/phone-screenshot-1.png` e `docs/play-store/assets/phone-screenshot-2.png`.
- Android Studio, SDK, Command-line Tools e JDK 17 estão prontos.
- Projeto Android TWA está gerado em `android/`.
- APK debug foi gerado.
- AAB debug foi gerado.
- AAB release assinado existe em `android/app/build/outputs/bundle/release/app-release.aab`.
- Keystore de release existe em `android/queensarena-release.keystore`.
- Password da keystore está guardada localmente em `android/keystore-passwords.txt`.
- `assetlinks.json` está publicado em `https://queensarena-next.vercel.app/.well-known/assetlinks.json`.
- `ads.txt` está publicado.
- `app-ads.txt` está publicado.

## Ainda Falta Fazer Manualmente

- Criar a app na Play Console.
- Carregar o AAB release.
- Ativar Play App Signing.
- Confirmar o SHA-256 final da Play App Signing.
- Atualizar `public/.well-known/assetlinks.json` se o SHA-256 final for diferente.
- Fazer novo deploy da Vercel se o SHA-256 mudar.
- Preencher Data Safety, classificação etária, conteúdo da app, política de privacidade e ficha da loja.
- Submeter primeiro para teste interno antes da produção pública.

## Não Bloqueia o Beta

- AdSense/AdMob ainda sem aprovação final.
- Fornecedor premium de dados ainda em negociação.
- FPF/FAP ainda sem feed oficial autorizado.

## Bloqueia Produção Aberta Forte

- Falta de fornecedor ou autorização oficial para cobertura portuguesa completa.
- Falta de aprovação final de anúncios se a versão submetida apresentar publicidade real.
- Falta de revisão final dos formulários Play Console.

## Caminho Até Submissão

1. Criar app na Play Console.
2. Carregar `android/app/build/outputs/bundle/release/app-release.aab`.
3. Ativar Play App Signing.
4. Copiar o SHA-256 da app signing certificate.
5. Atualizar `public/.well-known/assetlinks.json` se o SHA-256 final for diferente.
6. Fazer novo deploy da Vercel se houver alteração do SHA-256.
7. Preencher Data Safety, classificação etária, conteúdo da app, política de privacidade e ficha da loja.
8. Submeter primeiro para teste interno antes da produção pública.
