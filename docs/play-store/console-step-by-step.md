# QueensArena Play Console - passos finais

## 1. Criar a app

- Nome: `QueensArena`
- Idioma predefinido: `Português (Portugal)`
- Tipo: `Aplicação`
- Gratuita ou paga: `Gratuita`
- Categoria: `Desporto`

## 2. Ficha da loja

Usar os textos em:

```text
docs/play-store/store-listing.md
```

Assets:

```text
docs/play-store/assets/feature-graphic-1024x500.png
docs/play-store/assets/phone-screenshot-1.png
docs/play-store/assets/phone-screenshot-2.png
public/queen-logo.png
```

## 3. Privacidade e contacto

- Política de privacidade: `https://queensarena-next.vercel.app/privacy`
- Eliminação de conta: `https://queensarena-next.vercel.app/account-deletion`
- Contacto: `queensarena13@gmail.com`

## 4. Data Safety

Usar o rascunho em:

```text
docs/play-store/data-safety.md
```

Para esta primeira versão:

- Dados pessoais: conta/email apenas se o utilizador iniciar sessão.
- Favoritos: podem ficar no dispositivo e/ou associados à conta quando existe sessão.
- Publicidade: declarar `Sim` apenas se AdMob/AdSense estiver ativo dentro da app publicada.
- Partilha de dados: responder de acordo com os serviços realmente ativos na versão submetida.

## 5. Classificação etária

Respostas recomendadas:

- Sem jogo a dinheiro.
- Sem conteúdo sexual.
- Sem violência.
- Sem venda de bens.
- Sem conteúdo público criado por utilizadores.
- App de desporto/resultados.

## 6. Release Android

Carregar este ficheiro:

```text
android/app/build/outputs/bundle/release/app-release.aab
```

Depois de carregar, ativar Play App Signing.

## 7. Verificar ligação TWA

Depois de a Play Console mostrar o certificado SHA-256 de assinatura da app:

1. Copiar o SHA-256 da Play App Signing.
2. Comparar com `public/.well-known/assetlinks.json`.
3. Se for diferente, atualizar `assetlinks.json`.
4. Fazer novo deploy Vercel.
5. Confirmar `https://queensarena-next.vercel.app/.well-known/assetlinks.json`.

## 8. Teste interno

Antes de produção aberta:

- Criar release em teste interno.
- Instalar a app através do link da Play Console.
- Confirmar que abre sem barra do browser.
- Confirmar navegação por modalidade, competição, clube, equipa e jogadora.
- Confirmar páginas legais.
- Confirmar login/perfil e favoritos.

## 9. Só depois promover para produção

Promover para produção quando:

- O teste interno instalar sem avisos graves.
- O domínio estiver validado pela TWA.
- A app pública continuar a passar `npm run verify:launch`.
- As declarações de privacidade/publicidade coincidirem com a versão publicada.

## Pontos ainda não 100%

- Fonte oficial estável para Liga BPI, futsal português e andebol português.
- AdMob/AdSense depende de aprovação da Google e configuração final.
- Fornecedor premium ou autorização oficial ainda depende de resposta externa.
- Revisão jurídica formal é recomendada antes de monetização relevante.
