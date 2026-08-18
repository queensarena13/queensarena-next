import crypto from "node:crypto"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import { resolve } from "node:path"
import {
  BufferedLog,
  ConsoleLog,
  TwaGenerator,
  TwaManifest,
} from "@bubblewrap/core"

const targetDirectory = resolve("android")
const manifestFile = resolve(
  targetDirectory,
  "twa-manifest.json"
)

await mkdir(targetDirectory, { recursive: true })

const twaManifest = new TwaManifest({
  packageId: "com.queensarena",
  host: "queensarena-next.vercel.app",
  name: "QueensArena",
  launcherName: "QueensArena",
  display: "standalone",
  themeColor: "#f6b80f",
  themeColorDark: "#05080a",
  navigationColor: "#05080a",
  navigationColorDark: "#05080a",
  navigationDividerColor: "#05080a",
  navigationDividerColorDark: "#05080a",
  backgroundColor: "#05080a",
  enableNotifications: true,
  startUrl: "/",
  iconUrl:
    "https://queensarena-next.vercel.app/queen-logo.png",
  maskableIconUrl:
    "https://queensarena-next.vercel.app/queen-logo.png",
  splashScreenFadeOutDuration: 300,
  appVersion: "1.0.0",
  appVersionCode: 1,
  signingKey: {
    path: "./queensarena-release.keystore",
    alias: "queensarena",
  },
  fallbackType: "customtabs",
  orientation: "portrait",
  generatorApp: "bubblewrap-cli",
  webManifestUrl:
    "https://queensarena-next.vercel.app/manifest.webmanifest",
  shortcuts: [],
  fingerprints: [],
})

const validationError = twaManifest.validate()

if (validationError) {
  throw new Error(validationError)
}

await twaManifest.saveToFile(manifestFile)

const generator = new TwaGenerator()
const log = new BufferedLog(
  new ConsoleLog("Generating TWA")
)

await generator.createTwaProject(
  targetDirectory,
  twaManifest,
  log
)

log.flush()

const manifestContents = await readFile(manifestFile)
const checksum = crypto
  .createHash("sha1")
  .update(manifestContents)
  .digest("hex")

await writeFile(
  resolve(targetDirectory, "manifest-checksum.txt"),
  checksum
)

console.log(
  `Generated Android TWA project at ${targetDirectory}`
)
