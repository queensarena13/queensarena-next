# QueensArena App Update Strategy

## Canais De Instalação

### Google Play Store

Este é o canal principal recomendado para Android.

- Updates automáticos pela Play Store quando o utilizador tem updates automáticos ativos.
- Updates manuais disponíveis na página da app na Play Store.
- É necessário novo `.aab` quando mudam configurações Android, ícone/splash nativo, permissões, package, assinatura ou requisitos da Play Console.

### Instalação Pelo Site Como PWA

Quando a utilizadora abre `https://queensarena-next.vercel.app` no Chrome/Android e escolhe instalar/adicionar ao ecrã principal:

- A app usa o site público e o service worker.
- Alterações web publicadas na Vercel chegam sem passar pela Play Store.
- Quando o service worker deteta uma nova versão, a app mostra um aviso: `Nova versão disponível`.
- A utilizadora pode tocar em `Atualizar agora` para recarregar e receber a versão mais recente.

Este canal é útil para beta público, pessoas sem Play Store ou partilha rápida com clubes/federações.

### APK/AAB Descarregado Manualmente

Não recomendado para público geral.

- Um APK descarregado diretamente não atualiza automaticamente pela Play Store.
- Para updates automáticos fora da Play Store seria preciso construir um updater próprio ou usar outra loja/app distribution.
- Pode levantar avisos de segurança no Android por instalação de fonte desconhecida.

## Regra De Lançamento

- Canal principal: Google Play Store.
- Canal alternativo seguro: PWA instalada pelo site.
- Evitar APK manual para público, exceto testes técnicos muito controlados.

## O Que Atualiza Sem Nova Versão Play Store

- Textos.
- Design web.
- Dados e fontes.
- Páginas legais.
- Filtros, navegação e correções web.
- Login/favoritos, desde que a alteração seja apenas web/Supabase.

## O Que Exige Nova Versão Play Store

- App bundle Android.
- Package/app id.
- Configuração TWA.
- Ícone ou splash Android nativo.
- Permissões Android.
- Mudanças exigidas pela Play Console.
- `assetlinks.json` quando o SHA-256 da Play App Signing mudar.
