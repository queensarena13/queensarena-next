"use client"

import Image from "next/image"
import { useEffect, useState } from "react"

const splashKey = "queensarena-beta-splash-seen"

export function LaunchSplash() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const seen =
      window.sessionStorage.getItem(splashKey)

    if (seen) return

    window.sessionStorage.setItem(splashKey, "true")

    const showTimer = window.setTimeout(() => {
      setVisible(true)
    }, 0)

    const hideTimer = window.setTimeout(() => {
      setVisible(false)
    }, 1700)

    return () => {
      window.clearTimeout(showTimer)
      window.clearTimeout(hideTimer)
    }
  }, [])

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-[12000] flex items-center justify-center bg-[#020405]">
      <div className="animate-[qaSplash_1.6s_ease_forwards]">
        <Image
          src="/queen-splash-logo.png"
          alt="QueensArena"
          width={420}
          height={525}
          className="h-auto w-[min(78vw,360px)] object-contain"
          priority
        />
      </div>
    </div>
  )
}
