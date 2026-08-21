"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  CalendarDays,
  Home,
  Shield,
  Trophy,
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
      href: "/leagues",
      label: dictionary.nav.leagues,
      icon: Trophy,
    },
    {
      href: "/teams",
      label: dictionary.nav.teams,
      icon: Shield,
    },
    {
      href: "/profile",
      label: dictionary.common.profile,
      icon: UserRound,
    },
  ]

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-[10000] border-t border-white/[0.1] bg-[#05080a]/90 px-2 pb-[calc(env(safe-area-inset-bottom)+8px)] pt-2 shadow-[0_-18px_40px_rgba(0,0,0,0.28)] backdrop-blur-2xl lg:hidden"
    >
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
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
              aria-current={active ? "page" : undefined}
              className={`relative flex min-h-14 min-w-0 flex-col items-center justify-center rounded-2xl px-1 text-[10px] font-bold tracking-tight transition-all duration-200 active:scale-95 ${
                active
                  ? "bg-yellow-400 text-black shadow-[0_8px_20px_rgba(250,204,21,0.2)]"
                  : "text-zinc-400 hover:bg-white/[0.06] hover:text-white"
              }`}
            >
              <Icon className="mb-1 h-[18px] w-[18px]" />
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
