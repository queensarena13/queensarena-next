import type { Metadata } from "next"
import Link from "next/link"
import { Download, Globe, RefreshCw, ShieldCheck, Store } from "lucide-react"
import { InfoPage } from "@/components/info-page"
import { getServerLocale } from "@/lib/server-i18n"

export const metadata: Metadata = {
  title: "Instalar app",
  description: "Como instalar a QueensArena e receber atualizações.",
}

const copy = {
  pt: {
    eyebrow: "Instalação",
    title: "Instalar a QueensArena",
    description:
      "A QueensArena pode ser usada no browser, instalada pelo site ou descarregada pela Google Play quando a publicação estiver disponível.",
    playTitle: "Google Play",
    playText:
      "Será o canal principal. Depois da publicação, os updates chegam pela Play Store de forma automática ou manual, conforme as definições do telemóvel.",
    pwaTitle: "Instalar pelo site",
    pwaText:
      "No Chrome/Android, abre o site e escolhe instalar ou adicionar ao ecrã principal. As atualizações web chegam pelo site e a app pode avisar quando houver nova versão.",
    manualTitle: "APK manual",
    manualText:
      "Não é o canal recomendado para público geral. Um APK descarregado diretamente não recebe updates automáticos da Play Store.",
    updateTitle: "Atualizações",
    updateText:
      "Dados, textos, filtros, páginas e correções web podem atualizar sem nova versão Android. Mudanças nativas exigem nova release na Play Store.",
    safeTitle: "Recomendação",
    safeText:
      "Usa a Play Store como canal principal e o site/PWA como alternativa segura enquanto a publicação está disponível.",
    cta: "Abrir QueensArena",
  },
  en: {
    eyebrow: "Install",
    title: "Install QueensArena",
    description:
      "QueensArena can be used in the browser, installed from the website or downloaded from Google Play once publication is available.",
    playTitle: "Google Play",
    playText:
      "This will be the main channel. After publication, updates arrive through Google Play automatically or manually depending on device settings.",
    pwaTitle: "Install from the website",
    pwaText:
      "On Chrome/Android, open the website and choose install or add to home screen. Web updates arrive through the site and the app can show a new version prompt.",
    manualTitle: "Manual APK",
    manualText:
      "This is not recommended for the general public. A directly downloaded APK does not receive automatic Play Store updates.",
    updateTitle: "Updates",
    updateText:
      "Data, copy, filters, pages and web fixes can update without a new Android version. Native changes require a new Play Store release.",
    safeTitle: "Recommendation",
    safeText:
      "Use Google Play as the main channel and the website/PWA as the safe alternative while publication is available.",
    cta: "Open QueensArena",
  },
}

export default async function InstallPage() {
  const locale = await getServerLocale()
  const t = copy[locale]

  const cards = [
    { title: t.playTitle, text: t.playText, icon: Store },
    { title: t.pwaTitle, text: t.pwaText, icon: Globe },
    { title: t.manualTitle, text: t.manualText, icon: Download },
    { title: t.updateTitle, text: t.updateText, icon: RefreshCw },
    { title: t.safeTitle, text: t.safeText, icon: ShieldCheck },
  ]

  return (
    <InfoPage eyebrow={t.eyebrow} title={t.title} description={t.description}>
      <section className="grid gap-4 md:grid-cols-2">
        {cards.map((card) => {
          const Icon = card.icon

          return (
            <article
              key={card.title}
              className="rounded-lg border border-white/[0.06] bg-[#0b0b0b] p-5"
            >
              <Icon className="h-6 w-6 text-yellow-400" />
              <h2>{card.title}</h2>
              <p>{card.text}</p>
            </article>
          )
        })}
      </section>

      <Link
        href="/"
        className="inline-flex rounded-lg bg-yellow-400 px-5 py-3 font-black text-black transition hover:bg-yellow-300"
      >
        {t.cta}
      </Link>
    </InfoPage>
  )
}
