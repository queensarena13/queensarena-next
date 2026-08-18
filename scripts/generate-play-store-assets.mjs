import fs from "node:fs/promises"
import path from "node:path"
import sharp from "sharp"

const root = path.resolve(import.meta.dirname, "..")
const out = path.join(root, "docs", "play-store", "assets")

const colors = {
  black: "#05080a",
  black2: "#0a0d0f",
  yellow: "#f6b80f",
  white: "#ffffff",
  muted: "#aab0ba",
  panel: "#0d1215",
}

function crown(x, y, scale = 1) {
  const points = [
    [x, y + 32 * scale],
    [x + 8 * scale, y + 5 * scale],
    [x + 27 * scale, y + 22 * scale],
    [x + 45 * scale, y + 3 * scale],
    [x + 63 * scale, y + 22 * scale],
    [x + 82 * scale, y + 5 * scale],
    [x + 90 * scale, y + 32 * scale],
  ]
    .map(([px, py]) => `${px},${py}`)
    .join(" ")

  return `
    <polyline points="${points}" fill="none" stroke="${colors.yellow}" stroke-width="${4 * scale}" stroke-linecap="round" stroke-linejoin="round"/>
    <line x1="${x + 5 * scale}" y1="${y + 43 * scale}" x2="${x + 85 * scale}" y2="${y + 43 * scale}" stroke="${colors.yellow}" stroke-width="${4 * scale}" stroke-linecap="round"/>
  `
}

function text({ x, y, size, fill = colors.white, weight = 700, value }) {
  return `<text x="${x}" y="${y}" fill="${fill}" font-family="Arial, Helvetica, sans-serif" font-size="${size}" font-weight="${weight}" letter-spacing="0">${value}</text>`
}

function card({ x, y, width, height, radius = 24, fill = colors.panel }) {
  return `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${radius}" fill="${fill}"/>`
}

async function writePng(fileName, width, height, body, background = colors.black) {
  await fs.mkdir(out, { recursive: true })
  const svg = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="${background}"/>
          <stop offset="100%" stop-color="#1a1104"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#bg)"/>
      ${body}
    </svg>
  `
  await sharp(Buffer.from(svg, "utf8")).png().toFile(path.join(out, fileName))
}

await writePng(
  "feature-graphic-1024x500.png",
  1024,
  500,
  `
  ${crown(72, 70, 0.9)}
  ${text({ x: 170, y: 120, size: 54, value: "Queens" })}
  ${text({ x: 402, y: 120, size: 54, fill: colors.yellow, value: "Arena" })}
  ${text({ x: 72, y: 235, size: 48, value: "Resultados e calendário" })}
  ${text({ x: 72, y: 295, size: 48, fill: colors.yellow, value: "de desporto feminino" })}
  ${text({ x: 76, y: 358, size: 25, fill: colors.muted, weight: 400, value: "Jogos, equipas e dados reais do desporto feminino." })}
  ${card({ x: 760, y: 120, width: 180, height: 260, radius: 28, fill: "#12161a" })}
  ${card({ x: 785, y: 160, width: 130, height: 38, radius: 10, fill: colors.yellow })}
  ${text({ x: 804, y: 185, size: 15, fill: colors.black, value: "EM DIRETO" })}
  ${text({ x: 796, y: 258, size: 30, value: "NWSL" })}
  ${text({ x: 796, y: 308, size: 30, value: "UWCL" })}
  ${text({ x: 796, y: 358, size: 30, value: "EHF" })}
  `,
)

await writePng(
  "phone-screenshot-1.png",
  1080,
  1920,
  `
  ${crown(80, 90, 1.1)}
  ${text({ x: 190, y: 140, size: 58, value: "Queens" })}
  ${text({ x: 440, y: 140, size: 58, fill: colors.yellow, value: "Arena" })}
  ${text({ x: 80, y: 370, size: 78, value: "The game belongs to" })}
  ${text({ x: 80, y: 492, size: 96, fill: colors.yellow, value: "queens." })}
  ${card({ x: 80, y: 620, width: 860, height: 170 })}
  ${text({ x: 115, y: 676, size: 28, fill: colors.yellow, value: "Próximo jogo" })}
  ${text({ x: 115, y: 735, size: 36, value: "Brest Bretagne vs Gyor Audi ETO KC" })}
  ${text({ x: 115, y: 773, size: 25, fill: colors.muted, weight: 400, value: "EHF Champions League Women" })}
  ${card({ x: 80, y: 860, width: 860, height: 520 })}
  ${text({ x: 115, y: 940, size: 44, value: "Dados reais" })}
  ${text({ x: 115, y: 1048, size: 40, fill: colors.yellow, value: "NWSL" })}
  ${text({ x: 115, y: 1122, size: 34, value: "UEFA Women's Champions League" })}
  ${text({ x: 115, y: 1202, size: 34, value: "EHF Champions League Women" })}
  ${text({ x: 115, y: 1320, size: 30, fill: colors.muted, weight: 400, value: "QueensArena Data API" })}
  `,
)

await writePng(
  "phone-screenshot-2.png",
  1080,
  1920,
  `
  ${crown(80, 90, 1.1)}
  ${text({ x: 80, y: 300, size: 68, value: "Competições" })}
  ${text({ x: 80, y: 390, size: 68, fill: colors.yellow, value: "acompanhadas" })}
  ${card({ x: 80, y: 520, width: 860, height: 190 })}
  ${text({ x: 120, y: 604, size: 46, value: "NWSL" })}
  ${text({ x: 120, y: 652, size: 30, fill: colors.muted, weight: 400, value: "EUA - Futebol feminino" })}
  ${card({ x: 80, y: 760, width: 860, height: 190 })}
  ${text({ x: 120, y: 838, size: 40, value: "UEFA Women's Champions League" })}
  ${text({ x: 120, y: 894, size: 30, fill: colors.muted, weight: 400, value: "Europa - Futebol feminino" })}
  ${card({ x: 80, y: 1000, width: 860, height: 190 })}
  ${text({ x: 120, y: 1078, size: 40, value: "EHF Champions League Women" })}
  ${text({ x: 120, y: 1134, size: 30, fill: colors.muted, weight: 400, value: "Europa - Andebol feminino" })}
  ${card({ x: 80, y: 1320, width: 860, height: 120, fill: colors.yellow })}
  ${text({ x: 226, y: 1390, size: 38, fill: colors.black, value: "Ver jogos e resultados" })}
  `,
  colors.black2,
)

console.log(`Generated Play Store assets in ${out}`)
