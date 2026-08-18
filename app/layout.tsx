import type { Metadata } from "next"
import Script from "next/script"
import { BottomNav } from "@/components/bottom-nav"
import { ConsentBanner } from "@/components/consent-banner"
import { Footer } from "@/components/footer"
import { GrowthAnalytics } from "@/components/growth-analytics"
import { LanguageProvider } from "@/components/language-provider"
import { PwaRegister } from "@/components/pwa-register"
import { Topbar } from "@/components/topbar"
import { adsenseClient } from "@/lib/ads"
import { toHtmlLang } from "@/lib/i18n"
import { getServerLocale } from "@/lib/server-i18n"
import "./globals.css"

export const metadata: Metadata = {
  title: {
    default: "QueensArena",
    template: "%s | QueensArena",
  },
  description:
    "QueensArena: resultados, calendário e dados de desporto feminino com cobertura real disponível e novas competições em expansão.",
  manifest: "/manifest.webmanifest",
  applicationName: "QueensArena",
  other: {
    "google-adsense-account": adsenseClient,
  },
  metadataBase: new URL(
    "https://queensarena-next.vercel.app"
  ),
  openGraph: {
    title: "QueensArena",
    description:
      "Women's football, futsal and handball scores, fixtures, standings and stats.",
    url: "https://queensarena-next.vercel.app",
    siteName: "QueensArena",
    images: [
      {
        url: "/queen-logo.png",
        width: 512,
        height: 512,
        alt: "QueensArena",
      },
    ],
    locale: "pt_PT",
    type: "website",
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getServerLocale()
  return (
    <html
      lang={toHtmlLang(locale)}
      className="h-full antialiased"
    >
      <body className="flex min-h-full flex-col">
        {adsenseClient ? (
          <Script
            id="queensarena-adsense"
            strategy="beforeInteractive"
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
            crossOrigin="anonymous"
          />
        ) : null}
        <LanguageProvider initialLocale={locale}>
          <div className="min-h-screen bg-[#05080a] pb-20 text-white lg:pb-0">
            <Topbar />
            {children}
            <Footer />
            <BottomNav />
            <PwaRegister />
            <GrowthAnalytics />
            <ConsentBanner />
          </div>
        </LanguageProvider>
      </body>
    </html>
  )
}

