"use client"

import { Camera, ExternalLink, Heart } from "lucide-react"
import { useLanguage } from "@/components/language-provider"

export function InstagramCta() {
  const { dictionary } = useLanguage()

  return (
    <section className="mx-auto max-w-7xl px-4 py-4 lg:px-8">
      <a
        href="https://www.instagram.com/queensarena.app/"
        target="_blank"
        rel="noreferrer"
        className="group flex flex-col gap-4 rounded-lg border border-yellow-400/20 bg-gradient-to-r from-[#11100a] via-[#090b0d] to-[#12090d] p-4 transition hover:border-yellow-400/50 sm:flex-row sm:items-center sm:justify-between"
      >
        <span className="flex items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-yellow-400 text-black">
            <Camera className="h-5 w-5" />
          </span>
          <span>
            <span className="flex items-center gap-2 text-sm font-black text-white">
              {dictionary.instagram.title}
              <Heart className="h-4 w-4 text-yellow-300" />
            </span>
            <span className="mt-1 block text-xs font-semibold text-zinc-400">
              {dictionary.instagram.description}
            </span>
          </span>
        </span>

        <span className="inline-flex items-center justify-center gap-2 rounded-lg bg-yellow-400 px-4 py-3 text-sm font-black text-black transition group-hover:bg-yellow-300">
          {dictionary.instagram.action}
          <ExternalLink className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </span>
      </a>
    </section>
  )
}
