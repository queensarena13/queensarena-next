import { existsSync, readFileSync, statSync } from "node:fs"
import { join } from "node:path"

const expected = {
  applicationId: "com.queensarena",
  versionCode: "3",
  versionName: "1.0.2",
  appName: "QueensArena",
}

const buildGradlePath = join(
  process.cwd(),
  "android/app/build.gradle"
)
const bundlePath = join(
  process.cwd(),
  "android/app/build/outputs/bundle/release/app-release.aab"
)

const failures = []

if (!existsSync(buildGradlePath)) {
  failures.push("android/app/build.gradle missing")
} else {
  const buildGradle = readFileSync(buildGradlePath, "utf8")

  const checks = [
    [
      "applicationId",
      new RegExp(`applicationId\\s+["']${expected.applicationId}["']`),
    ],
    [
      "versionCode",
      new RegExp(`versionCode\\s+${expected.versionCode}\\b`),
    ],
    [
      "versionName",
      new RegExp(`versionName\\s+["']${expected.versionName}["']`),
    ],
    [
      "app name",
      new RegExp(`name:\\s*["']${expected.appName}["']`),
    ],
  ]

  for (const [label, pattern] of checks) {
    if (!pattern.test(buildGradle)) {
      failures.push(`Android ${label} does not match expected value`)
    }
  }
}

if (!existsSync(bundlePath)) {
  failures.push("release AAB missing")
} else {
  const size = statSync(bundlePath).size

  if (size < 500_000) {
    failures.push(`release AAB looks too small: ${size} bytes`)
  }
}

if (failures.length > 0) {
  console.error("Android release verification failed")

  for (const failure of failures) {
    console.error(`FAIL ${failure}`)
  }

  process.exit(1)
}

console.log("Android release verification passed.")
