const baseUrl = process.env.AUDIT_BASE_URL || "http://localhost:3010"
const paths = [
  "/",
  "/install",
  "/about",
  "/privacy",
  "/terms",
  "/cookies",
  "/contact",
  "/account-deletion",
  "/sources",
  "/data-partnerships",
  "/leagues",
  "/leagues?sport=football",
  "/leagues?sport=handball",
  "/matches",
  "/teams",
  "/players",
  "/stats",
  "/login",
  "/profile",
  "/manifest.webmanifest",
]

const badPatterns = [
  /\uFFFD|ï¿½|Ã[\u0080-\u00bf¡-¿]|Â[\u0080-\u00bf¡-¿]/,
  /localhost:3000/i,
  /NaN/,
]

let failed = false

for (const path of paths) {
  const url = `${baseUrl}${path}`
  const response = await fetch(url)
  const text = await response.text()
  const hits = badPatterns
    .filter((pattern) => pattern.test(text))
    .map((pattern) => pattern.toString())

  if (!response.ok || hits.length > 0) {
    failed = true
    console.error(`FAIL ${path} ${response.status} ${hits.join(", ")}`)

    for (const pattern of badPatterns) {
      const match = text.match(pattern)
      if (!match) continue

      const index = match.index || 0
      console.error(
        text
          .slice(Math.max(0, index - 120), index + 180)
          .replace(/\s+/g, " ")
      )
    }
  } else {
    console.log(`OK ${path}`)
  }
}

if (failed) {
  process.exit(1)
}
