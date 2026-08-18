import type { Metadata } from "next"
import { InfoPage } from "@/components/info-page"
import { getServerLocale } from "@/lib/server-i18n"

export const metadata: Metadata = {
  title: "Termos",
}

const copy = {
  pt: {
    title: "Termos de utilização",
    description:
      "Regras base para usar a QueensArena enquanto produto de resultados e calendário desportivo.",
    paragraphs: [
      "A QueensArena apresenta informação desportiva para consulta. Apesar de trabalharmos para manter os dados corretos e atualizados, resultados, horários, classificações e estatísticas podem sofrer alterações por decisão das competições, clubes ou fornecedores de dados.",
      "A app não deve ser usada como fonte única para decisões financeiras, apostas, decisões médicas, decisões legais ou qualquer atividade de risco. A informação é disponibilizada para acompanhamento desportivo e consulta editorial.",
      "Marcas, nomes de clubes, competições, logotipos e imagens pertencem aos respetivos titulares. A presença de uma marca ou competição na app não implica patrocínio, afiliação ou autorização comercial, salvo indicação expressa.",
    ],
  },
  en: {
    title: "Terms of use",
    description:
      "Basic rules for using QueensArena as a sports scores and calendar product.",
    paragraphs: [
      "QueensArena presents sports information for consultation. Although we work to keep data correct and updated, results, times, standings and statistics may change by decision of competitions, clubs or data providers.",
      "The app should not be used as the only source for financial decisions, betting, medical decisions, legal decisions or any high-risk activity. The information is provided for sports following and editorial consultation.",
      "Brands, club names, competitions, logos and images belong to their respective owners. The presence of a brand or competition in the app does not imply sponsorship, affiliation or commercial authorization unless expressly stated.",
    ],
  },
}

export default async function TermsPage() {
  const locale = await getServerLocale()
  const t = copy[locale]

  return (
    <InfoPage
      eyebrow="Legal"
      title={t.title}
      description={t.description}
    >
      {t.paragraphs.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </InfoPage>
  )
}

