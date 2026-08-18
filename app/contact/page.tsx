import type { Metadata } from "next"
import {
  Camera,
  Mail,
} from "lucide-react"
import { InfoPage } from "@/components/info-page"
import { getServerLocale } from "@/lib/server-i18n"

export const metadata: Metadata = {
  title: "Contacto",
}

const copy = {
  pt: {
    eyebrow: "Contacto",
    title: "Fala com a QueensArena",
    description:
      "Para correção de dados, parcerias, imprensa ou sugestões sobre o produto.",
    instagram: "Instagram oficial",
    note:
      "Este email pode ser usado para correção de dados, contactos de clubes, sugestões de utilizadores, imprensa e propostas de parceria.",
  },
  en: {
    eyebrow: "Contact",
    title: "Talk to QueensArena",
    description:
      "For data corrections, partnerships, press or product suggestions.",
    instagram: "Official Instagram",
    note:
      "This email can be used for data corrections, club contacts, user suggestions, press and partnership proposals.",
  },
}

export default async function ContactPage() {
  const locale = await getServerLocale()
  const t = copy[locale]

  return (
    <InfoPage
      eyebrow={t.eyebrow}
      title={t.title}
      description={t.description}
    >
      <div className="rounded-lg border border-white/[0.06] bg-[#0b0b0b] p-5">
        <Mail className="h-6 w-6 text-yellow-400" />
        <h2 className="mt-4 text-xl font-black">
          Email
        </h2>
        <a
          href="mailto:queensarena13@gmail.com"
          className="mt-2 inline-flex"
        >
          queensarena13@gmail.com
        </a>
      </div>

      <div className="rounded-lg border border-white/[0.06] bg-[#0b0b0b] p-5">
        <Camera className="h-6 w-6 text-yellow-400" />
        <h2 className="mt-4 text-xl font-black">
          {t.instagram}
        </h2>
        <a
          href="https://www.instagram.com/queensarena.app/"
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex"
        >
          @queensarena.app
        </a>
      </div>

      <p>{t.note}</p>
    </InfoPage>
  )
}
