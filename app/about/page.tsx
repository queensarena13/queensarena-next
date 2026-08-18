import type { Metadata } from "next"
import { InfoPage } from "@/components/info-page"
import { getServerLocale } from "@/lib/server-i18n"

export const metadata: Metadata = {
  title: "Sobre",
}

const copy = {
  pt: {
    title: "Sobre a QueensArena",
    description:
      "A QueensArena é uma app dedicada a resultados, calendário, classificações, equipas e jogadoras de desporto feminino.",
    paragraphs: [
      "A primeira fase foca-se em futebol feminino de Portugal, Europa e EUA, com espaco para andebol feminino. O objetivo e juntar informação dispersa num produto rapido, simples e pensado para telemóvel.",
      "A comunidade oficial esta tambem no Instagram em",
    ],
  },
  en: {
    title: "About QueensArena",
    description:
      "QueensArena is an app dedicated to women's sports scores, calendars, standings, teams and players.",
    paragraphs: [
      "The first phase focuses on women's football in Portugal, Europe and the USA, with space for women's handball. The goal is to bring scattered information into a fast, simple, mobile-first product.",
      "The official community is also on Instagram at",
    ],
  },
}

export default async function AboutPage() {
  const locale = await getServerLocale()
  const t = copy[locale]

  return (
    <InfoPage
      eyebrow="QueensArena"
      title={t.title}
      description={t.description}
    >
      <p>{t.paragraphs[0]}</p>

      <p>
        {t.paragraphs[1]}{" "}
        <a
          href="https://www.instagram.com/queensarena.app/"
          target="_blank"
          rel="noreferrer"
        >
          @queensarena.app
        </a>
        .
      </p>
    </InfoPage>
  )
}

