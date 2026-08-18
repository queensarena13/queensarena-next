"use client"

import Link from "next/link"
import {
  BarChart3,
  Bell,
  CalendarDays,
  Heart,
  Shield,
  Trophy,
  UserRound,
} from "lucide-react"
import { useLanguage } from "@/components/language-provider"

export function HomeTopics() {
  const { dictionary } = useLanguage()

  const topics = [
    {
      href: "/matches",
      title: dictionary.common.live,
      description: dictionary.homeTopics.live,
      icon: Bell,
      featured: true,
    },
    {
      href: "/matches",
      title: dictionary.nav.fixtures,
      description:
        dictionary.homeTopics.fixtures,
      icon: CalendarDays,
    },
    {
      href: "/stats",
      title: dictionary.standings.title,
      description:
        dictionary.homeTopics.standings,
      icon: BarChart3,
    },
    {
      href: "/teams",
      title: dictionary.nav.teams,
      description: dictionary.homeTopics.teams,
      icon: Shield,
    },
    {
      href: "/players",
      title: dictionary.nav.players,
      description: dictionary.homeTopics.players,
      icon: UserRound,
    },
    {
      href: "/leagues",
      title: dictionary.nav.leagues,
      description: dictionary.homeTopics.leagues,
      icon: Trophy,
    },
    {
      href: "/teams#favorites",
      title: dictionary.common.favorites,
      description:
        dictionary.homeTopics.favorites,
      icon: Heart,
    },
  ]

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {topics.map((topic) => {
          const Icon = topic.icon

          return (
            <Link
              key={topic.href + topic.title}
              href={topic.href}
              className={`group rounded-lg border p-5 transition ${
                topic.featured
                  ? "border-yellow-400 bg-yellow-400 text-black"
                  : "border-white/[0.06] bg-[#0b0b0b] text-white hover:border-yellow-400/25"
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <Icon
                  className={`h-6 w-6 ${
                    topic.featured
                      ? "text-black"
                      : "text-yellow-400"
                  }`}
                />
                <span
                  className={`text-xs font-bold uppercase ${
                    topic.featured
                      ? "text-black/60"
                      : "text-zinc-500"
                  }`}
                >
                  QueensArena
                </span>
              </div>

              <h2 className="mt-8 text-2xl font-black">
                {topic.title}
              </h2>

              <p
                className={`mt-2 text-sm leading-6 ${
                  topic.featured
                    ? "text-black/70"
                    : "text-zinc-500"
                }`}
              >
                {topic.description}
              </p>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
