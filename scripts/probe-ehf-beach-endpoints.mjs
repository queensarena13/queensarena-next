const urls = [
  "https://beachticker.ehf.eu/main.4718cebc6442fac8.js",
]

for (const url of urls) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "QueensArena data probe",
    },
  })

  if (!response.ok) {
    throw new Error(`${url} HTTP ${response.status}`)
  }

  const text = await response.text()
  const matches = new Set()

  for (const match of text.matchAll(
    /https?:\/\/[^"'`\\\s)]+|\/[A-Za-z0-9_./-]*(?:api|match|competition|tournament|game|event)[A-Za-z0-9_./-]*/gi
  )) {
    matches.add(match[0])
  }

  console.log(`\n${url}`)
  console.log([...matches].sort().join("\n"))
}
