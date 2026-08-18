# QueensArena Current Play Release

## Android bundle

- File: `android/app/build/outputs/bundle/release/app-release.aab`
- Package name: `com.queensarena`
- Version name: `1.0.2`
- Version code: `3`
- App type: Trusted Web Activity
- Host: `queensarena-next.vercel.app`
- Launch URL: `https://queensarena-next.vercel.app/`
- Target SDK: `35`
- Min SDK: `21`
- Compile SDK: `36`

## App identity

- App name: `QueensArena`
- Category: `Sports`
- Default language: `Portuguese (Portugal)`
- Price: `Free`
- Contact email: `queensarena13@gmail.com`

## Public URLs

- Website: `https://queensarena-next.vercel.app`
- Privacy policy: `https://queensarena-next.vercel.app/privacy`
- Account deletion: `https://queensarena-next.vercel.app/account-deletion`
- Digital Asset Links: `https://queensarena-next.vercel.app/.well-known/assetlinks.json`
- Ads.txt: `https://queensarena-next.vercel.app/ads.txt`
- App-ads.txt: `https://queensarena-next.vercel.app/app-ads.txt`

## Current assetlinks fingerprint

```text
8B:6B:D8:8E:E6:2D:3D:6C:AC:29:F9:6F:38:6E:33:93:0A:DB:12:A3:B7:A8:E9:0E:FA:4D:F6:FA:B3:4F:98:57
```

After uploading the bundle, compare this with the **Play App Signing** SHA-256 shown by Play Console. If Google shows a different SHA-256, update `public/.well-known/assetlinks.json` and redeploy before testing.

## Verified before submission

Command:

```text
npm run verify:launch
```

Last verified:

- Android release bundle exists.
- Public URLs respond with HTTP 200.
- Public data API passes thresholds.
- Data quality passes.
- Competition links pass.
- Android release verification passes.
