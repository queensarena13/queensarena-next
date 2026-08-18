"use client"

import { Bell, Check, ShieldAlert } from "lucide-react"
import { useEffect, useState } from "react"
import { supabaseClient } from "@/lib/supabase-client"
import { useLanguage } from "@/components/language-provider"
import {
  notificationsEnabledKey,
  subscribeToPush,
} from "@/lib/client-notifications"

interface AppNotification {
  id: number
  title: string
  message: string
}

export function NotificationsPanel() {
  const { dictionary, locale } = useLanguage()
  const copy = dictionary.notifications as
    typeof dictionary.notifications & {
      description?: string
      enable?: string
      enabled?: string
      blocked?: string
      unsupported?: string
      testTitle?: string
      testBody?: string
    }
  const [notifications, setNotifications] =
    useState<AppNotification[]>([])

  const [open, setOpen] = useState(false)
  const [permission, setPermission] =
    useState<
      NotificationPermission | "unsupported"
    >(() => {
      if (
        typeof window === "undefined" ||
        !("Notification" in window)
      ) {
        return "unsupported"
      }

      return Notification.permission
    })
  const [enabled, setEnabled] =
    useState(() => {
      if (
        typeof window === "undefined" ||
        !("Notification" in window)
      ) {
        return false
      }

      return (
        window.localStorage.getItem(
          notificationsEnabledKey
        ) === "true" &&
        Notification.permission === "granted"
      )
    })

  const fallback =
    locale === "pt"
      ? {
          description:
            "Ativa alertas no telemóvel para jogos e resultados.",
          enable: "Ativar",
          enabled:
            "Notificações ativas neste dispositivo.",
          blocked:
            "O browser bloqueou as notificações. Podes alterar isto nas definições do site.",
          unsupported:
            "Este browser não suporta notificações.",
          testBody:
            "Notificações ativas para jogos femininos.",
        }
      : {
          description:
            "Enable alerts for matches and results.",
          enable: "Enable",
          enabled:
            "Notifications are enabled on this device.",
          blocked:
            "Notifications are blocked. You can change this in site settings.",
          unsupported:
            "This browser does not support notifications.",
          testBody:
            "Notifications enabled for women's matches.",
        }

  useEffect(() => {
    let active = true

    async function fetchNotifications() {
      const { data } = await supabaseClient
        .from("notifications")
        .select("*")
        .order("created_at", {
          ascending: false,
        })

      if (!active) return

      setNotifications(data || [])
    }

    void fetchNotifications()

    const channel = supabaseClient
      .channel("notifications-live")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
        },
        () => {
          void fetchNotifications()
        }
      )
      .subscribe()

    return () => {
      active = false
      supabaseClient.removeChannel(channel)
    }
  }, [])

  async function enableNotifications() {
    if (!("Notification" in window)) {
      setPermission("unsupported")
      return
    }

    const result =
      Notification.permission === "default"
        ? await Notification.requestPermission()
        : Notification.permission

    setPermission(result)

    if (result === "granted") {
      window.localStorage.setItem(
        notificationsEnabledKey,
        "true"
      )
      setEnabled(true)
      void subscribeToPush()

      try {
        new Notification(
          copy.testTitle || "QueensArena",
          {
            body:
              copy.testBody ||
              fallback.testBody,
          }
        )
      } catch {
        // Some browsers allow permission but block the preview notification.
      }
    }
  }

  const statusText =
    permission === "unsupported"
      ? copy.unsupported ||
        fallback.unsupported
      : permission === "denied"
        ? copy.blocked ||
          fallback.blocked
        : enabled
          ? copy.enabled ||
            fallback.enabled
          : copy.description ||
            fallback.description

  return (
    <div className="relative">
      <button
        aria-label={dictionary.notifications.title}
        onClick={() => setOpen(!open)}
        className="
          relative
          flex
          h-12
          w-12
          items-center
          justify-center
          rounded-lg
          border
          border-white/[0.08]
          bg-white/[0.03]
        "
        type="button"
      >
        <Bell className="h-5 w-5" />

        {(notifications.length > 0 || enabled) && (
          <div
            className="
              absolute
              right-2
              top-2
              h-2
              w-2
              rounded-full
              bg-yellow-400
            "
          />
        )}
      </button>

      {open && (
        <div
          className="
            fixed
            right-3
            top-24
            z-[11000]
            max-h-[calc(100dvh-120px)]
            w-[min(390px,calc(100vw-24px))]
            overflow-hidden
            rounded-lg
            border
            border-white/[0.08]
            bg-[#0b0b0b]
            shadow-2xl
          "
        >
          <div className="border-b border-white/[0.05] p-5">
            <h3 className="text-xl font-black">
              {dictionary.notifications.title}
            </h3>

            <p className="mt-2 text-sm text-zinc-500">
              {statusText}
            </p>

            {permission !== "unsupported" &&
              permission !== "denied" &&
              !enabled && (
                <button
                  onClick={enableNotifications}
                  className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-yellow-400 px-4 text-sm font-black text-black transition hover:bg-yellow-300"
                  type="button"
                >
                  <Bell className="h-4 w-4" />
                  {copy.enable || fallback.enable}
                </button>
              )}

            {enabled && (
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm font-bold text-green-300">
                <Check className="h-4 w-4" />
                {dictionary.common.enabled}
              </div>
            )}

            {permission === "denied" && (
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-sm font-bold text-yellow-200">
                <ShieldAlert className="h-4 w-4" />
                {dictionary.common.disabled}
              </div>
            )}
          </div>

          <div className="max-h-[55dvh] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-10 text-center text-zinc-500">
                {dictionary.notifications.empty}
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="
                    border-b
                    border-white/[0.05]
                    p-5
                  "
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-400">
                    {notification.title}
                  </p>

                  <p className="mt-3 text-sm text-zinc-300">
                    {notification.message}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
