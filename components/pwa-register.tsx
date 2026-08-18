"use client"

import { useEffect, useState } from "react"

export function PwaRegister() {
  const [updateReady, setUpdateReady] =
    useState(false)
  const [registration, setRegistration] =
    useState<ServiceWorkerRegistration | null>(
      null
    )

  useEffect(() => {
    if (
      "serviceWorker" in navigator &&
      window.location.protocol === "https:"
    ) {
      let refreshing = false

      navigator.serviceWorker.addEventListener(
        "controllerchange",
        () => {
          if (refreshing) return
          refreshing = true
          window.location.reload()
        }
      )

      void navigator.serviceWorker
        .register("/sw.js")
        .then((serviceWorkerRegistration) => {
          setRegistration(
            serviceWorkerRegistration
          )

          serviceWorkerRegistration.addEventListener(
            "updatefound",
            () => {
              const worker =
                serviceWorkerRegistration.installing

              if (!worker) return

              worker.addEventListener(
                "statechange",
                () => {
                  if (
                    worker.state === "installed" &&
                    navigator.serviceWorker
                      .controller
                  ) {
                    setUpdateReady(true)
                  }
                }
              )
            }
          )
        })
    }
  }, [])

  if (!updateReady) {
    return null
  }

  return (
    <div className="fixed inset-x-3 bottom-24 z-[11000] mx-auto max-w-md rounded-lg border border-yellow-400/25 bg-[#0b0b0b] p-4 text-sm text-white shadow-2xl lg:bottom-5">
      <p className="font-black">
        Nova versão disponível
      </p>
      <p className="mt-1 text-zinc-400">
        Atualiza para veres a versão mais recente da QueensArena.
      </p>
      <button
        type="button"
        className="mt-3 w-full rounded-lg bg-yellow-400 px-4 py-3 font-black text-black"
        onClick={() => {
          registration?.waiting?.postMessage({
            type: "SKIP_WAITING",
          })
          window.location.reload()
        }}
      >
        Atualizar agora
      </button>
    </div>
  )
}
