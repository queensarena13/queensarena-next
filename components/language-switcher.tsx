"use client"

import { useLanguage } from "@/components/language-provider"
import { Locale } from "@/lib/i18n"

const locales: {
  value: Locale
  label: string
}[] = [
  {
    value: "pt",
    label: "PT",
  },
  {
    value: "en",
    label: "EN",
  },
]

export function LanguageSwitcher() {
  const { locale, setLocale } =
    useLanguage()

  return (
    <div className="flex rounded-lg border border-white/[0.08] bg-white/[0.03] p-1">
      {locales.map((item) => (
        <button
          key={item.value}
          onClick={() =>
            setLocale(item.value)
          }
          className={`
            h-9
            min-w-10
            rounded-md
            px-3
            text-xs
            font-bold
            transition
            ${
              locale === item.value
                ? "bg-yellow-400 text-black"
                : "text-zinc-400 hover:text-white"
            }
          `}
          type="button"
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}
