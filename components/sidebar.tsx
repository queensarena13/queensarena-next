"use client"

import {
  Trophy,
  LayoutDashboard,
  Activity,
  Shield,
  CalendarDays,
  Camera,
} from "lucide-react"
import { useLanguage } from "@/components/language-provider"

export function Sidebar() {
  const { dictionary } = useLanguage()

  const items = [
    {
      label: dictionary.nav.dashboard,
      icon: LayoutDashboard,
    },
    {
      label: dictionary.matches.liveTitle,
      icon: Activity,
    },
    {
      label: dictionary.nav.leagues,
      icon: Trophy,
    },
    {
      label: dictionary.nav.teams,
      icon: Shield,
    },
    {
      label: dictionary.nav.fixtures,
      icon: CalendarDays,
    },
    {
      label: "Instagram",
      icon: Camera,
      href: "https://www.instagram.com/queensarena.app/",
    },
  ]

  return (
    <aside
      className="
        fixed
        left-0
        top-0
        flex
        h-screen
        w-[250px]
        flex-col
        border-r
        border-white/[0.05]
        bg-[#070707]
        p-6
      "
    >
      <div className="mb-10">
        <h1 className="text-2xl font-black tracking-tight text-white">
          {dictionary.common.appName}
        </h1>

        <p className="mt-2 text-sm text-zinc-500">
          {dictionary.home.platformLabel}
        </p>
      </div>

      <nav className="space-y-2">
        {items.map((item) => {
          const Icon = item.icon

          return (
            <a
              key={item.label}
              href={"href" in item ? item.href : "#"}
              target={"href" in item ? "_blank" : undefined}
              rel={"href" in item ? "noreferrer" : undefined}
              className="
                flex
                w-full
                items-center
                gap-4
                rounded-lg
                px-4
                py-4
                text-left
                text-zinc-400
                transition-all
                hover:bg-white/[0.04]
                hover:text-white
              "
            >
              <Icon className="h-5 w-5" />

              <span className="font-medium">
                {item.label}
              </span>
            </a>
          )
        })}
      </nav>

      <div className="mt-auto rounded-lg border border-yellow-500/10 bg-yellow-500/5 p-5 text-sm font-semibold text-yellow-300">
        {dictionary.home.title}
      </div>
    </aside>
  )
}
