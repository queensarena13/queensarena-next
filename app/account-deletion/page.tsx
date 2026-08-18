import type { Metadata } from "next"
import { Mail, Trash2 } from "lucide-react"
import { InfoPage } from "@/components/info-page"
import { getServerLocale } from "@/lib/server-i18n"

export const metadata: Metadata = {
  title: "Eliminar conta",
}

const copy = {
  pt: {
    eyebrow: "Conta",
    title: "Eliminar conta QueensArena",
    description:
      "Podes pedir a eliminação da tua conta e dos dados associados à conta QueensArena através deste contacto.",
    cardTitle: "Pedido de eliminação",
    cardText:
      "Envia-nos o email associado à tua conta. Depois de validarmos o pedido, eliminamos a conta e os dados associados que não tenham de ser mantidos por obrigação legal, segurança ou prevenção de abuso.",
    scope:
      "A eliminação pode abranger dados de autenticação, preferências associadas à conta, favoritos sincronizados, subscrições de notificações e outros dados técnicos diretamente ligados à conta.",
    local:
      "Os favoritos guardados apenas no dispositivo podem ser removidos limpando os dados do site/app no navegador ou dispositivo.",
    action: "Pedir eliminação por email",
    subject:
      "Pedido de eliminação de conta QueensArena",
    body: [
      "Olá QueensArena,",
      "",
      "Quero pedir a eliminação da minha conta e dos dados associados à conta.",
      "",
      "Email da conta:",
      "",
      "Obrigado/a.",
    ],
  },
  en: {
    eyebrow: "Account",
    title: "Delete QueensArena account",
    description:
      "You can request deletion of your QueensArena account and associated data through this contact.",
    cardTitle: "Deletion request",
    cardText:
      "Send us the email associated with your account. After validating the request, we delete the account and associated data that does not need to be kept for legal obligations, security or abuse prevention.",
    scope:
      "Deletion may include authentication data, account preferences, synced favourites, notification subscriptions and other technical data directly linked to the account.",
    local:
      "Favourites stored only on the device can be removed by clearing site/app data in the browser or device.",
    action: "Request deletion by email",
    subject:
      "QueensArena account deletion request",
    body: [
      "Hello QueensArena,",
      "",
      "I want to request deletion of my account and associated account data.",
      "",
      "Account email:",
      "",
      "Thank you.",
    ],
  },
}

export default async function AccountDeletionPage() {
  const locale = await getServerLocale()
  const t = copy[locale]
  const subject = encodeURIComponent(t.subject)
  const body = encodeURIComponent(
    t.body.join("\n")
  )

  return (
    <InfoPage
      eyebrow={t.eyebrow}
      title={t.title}
      description={t.description}
    >
      <div className="rounded-lg border border-white/[0.06] bg-[#0b0b0b] p-5">
        <Trash2 className="h-6 w-6 text-yellow-400" />
        <h2 className="mt-4 text-xl font-black">
          {t.cardTitle}
        </h2>
        <p className="mt-2 text-zinc-400">
          {t.cardText}
        </p>
      </div>

      <p>{t.scope}</p>
      <p>{t.local}</p>

      <a
        href={`mailto:queensarena13@gmail.com?subject=${subject}&body=${body}`}
        className="inline-flex items-center gap-2 rounded-lg bg-yellow-400 px-4 py-3 text-sm font-black text-black transition hover:bg-yellow-300"
      >
        <Mail className="h-4 w-4" />
        {t.action}
      </a>
    </InfoPage>
  )
}

