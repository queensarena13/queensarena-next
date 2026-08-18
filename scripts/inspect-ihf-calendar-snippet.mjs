const html = await fetch("https://www.ihf.info/").then((response) =>
  response.text()
)
const defaultDate = html.lastIndexOf("defaultDate")

for (const pattern of ["events:[", "events: [", '"events":[']) {
  console.log(pattern, html.lastIndexOf(pattern, defaultDate))
}

const lastEvents = html.lastIndexOf("events", defaultDate)
console.log(
  html.slice(Math.max(0, lastEvents - 100), lastEvents + 100)
)
