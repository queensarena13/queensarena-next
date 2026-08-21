"use client"

import Link from "next/link"
import {
  ArrowRight,
  CalendarDays,
  Dumbbell,
  Shield,
  Sparkles,
  Trophy,
} from "lucide-react"
import { useLanguage } from "@/components/language-provider"

export function Hero() {
  const { dictionary } = useLanguage()
  const actions = [
    {
      href: "/matches",
      label: dictionary.home.modalitiesAction,
      icon: Dumbbell,
      primary: true,
    },
    {
      href: "/leagues",
      label: dictionary.home.competitionsAction,
      icon: Trophy,
      primary: false,
    },
    {
      href: "/teams",
      label: dictionary.home.clubsAction,
      icon: Shield,
      primary: false,
    },
  ]

  return (
    <section className="relative overflow-hidden px-4 pb-8 pt-5 sm:px-6 sm:pb-12 sm:pt-8 lg:px-8 lg:pb-16 lg:pt-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_8%,rgba(246,184,15,0.16),transparent_30%),radial-gradient(circle_at_8%_72%,rgba(244,63,94,0.08),transparent_26%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-80" />

      <div className="relative mx-auto w-full max-w-7xl">
        <div className="rounded-[2rem] border border-white/[0.09] bg-white/[0.035] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.22)] backdrop-blur-sm sm:p-8 lg:p-12">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-yellow-400/25 bg-yellow-400/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-yellow-300">
              <Sparkles className="h-3.5 w-3.5" />
              QueensArena
            </p>

            <h1 className="mt-5 max-w-3xl text-balance text-4xl font-black leading-[0.96] tracking-[-0.04em] text-white sm:text-5xl lg:text-7xl">
              {dictionary.home.title}
            </h1>

            <p className="mt-5 max-w-2xl text-[15px] font-medium leading-7 text-zinc-300 sm:text-lg">
              {dictionary.home.subtitle}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3 text-xs font-bold text-zinc-400">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
                {dictionary.nav.matches}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-black/20 px-3 py-2">
                <CalendarDays className="h-3.5 w-3.5 text-yellow-300" />
                {dictionary.nav.leagues}
              </span>
            </div>

            <div className="mt-8 grid gap-2 sm:grid-cols-3">
              {actions.map((action) => {
                const Icon = action.icon

                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    className={`group flex min-h-14 items-center justify-between gap-3 rounded-2xl border px-4 text-sm font-black transition duration-200 hover:-translate-y-0.5 active:scale-[0.98] ${
                      action.primary
                        ? "border-yellow-300 bg-yellow-400 text-black shadow-[0_12px_28px_rgba(246,184,15,0.18)] hover:bg-yellow-300"
                        : "border-white/[0.1] bg-black/20 text-white hover:border-yellow-400/40 hover:bg-white/[0.06]"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon
                        className={`h-4 w-4 ${
                          action.primary ? "text-black" : "text-yellow-300"
                        }`}
                      />
                      {action.label}
                    </span>
                    <ArrowRight className="h-4 w-4 opacity-50 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
