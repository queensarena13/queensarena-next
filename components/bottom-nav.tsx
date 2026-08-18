"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  CalendarDays,
  Home,
  LogIn,
  Shield,
  UserRound,
} from "lucide-react"
import { useLanguage } from "@/components/language-provider"

export function BottomNav() {
  const pathname = usePathname()
  const { dictionary } = useLanguage()

  const items = [
    {
      href: "/",
      label: dictionary.nav.home,
      icon: Home,
    },
    {
      href: "/matches",
      label: dictionary.nav.matches,
      icon: CalendarDays,
    },
    {
      href: "/teams",
      label: dictionary.nav.teams,
      icon: Shield,
    },
    {
      href: "/stats",
      label: dictionary.nav.stats,
      icon: BarChart3,
    },
    {
      href: "/players",
      label: dictionary.nav.players,
      icon: UserRound,
    },
    {
      href: "/login",
      label: dictionary.common.profile,
      icon: LogIn,
    },
  ]

  return (
    <nav className="fixed inset-x-0 bottom-0 z-[10000] border-t border-white/[0.08] bg-[#05080a] px-2 pb-[calc(env(safe-area-inset-bottom)+8px)] pt-2 lg:hidden">
      <div className="mx-auto grid max-w-md grid-cols-6 gap-1">
        {items.map((item) => {
          const Icon = item.icon
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex h-14 min-w-0 flex-col items-center justify-center rounded-lg px-1 text-[10px] font-bold transition ${
                active
                  ? "bg-yellow-400 text-black"
                  : "text-zinc-400 hover:bg-white/[0.05] hover:text-white"
              }`}
            >
              <Icon className="mb-1 h-4 w-4" />
              <span className="max-w-full truncate">
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
