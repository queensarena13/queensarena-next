import type { Metadata } from "next"
import { InfoPage } from "@/components/info-page"
import { getServerLocale } from "@/lib/server-i18n"

export const metadata: Metadata = {
  title: "Cookies",
}

const copy = {
  pt: {
    eyebrow: "Privacidade",
    title: "Política de cookies",
    description:
      "Informação simples sobre cookies, armazenamento local, analítica, publicidade e consentimento na QueensArena.",
    paragraphs: [
      "A QueensArena usa armazenamento local e cookies técnicos para guardar preferências essenciais, como idioma, favoritos no dispositivo, sessão e estado do consentimento.",
      "A analítica só é ativada quando houver consentimento. Pode ser usada para medir páginas vistas, crescimento, origem de tráfego, tipo de dispositivo e utilização geral da app.",
      "A publicidade só é carregada quando houver consentimento e configuração ativa. A integração preparada usa Google AdSense, com anúncios discretos e espaços limitados para não prejudicar a experiência no telemóvel.",
      "Podes alterar a tua escolha limpando os dados do site no navegador. A próxima versão deve incluir um painel permanente de preferências dentro da app.",
    ],
  },
  en: {
    eyebrow: "Privacy",
    title: "Cookie policy",
    description:
      "Simple information about cookies, local storage, analytics, advertising and consent in QueensArena.",
    paragraphs: [
      "QueensArena uses local storage and technical cookies to save essential preferences, such as language, device favourites, session and consent status.",
      "Analytics is only enabled when there is consent. It may be used to measure page views, growth, traffic source, device type and general app usage.",
      "Advertising is only loaded when there is consent and active configuration. The prepared integration uses Google AdSense, with discreet ads and limited spaces so the mobile experience is not harmed.",
      "You can change your choice by clearing site data in the browser. A future version should include a permanent preferences panel inside the app.",
    ],
  },
}

export default async function CookiesPage() {
  const locale = await getServerLocale()
  const t = copy[locale]

  return (
    <InfoPage
      eyebrow={t.eyebrow}
      title={t.title}
      description={t.description}
    >
      {t.paragraphs.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </InfoPage>
  )
}

