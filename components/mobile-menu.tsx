"use client"

import {
  BarChart3,
  CalendarDays,
  Camera,
  MessageCircle,
  Home,
  Menu,
  Shield,
  Trophy,
  UserRound,
  X,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { useLanguage } from "@/components/language-provider"

export function MobileMenu() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { dictionary } = useLanguage()

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false)
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [open])


  const items = [
    {
      label: dictionary.nav.home,
      href: "/",
      icon: Home,
    },
    {
      label: dictionary.nav.leagues,
      href: "/leagues",
      icon: Trophy,
    },
    {
      label: dictionary.nav.matches,
      href: "/matches",
      icon: CalendarDays,
    },
    {
      label: dictionary.nav.teams,
      href: "/teams",
      icon: Shield,
    },
    {
      label: dictionary.nav.stats,
      href: "/stats",
      icon: BarChart3,
    },
    {
      label: dictionary.nav.players,
      href: "/players",
      icon: UserRound,
    },
    {
      label: dictionary.common.profile,
      href: "/profile",
      icon: UserRound,
    },
    {
      label: dictionary.footer.feedback,
      href: "/feedback",
      icon: MessageCircle,
    },
    {
      label: "Instagram",
      href: "https://www.instagram.com/queensarena.app/",
      icon: Camera,
      external: true,
    },
  ]

  return (
    <>
      <button
        aria-label="Abrir menu"
        aria-expanded={open}
        aria-controls="mobile-navigation"
        onClick={() => setOpen(true)}
        className="
          flex
          h-12
          w-12
          items-center
          justify-center
          rounded-lg
          border
          border-white/[0.08]
          bg-white/[0.03]
          lg:hidden
        "
        type="button"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <div
          id="mobile-navigation"
          className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Navegação principal"
        >
          <button
            aria-label="Fechar menu"
            className="absolute inset-0 h-full w-full bg-black/20"
            onClick={() => setOpen(false)}
            type="button"
          />

          <div className="absolute left-0 top-0 h-dvh w-[min(360px,92vw)] overflow-y-auto border-r border-yellow-400/15 bg-[#05080a] p-6 shadow-2xl shadow-black motion-safe:animate-[slide-in-left_180ms_ease-out]">
            <div className="mb-10 flex items-center justify-between">
              <h2 className="text-2xl font-black">
                Queens
                <span className="text-yellow-400">
                  Arena
                </span>
              </h2>

              <button
                aria-label="Fechar menu"
                onClick={() => setOpen(false)}
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-lg
                  border
                  border-white/[0.08]
                  bg-white/[0.05]
                "
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="space-y-2">
              {items.map((item) => {
                const Icon = item.icon

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    target={
                      item.external
                        ? "_blank"
                        : undefined
                    }
                    rel={
                      item.external
                        ? "noreferrer"
                        : undefined
                    }
                    onClick={() =>
                      setOpen(false)
                    }
                    aria-current={
                      !item.external &&
                      (item.href === "/"
                        ? pathname === "/"
                        : pathname.startsWith(item.href))
                        ? "page"
                        : undefined
                    }
                    className={`
                      flex
                      items-center
                      gap-3
                      rounded-lg
                      px-4
                      py-4
                      text-lg
                      font-semibold
                      transition-all
                      hover:bg-white/[0.05]
                      ${
                        !item.external &&
                        (item.href === "/"
                          ? pathname === "/"
                          : pathname.startsWith(item.href))
                          ? "bg-yellow-400 text-black"
                          : "text-zinc-200"
                      }
                    `}
                  >
                    <Icon className="h-5 w-5 text-yellow-400" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
