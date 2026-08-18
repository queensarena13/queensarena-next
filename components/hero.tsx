"use client"

import Link from "next/link"
import {
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
    <section className="relative overflow-hidden border-b border-white/[0.05] bg-[#020304] px-4 py-10 lg:px-8 lg:py-12">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-yellow-400/70 to-transparent" />
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-yellow-400/[0.08] to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-rose-400/[0.05] to-transparent" />

      <div className="relative mx-auto w-full max-w-7xl">
        <div className="max-w-3xl">
          <p className="inline-flex items-center gap-2 rounded-md border border-yellow-400/20 bg-yellow-400/10 px-3 py-2 text-xs font-black uppercase text-yellow-300">
            <Sparkles className="h-3.5 w-3.5" />
            QueensArena
          </p>

          <h1 className="mt-5 max-w-3xl text-balance text-4xl font-black leading-[0.98] tracking-normal text-white md:text-6xl">
            <span className="text-white">
              {dictionary.home.title}
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-base font-semibold leading-7 text-zinc-300 md:text-lg">
            {dictionary.home.subtitle}
          </p>

          <div className="mt-6 grid max-w-2xl gap-2 sm:grid-cols-3">
            {actions.map((action) => {
              const Icon = action.icon

              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className={`flex min-h-14 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-black transition ${
                    action.primary
                      ? "border-yellow-400 bg-yellow-400 text-black hover:bg-yellow-300"
                      : "border-white/[0.08] bg-white/[0.03] text-white hover:border-yellow-400/30 hover:bg-white/[0.06]"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 ${
                      action.primary
                        ? "text-black"
                        : "text-yellow-400"
                    }`}
                  />
                  {action.label}
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
