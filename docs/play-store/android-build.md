# Android TWA build guide

## Objetivo

Gerar um Android App Bundle (`.aab`) da QueensArena usando a PWA publica em:

https://queensarena-next.vercel.app

## Configuracao

- Package name: `com.queensarena`
- Launcher name: `QueensArena`
- Host: `queensarena-next.vercel.app`
- Start URL: `/`
- Theme color: `#f6b80f`
- Background color: `#05080a`
- Icon: `https://queensarena-next.vercel.app/queen-logo.png`

## Estado neste PC

- Android Studio instalado em `C:\Program Files\Android\Android Studio`.
- Android SDK instalado em `C:\Users\celot\AppData\Local\Android\Sdk`.
- Android SDK Command-line Tools instaladas em `C:\Users\celot\AppData\Local\Android\Sdk\cmdline-tools\latest`.
- JDK 17 preparado localmente em `android-tools/jdk17/jdk-17.0.19+10`.
- Bubblewrap reconhece JDK e SDK via `npx bubblewrap doctor`.
- Projeto TWA gerado em `android/`.
- APK debug gerado em `android/app/build/outputs/apk/debug/app-debug.apk`.
- AAB debug gerado em `android/app/build/outputs/bundle/debug/app-debug.aab`.
- AAB release assinado gerado em `android/app/build/outputs/bundle/release/app-release.aab`.
- APK release nao assinado/alinhado gerado em `android/app-release-unsigned-aligned.apk`.
- Keystore de release criada em `android/queensarena-release.keystore`.
- Password da keystore guardada localmente em `android/keystore-passwords.txt`.
- Digital Asset Links publicado em `https://queensarena-next.vercel.app/.well-known/assetlinks.json`.

## Comandos de build debug

Executar dentro da pasta `android/`:

```powershell
$env:JAVA_HOME='C:\Users\celot\queensarena-next\android-tools\jdk17\jdk-17.0.19+10'
$env:Path="$env:JAVA_HOME\bin;$env:Path"
.\gradlew.bat assembleDebug
.\gradlew.bat bundleDebug
```

## Assinatura atual

- Package name: `com.queensarena`
- SHA-256 publicado no `assetlinks.json`: `0C:4B:7C:15:6A:F9:ED:DD:74:FE:75:C4:66:C7:5B:CA:DC:74:35:F7:AA:CE:75:31:37:61:6B:79:BD:41:F7:14`

Este SHA-256 pertence a chave local usada para assinar o primeiro `.aab`. Se a Play Console ativar Play App Signing com um certificado de app diferente, copiar o SHA-256 da Play Console e atualizar `public/.well-known/assetlinks.json`.

## Ainda falta para Play Store

1. Criar app na Play Console.
2. Carregar `android/app/build/outputs/bundle/release/app-release.aab`.
3. Ativar Play App Signing.
4. Confirmar o SHA-256 final da app signing certificate na Play Console.
5. Atualizar e publicar de novo o `assetlinks.json` se o SHA-256 final for diferente.
6. Preencher Data Safety, classificacao etaria, conteudo da app e ficha da loja.
7. Testar em internal testing.

## Avisos importantes

- Guardar a keystore e a password com muito cuidado, fora do projeto e fora do PC se possivel. Perder a keystore pode bloquear updates se a configuracao de assinatura nao estiver bem definida.
- A ficha Data Safety deve ser revista no momento exato da submissao.
- Se publicidade real estiver ativa, declarar essa recolha/partilha na Play Console.
- Se for contratado fornecedor de dados, confirmar se a licenca permite redistribuir dados dentro da app.
