"use client"

import {
  Bell,
  Database,
  Languages,
  ShieldCheck,
} from "lucide-react"
import { useLanguage } from "@/components/language-provider"

export function HomeTrust() {
  const { dictionary } = useLanguage()

  const items = [
    {
      title:
        dictionary.homeTrust.verifiableDataTitle,
      text: dictionary.homeTrust.verifiableDataText,
      icon: Database,
    },
    {
      title: dictionary.homeTrust.languagesTitle,
      text: dictionary.homeTrust.languagesText,
      icon: Languages,
    },
    {
      title:
        dictionary.homeTrust.localFavoritesTitle,
      text: dictionary.homeTrust.localFavoritesText,
      icon: ShieldCheck,
    },
    {
      title:
        dictionary.homeTrust.notificationsTitle,
      text: dictionary.homeTrust.notificationsText,
      icon: Bell,
    },
  ]

  return (
    <section className="mx-auto max-w-7xl px-4 pb-10 lg:px-8">
      <div className="rounded-lg border border-white/[0.06] bg-[#080b0d] p-5">
        <div className="grid gap-4 md:grid-cols-4">
          {items.map((item) => {
            const Icon = item.icon

            return (
              <div key={item.title}>
                <Icon className="h-5 w-5 text-yellow-400" />
                <h2 className="mt-4 text-sm font-black">
                  {item.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-zinc-500">
                  {item.text}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
