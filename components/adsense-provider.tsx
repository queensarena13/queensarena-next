"use client"

import Script from "next/script"
import { adsenseClient } from "@/lib/ads"

export function AdsenseProvider() {
  if (!adsenseClient) {
    return null
  }

  return (
    <Script
      id="queensarena-adsense"
      strategy="afterInteractive"
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
      crossOrigin="anonymous"
    />
  )
}
