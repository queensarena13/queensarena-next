"use client"

import Link from "next/link"
import {
  Camera,
  Crown,
} from "lucide-react"
import { useLanguage } from "@/components/language-provider"

export function Footer() {
  const { dictionary } = useLanguage()

  const links = [
    {
      href: "/about",
      label: dictionary.footer.about,
    },
    {
      href: "/account-deletion",
      label: dictionary.footer.accountDeletion,
    },
    {
      href: "/advertise",
      label: dictionary.footer.advertise,
    },
    {
      href: "/contact",
      label: dictionary.footer.contact,
    },
    {
      href: "/cookies",
      label: dictionary.footer.cookies,
    },
    {
      href: "/sources",
      label: dictionary.footer.sources,
    },
    {
      href: "/editorial-policy",
      label: dictionary.footer.editorialPolicy,
    },
    {
      href: "/feedback",
      label: dictionary.footer.feedback,
    },
    {
      href: "/install",
      label:
        dictionary.common.profile === "Perfil"
          ? "Instalar app"
          : "Install app",
    },
    {
      href: "/privacy",
      label: dictionary.footer.privacy,
    },
    {
      href: "/terms",
      label: dictionary.footer.terms,
    },
    {
      href: "/watch",
      label: dictionary.footer.watch,
    },
  ].sort((a, b) =>
    a.label.localeCompare(b.label, undefined, {
      sensitivity: "base",
    })
  )

  return (
    <footer className="border-t border-white/[0.06] bg-[#05080a] px-4 py-8 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Crown className="h-8 w-8 text-yellow-400" />
          <div>
            <p className="text-lg font-black">
              Queens
              <span className="text-yellow-400">
                Arena
              </span>
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              {dictionary.footer.tagline}
            </p>
          </div>
        </div>

        <nav className="flex flex-wrap gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-bold text-zinc-400 transition hover:bg-white/[0.05] hover:text-white"
            >
              {link.label}
            </Link>
          ))}
          <a
            href="https://www.instagram.com/queensarena.app/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-zinc-400 transition hover:bg-white/[0.05] hover:text-white"
          >
            <Camera className="h-4 w-4" />
            Instagram
          </a>
        </nav>
      </div>
    </footer>
  )
}
