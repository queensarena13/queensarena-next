"use client"

import Link from "next/link"
import {
  BarChart3,
  Radio,
  Shield,
  Trophy,
} from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import {
  TRACKED_COMPETITIONS,
  TRACKED_TEAMS,
} from "@/lib/sports-config"

export function StatsGrid() {
  const { dictionary } = useLanguage()

  const stats = [
    {
      icon: Trophy,
      value: String(
        TRACKED_COMPETITIONS.length
      ),
      label: dictionary.stats.competitions,
      href: "/leagues",
    },
    {
      icon: BarChart3,
      value: dictionary.common.officialData,
      label: dictionary.stats.matches,
      href: "/matches",
    },
    {
      icon: Shield,
      value: String(TRACKED_TEAMS.length),
      label: dictionary.stats.teams,
      href: "/teams",
    },
    {
      icon: Radio,
      value: "2020-2026",
      label: dictionary.stats.liveCoverage,
      href: "/stats",
    },
  ]

  return (
    <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon

        return (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-lg border border-white/[0.05] bg-[#071015] p-5 transition hover:border-yellow-400/25"
          >
            <div className="flex items-center justify-between gap-4">
              <Icon className="h-5 w-5 text-yellow-400" />

              <span className="text-xs font-semibold uppercase text-zinc-500">
                {stat.label}
              </span>
            </div>

            <h3 className="mt-6 text-2xl font-black tracking-tight md:text-3xl">
              {stat.value}
            </h3>
          </Link>
        )
      })}
    </section>
  )
}
