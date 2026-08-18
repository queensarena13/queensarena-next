"use client"

import Script from "next/script"
import { usePathname } from "next/navigation"
import { useEffect, useSyncExternalStore } from "react"
import {
  consentUpdatedEvent,
  readConsent,
} from "@/lib/consent"

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

const gaMeasurementId =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

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
  return readConsent()?.analytics || false
}

export function GrowthAnalytics() {
  const pathname = usePathname()
  const analyticsAllowed = useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => false
  )

  useEffect(() => {
    if (!analyticsAllowed) return

    const payload = {
      eventType: "page_view",
      path: pathname,
      referrer: document.referrer || null,
      language: navigator.language || null,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
    }

    const sent = navigator.sendBeacon?.(
      "/api/analytics/event",
      new Blob([JSON.stringify(payload)], {
        type: "application/json",
      })
    )

    if (!sent) {
      void fetch("/api/analytics/event", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        keepalive: true,
      })
    }

    if (gaMeasurementId && window.gtag) {
      window.gtag("event", "page_view", {
        page_path: pathname,
      })
    }
  }, [analyticsAllowed, pathname])

  if (!analyticsAllowed || !gaMeasurementId) {
    return null
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
        strategy="afterInteractive"
      />
      <Script id="queensarena-ga" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${gaMeasurementId}', {
            anonymize_ip: true,
            send_page_view: false
          });
        `}
      </Script>
    </>
  )
}
