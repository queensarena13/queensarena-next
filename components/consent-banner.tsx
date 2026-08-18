"use client"

import Link from "next/link"
import {
  useState,
  useSyncExternalStore,
} from "react"
import { useLanguage } from "@/components/language-provider"
import {
  consentStorageKey,
  createConsentPreferences,
  parseConsent,
  saveConsent,
} from "@/lib/consent"

function subscribe() {
  return () => {}
}

function getSnapshot() {
  return typeof window === "undefined"
    ? "accepted"
    : window.localStorage.getItem(
        consentStorageKey
      )
}

export function ConsentBanner() {
  const { dictionary } = useLanguage()
  const [dismissed, setDismissed] =
    useState(false)
  const [customOpen, setCustomOpen] =
    useState(false)
  const [analytics, setAnalytics] =
    useState(true)
  const [ads, setAds] = useState(false)
  const storedConsent = useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => "accepted"
  )

  function persist({
    analytics: analyticsValue,
    ads: adsValue,
  }: {
    analytics: boolean
    ads: boolean
  }) {
    saveConsent(
      createConsentPreferences({
        analytics: analyticsValue,
        ads: adsValue,
      })
    )
    setDismissed(true)
  }

  if (
    dismissed ||
    parseConsent(storedConsent)
  ) {
    return null
  }

  return (
    <section className="fixed inset-x-3 bottom-[88px] z-[8500] rounded-lg border border-white/[0.1] bg-[#05080a] p-4 shadow-2xl shadow-black lg:bottom-4 lg:left-auto lg:right-4 lg:max-w-md">
      <p className="text-sm font-black text-white">
        {dictionary.consent.title}
      </p>
      <p className="mt-2 text-sm leading-6 text-zinc-400">
        {dictionary.consent.description}
      </p>

      {customOpen && (
        <div className="mt-4 space-y-3 rounded-lg border border-white/[0.08] bg-white/[0.03] p-3">
          <label className="flex items-start gap-3 text-sm text-zinc-300">
            <input
              checked
              disabled
              type="checkbox"
              className="mt-1"
            />
            <span>
              <strong className="text-white">
                {dictionary.consent.essentials}
              </strong>
              <span className="block text-zinc-500">
                {
                  dictionary.consent
                    .essentialsDescription
                }
              </span>
            </span>
          </label>

          <label className="flex items-start gap-3 text-sm text-zinc-300">
            <input
              checked={analytics}
              onChange={(event) =>
                setAnalytics(event.target.checked)
              }
              type="checkbox"
              className="mt-1"
            />
            <span>
              <strong className="text-white">
                {dictionary.consent.analytics}
              </strong>
              <span className="block text-zinc-500">
                {
                  dictionary.consent
                    .analyticsDescription
                }
              </span>
            </span>
          </label>

          <label className="flex items-start gap-3 text-sm text-zinc-300">
            <input
              checked={ads}
              onChange={(event) =>
                setAds(event.target.checked)
              }
              type="checkbox"
              className="mt-1"
            />
            <span>
              <strong className="text-white">
                {dictionary.consent.advertising}
              </strong>
              <span className="block text-zinc-500">
                {
                  dictionary.consent
                    .advertisingDescription
                }
              </span>
            </span>
          </label>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() =>
            persist({
              analytics: true,
              ads: true,
            })
          }
          className="rounded-lg bg-yellow-400 px-4 py-2 text-sm font-black text-black"
        >
          {dictionary.consent.acceptAll}
        </button>

        <button
          type="button"
          onClick={() =>
            customOpen
              ? persist({ analytics, ads })
              : setCustomOpen(true)
          }
          className="rounded-lg border border-white/[0.1] bg-white/[0.04] px-4 py-2 text-sm font-black text-white"
        >
          {customOpen
            ? dictionary.consent.saveChoice
            : dictionary.consent.customize}
        </button>

        <button
          type="button"
          onClick={() =>
            persist({
              analytics: false,
              ads: false,
            })
          }
          className="rounded-lg border border-white/[0.1] bg-white/[0.04] px-4 py-2 text-sm font-black text-white"
        >
          {dictionary.consent.necessaryOnly}
        </button>

        <Link
          href="/cookies"
          className="rounded-lg px-3 py-2 text-sm font-bold text-zinc-400 hover:text-white"
        >
          {dictionary.consent.learnMore}
        </Link>
      </div>
    </section>
  )
}
