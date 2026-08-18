# QueensArena Play Store Submission

## App

- App name: QueensArena
- Package name: `com.queensarena`
- Category: Sports
- Website: `https://queensarena-next.vercel.app`
- Privacy policy: `https://queensarena-next.vercel.app/privacy`
- Account deletion: `https://queensarena-next.vercel.app/account-deletion`
- Contact email: `queensarena13@gmail.com`

## Release File

Upload this Android App Bundle in Play Console:

```text
android/app/build/outputs/bundle/release/app-release.aab
```

Current Android version:

```text
Version name: 1.0.1
Version code: 2
```

Keep this file private:

```text
android/keystore-passwords.txt
```

## Short Description

```text
Resultados, calendário e dados de desporto feminino.
```

## Full Description

```text
QueensArena acompanha competições, equipas, jogos e jogadoras de desporto feminino numa experiência pensada para telemóvel.

Segue resultados, calendários, equipas, competições e estatísticas disponíveis em modalidades como futebol, futsal, andebol e andebol de praia.

A cobertura é organizada por modalidade, país ou região e competição, para que cada página tenha um contexto claro. A app identifica as fontes de dados e expande a cobertura de forma progressiva com integrações profissionais e fontes oficiais.

Funcionalidades:
- Jogos e resultados disponíveis
- Competições por modalidade
- Equipas favoritas com conta ou no dispositivo
- Login/perfil para guardar preferências
- Jogadoras e estatísticas quando disponíveis
- Páginas de fontes, privacidade, cookies e eliminação de conta
- Interface em português e inglês

QueensArena é feita para dar mais visibilidade ao desporto feminino.
```

## Release Notes

```text
Primeira versão pública da QueensArena para Android.

Inclui resultados, calendário, competições acompanhadas, equipas, jogadoras, favoritos, login/perfil, notificações opcionais e páginas de privacidade, fontes e eliminação de conta.
```

## Data Safety

Use the prepared document:

```text
docs/play-store/data-safety.md
```

## Content Rating

Recommended answers:

- Sports app.
- No gambling.
- No user-generated public content.
- No violence.
- No sexual content.
- No sale of goods.
- Ads: answer according to the current release. If AdSense/AdMob is active, say yes. If ads are not serving yet, say no until enabled.

## Play App Signing

When Google Play shows the app signing SHA-256 certificate, compare it with:

```text
https://queensarena-next.vercel.app/.well-known/assetlinks.json
```

If Google gives a different SHA-256 certificate, update `public/.well-known/assetlinks.json` with the Play app signing certificate and redeploy the site.

## First Release Recommendation

Use internal testing first.

Internal testing notes and tester checklist:

```text
docs/play-store/internal-testing.md
```

After internal install is confirmed:

1. Fix any TWA/domain verification warning.
2. Confirm app opens without browser address bar.
3. Confirm privacy/account deletion links work.
4. Promote to production.
