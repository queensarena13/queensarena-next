"use client"

import {
  useEffect,
  useRef,
  useSyncExternalStore,
} from "react"
import { useLanguage } from "@/components/language-provider"
import { adsenseClient } from "@/lib/ads"
import {
  consentUpdatedEvent,
  readConsent,
} from "@/lib/consent"

declare global {
  interface Window {
    adsbygoogle?: unknown[]
  }
}

function subscribe(callback: () => void) {
  window.addEventListener(
    consentUpdatedEvent,
    callback
  )

  return () =>
    window.removeEventListener(
      consentUpdatedEvent,
      callback
    )
}

function getSnapshot() {
  return readConsent()?.ads || false
}

export function AdSlot({
  slot,
  label,
  compact = false,
}: {
  slot?: string
  label?: string
  compact?: boolean
}) {
  const { dictionary } = useLanguage()
  const adRef = useRef<HTMLModElement | null>(null)
  const adsAllowed = useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => false
  )

  useEffect(() => {
    if (!adsAllowed || !adsenseClient || !slot) {
      return
    }

    try {
      window.adsbygoogle =
        window.adsbygoogle || []
      window.adsbygoogle.push({})
    } catch {
      // AdSense may reject a repeat render during client navigation.
    }
  }, [adsAllowed, slot])

  const showAdsense =
    adsAllowed &&
    adsenseClient &&
    slot

  if (!showAdsense) {
    return null
  }

  return (
    <aside
      className={`mx-auto max-w-7xl px-4 lg:px-8 ${
        compact ? "my-2" : "my-3"
      }`}
    >
      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">
        {label || dictionary.ads.label}
      </p>
      <div className="rounded-lg border border-white/[0.06] bg-[#080b0d] p-3">
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{
            display: "block",
            minHeight: compact ? 90 : 250,
          }}
          data-ad-client={adsenseClient}
          data-ad-slot={slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </aside>
  )
}
