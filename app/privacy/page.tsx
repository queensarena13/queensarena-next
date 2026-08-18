import type { Metadata } from "next"
import Link from "next/link"
import { InfoPage } from "@/components/info-page"
import { getServerLocale } from "@/lib/server-i18n"

export const metadata: Metadata = {
  title: "Privacidade",
}

const copy = {
  pt: {
    title: "Política de privacidade",
    description:
      "Informação sobre dados pessoais, conta, notificações, analítica, publicidade e tratamento técnico de dados na QueensArena.",
    intro:
      "A QueensArena é uma app de resultados, calendário, equipas e dados de desporto feminino. Esta política explica como a app trata dados pessoais e técnicos, em conformidade com o RGPD e a Lei n.o 58/2019 em Portugal.",
    dataTitle: "Dados tratados",
    dataText:
      "Os favoritos podem ser guardados no próprio dispositivo. Se criares conta, a app pode tratar o teu email, identificadores de autenticação e dados técnicos necessários para manter sessão, guardar preferências e associar funcionalidades à conta.",
    notifications:
      "Se ativares notificações, a app pode guardar identificadores técnicos do dispositivo/navegador necessários para enviar alertas sobre jogos, resultados ou equipas favoritas.",
    analyticsTitle: "Analítica e publicidade",
    analytics:
      "Quando houver consentimento, a QueensArena pode tratar dados técnicos de analítica, como página visitada, origem de tráfego, idioma, dimensão aproximada do ecrã e agente do navegador. Estes dados ajudam a perceber crescimento e estabilidade do produto.",
    ads:
      "A publicidade usa fornecedores configurados pela QueensArena apenas quando existir consentimento aplicável. A app evita formatos intrusivos e privilegia espaços discretos.",
    suppliersTitle: "Partilha e fornecedores",
    suppliers:
      "A QueensArena pode usar fornecedores técnicos para alojamento, base de dados, autenticação, notificações, analítica, publicidade e entrega da app. Estes fornecedores tratam dados apenas na medida necessária para disponibilizar e proteger o serviço.",
    rightsTitle: "Direitos e eliminação de conta",
    rights:
      "Nos termos do RGPD, os titulares dos dados podem exercer os seus direitos de acesso, retificação, apagamento, limitação, oposição e portabilidade, quando aplicável.",
    deletionLead:
      "Podes pedir a eliminação da conta e dos dados associados em",
    contactLead:
      "O contacto para pedidos sobre dados e",
    authority:
      "Se considerares que os teus direitos não foram respeitados, podes contactar a Comissão Nacional de Proteção de Dados (CNPD), a autoridade portuguesa de controlo em matéria de proteção de dados.",
  },
  en: {
    title: "Privacy policy",
    description:
      "Information about personal data, accounts, notifications, analytics, advertising and technical data processing in QueensArena.",
    intro:
      "QueensArena is an app for women's sports scores, calendars, teams and data. This policy explains how the app processes personal and technical data under GDPR and Portuguese Law no. 58/2019.",
    dataTitle: "Data processed",
    dataText:
      "Favourites may be stored on the device itself. If you create an account, the app may process your email, authentication identifiers and technical data needed to maintain the session, save preferences and associate features with the account.",
    notifications:
      "If you enable notifications, the app may store technical device/browser identifiers needed to send alerts about matches, results or favourite teams.",
    analyticsTitle: "Analytics and advertising",
    analytics:
      "When there is consent, QueensArena may process technical analytics data, such as visited page, traffic source, language, approximate screen size and browser agent. This data helps us understand growth and product stability.",
    ads:
      "Advertising uses providers configured by QueensArena only when applicable consent exists. The app avoids intrusive formats and prioritizes discreet spaces.",
    suppliersTitle: "Sharing and suppliers",
    suppliers:
      "QueensArena may use technical providers for hosting, database, authentication, notifications, analytics, advertising and app delivery. These providers process data only as needed to provide and protect the service.",
    rightsTitle: "Rights and account deletion",
    rights:
      "Under GDPR, data subjects may exercise their rights of access, rectification, erasure, restriction, objection and portability where applicable.",
    deletionLead:
      "You can request deletion of your account and associated data at",
    contactLead:
      "The contact for data requests is",
    authority:
      "If you believe your rights have not been respected, you may contact the Portuguese Data Protection Authority, CNPD.",
  },
}

export default async function PrivacyPage() {
  const locale = await getServerLocale()
  const t = copy[locale]

  return (
    <InfoPage
      eyebrow="Legal"
      title={t.title}
      description={t.description}
    >
      <p>{t.intro}</p>

      <h2>{t.dataTitle}</h2>
      <p>{t.dataText}</p>
      <p>{t.notifications}</p>

      <h2>{t.analyticsTitle}</h2>
      <p>{t.analytics}</p>
      <p>{t.ads}</p>

      <h2>{t.suppliersTitle}</h2>
      <p>{t.suppliers}</p>

      <h2>{t.rightsTitle}</h2>
      <p>{t.rights}</p>

      <p>
        {t.deletionLead}{" "}
        <Link href="/account-deletion">
          /account-deletion
        </Link>
        . {t.contactLead}{" "}
        <a href="mailto:queensarena13@gmail.com">
          queensarena13@gmail.com
        </a>
        .
      </p>

      <p>{t.authority}</p>
    </InfoPage>
  )
}

