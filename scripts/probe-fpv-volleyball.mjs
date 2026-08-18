const base = "https://www.portugalvoleibol.com/classificacao"

function htmlValues(text) {
  return [...text.matchAll(/value=["']([^"']+)["']/g)].map((match) => match[1])
}

async function get(path) {
  const response = await fetch(`${base}/${path}`, {
    headers: {
      "User-Agent": "QueensArena data importer",
    },
    redirect: "manual",
  })
  const text = await response.text()

  return {
    path,
    status: response.status,
    location: response.headers.get("location") || "",
    length: text.length,
    values: [...new Set(htmlValues(text))],
    forms: [...text.matchAll(/<form[\s\S]*?<\/form>/g)]
      .map((match) => match[0].replace(/\s+/g, " ").slice(0, 500)),
  }
}

async function post(action, body) {
  const response = await fetch(`${base}/${action}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "QueensArena data importer",
    },
    body: new URLSearchParams(body),
  })
  const text = await response.text()

  return {
    action,
    body,
    status: response.status,
    length: text.length,
    dates: (text.match(/Data:&nbsp;|Data:/g) || []).length,
    tables: (text.match(/<table/gi) || []).length,
  }
}

const pages = [
  "index",
  "femdiv1",
  "femdiv2",
  "femdiv3",
  "tpf.php",
  "stfem.php",
  "vpf.php",
  "resultados",
  "calendario",
  "jogos",
]

for (const page of pages) {
  const result = await get(page)
  console.log("\nPAGE", result.path, result.status, result.location, result.length)
  console.log("values", result.values.join(", "))
  for (const form of result.forms.slice(0, 8)) {
    console.log("form", form)
  }
}

const campeonatos = [
  "NSFI",
  "NSFII",
  "NSFIII",
  "TPF",
  "STF",
  "NSFVPC",
]
const fases = [".", "1", "2", "3", "F", "P", "0"]
const series = [".", "A", "B", "C", "D", "A2", "P1", "MF", "34"]

console.log("\nPOST PROBE")
for (const campeonato of campeonatos) {
  for (const fase of fases) {
    for (const serie of series) {
      const result = await post("classificacoes", {
        campeonato,
        fase,
        serie,
      })

      if (result.dates > 0 || result.tables > 1) {
        console.log(JSON.stringify(result))
      }

      await new Promise((resolve) => setTimeout(resolve, 40))
    }
  }
}
