"use client"

import Link from "next/link"
import { MessageCircle, Rocket } from "lucide-react"
import { useLanguage } from "@/components/language-provider"

export function BetaBanner() {
  const { dictionary } = useLanguage()

  return (
    <section className="border-b border-yellow-500/15 bg-yellow-500/10 px-4 py-2 text-yellow-100 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 text-xs font-bold md:flex-row md:items-center md:justify-between">
        <p className="inline-flex items-center gap-2">
          <Rocket className="h-4 w-4 text-yellow-300" />
          {dictionary.beta.message}
        </p>

        <Link
          href="/feedback"
          className="inline-flex w-fit items-center gap-2 rounded-lg border border-yellow-400/25 bg-black/20 px-3 py-2 text-yellow-100 transition hover:border-yellow-300"
        >
          <MessageCircle className="h-4 w-4" />
          {dictionary.beta.feedback}
        </Link>
      </div>
    </section>
  )
}
