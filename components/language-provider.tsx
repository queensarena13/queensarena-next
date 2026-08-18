"use client"

import {
  createContext,
  useContext,
  useMemo,
  useState,
} from "react"
import { useRouter } from "next/navigation"
import {
  dictionaries,
  getDictionary,
  localeCookieName,
  Locale,
  parseLocale,
  toHtmlLang,
} from "@/lib/i18n"

type LanguageContextValue = {
  locale: Locale
  dictionary: (typeof dictionaries)[Locale]
  setLocale: (locale: Locale) => void
}

const LanguageContext =
  createContext<LanguageContextValue | null>(
    null
  )

export function LanguageProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale
  children: React.ReactNode
}) {
  const router = useRouter()

  const [locale, setLocaleState] =
    useState<Locale>(
      parseLocale(initialLocale)
    )

  const value = useMemo(
    () => ({
      locale,
      dictionary: getDictionary(locale),
      setLocale(nextLocale: Locale) {
        setLocaleState(nextLocale)

        window.localStorage.setItem(
          localeCookieName,
          nextLocale
        )

        document.cookie = `${localeCookieName}=${nextLocale}; path=/; max-age=31536000; samesite=lax`
        document.documentElement.lang =
          toHtmlLang(nextLocale)

        router.refresh()
      },
    }),
    [locale, router]
  )

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)

  if (!context) {
    throw new Error(
      "useLanguage must be used inside LanguageProvider."
    )
  }

  return context
}
