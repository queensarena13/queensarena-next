"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  BarChart3,
  CalendarDays,
  Home,
  LogIn,
  Search,
  Shield,
  Trophy,
  UserRound,
  X,
} from "lucide-react"
import { LanguageSwitcher } from "@/components/language-switcher"
import { MobileMenu } from "@/components/mobile-menu"
import { NotificationsPanel } from "@/components/notifications-panel"
import { useLanguage } from "@/components/language-provider"
import { SearchBar } from "@/components/search-bar"

const navIconClass = "h-4 w-4"

export function Topbar() {
  const pathname = usePathname()
  const { dictionary } = useLanguage()
  const [searchOpen, setSearchOpen] = useState(false)

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
      href: "/players",
      label: dictionary.nav.players,
      icon: UserRound,
    },
    {
      href: "/stats",
      label: dictionary.nav.stats,
      icon: BarChart3,
    },
  ]

  return (
    <header className="sticky top-0 z-[9000] border-b border-white/[0.08] bg-[#05080a]/95 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          aria-label="QueensArena"
          className="flex min-w-0 shrink-0 items-center gap-3"
        >
          <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-white/[0.08] bg-black">
            <Image
              src="/queen-logo.png"
              alt=""
              fill
              sizes="48px"
              className="object-cover"
              priority
            />
          </span>
          <span className="hidden whitespace-nowrap text-2xl font-black leading-none text-white sm:block">
            Queens
            <span className="text-yellow-400">
              Arena
            </span>
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-1 lg:flex">
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
                className={`inline-flex h-11 items-center gap-2 rounded-lg px-4 text-sm font-black transition ${
                  active
                    ? "bg-yellow-400 text-black"
                    : "text-zinc-300 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                <Icon className={navIconClass} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-2">
          <button
            type="button"
            aria-label="Pesquisar jogos"
            onClick={() => setSearchOpen((value) => !value)}
            className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-zinc-300 transition hover:bg-white/[0.06] hover:text-white"
          >
            {searchOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Search className="h-5 w-5" />
            )}
          </button>
          <NotificationsPanel />
          <LanguageSwitcher />
          <Link
            href="/profile"
            aria-label={dictionary.common.profile}
            className={`hidden h-11 items-center gap-2 rounded-lg border px-3 text-sm font-black transition sm:inline-flex ${
              pathname.startsWith("/profile") ||
              pathname.startsWith("/login")
                ? "border-yellow-400 bg-yellow-400 text-black"
                : "border-white/[0.08] bg-white/[0.03] text-zinc-300 hover:bg-white/[0.06] hover:text-white"
            }`}
          >
            <LogIn className="h-4 w-4" />
            {dictionary.common.profile}
          </Link>
          <MobileMenu />
        </div>
      </div>
      {searchOpen ? (
        <div className="border-t border-white/[0.08] bg-[#05080a]/98 px-4 py-4 shadow-2xl sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <SearchBar autoFocus />
          </div>
        </div>
      ) : null}
    </header>
  )
}
