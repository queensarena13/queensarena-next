const urls = [
  "https://www.ihf.info/competitions/women/307/27th-ihf-womens-world-championship-2025-ger-ned/220823/stage-matches/220889",
  "https://www.ihf.info/competitions/women/307/27th-ihf-womens-world-championship-2025-ger-ned/220823/matches/2025-12-14",
]

function compact(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
}

for (const url of urls) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "QueensArena data importer",
      Accept: "text/html",
    },
  })
  const html = await response.text()
  const marker = 'data-ihf-competitions-match-id="'
  const ids = html
    .split(marker)
    .slice(1)
    .map((part) => part.slice(0, part.indexOf('"')))
  const index = html.indexOf(marker)
  const snippet =
    index >= 0
      ? compact(html.slice(Math.max(0, index - 1000), index + 3500))
      : compact(html.slice(0, 2000))

  console.log(
    JSON.stringify(
      {
        url,
        status: response.status,
        length: html.length,
        matchIds: ids.length,
        sampleIds: ids.slice(0, 10),
        snippet,
      },
      null,
      2
    )
  )
}
