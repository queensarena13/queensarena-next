"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { Heart, LogOut, ShieldCheck, UserRound } from "lucide-react"
import { supabaseClient } from "@/lib/supabase-client"
import { useLanguage } from "@/components/language-provider"
import { syncFavoritesFromAccount } from "@/lib/synced-favorites"

const copy = {
  signedOut: "Sess\u00e3o terminada.",
  signedInHelp:
    "A tua conta guarda favoritos e prefer\u00eancias entre dispositivos.",
  signedOutHelp:
    "Inicia sess\u00e3o para guardar favoritos na tua conta e manter as tuas prefer\u00eancias entre dispositivos.",
  syncedFavorites: "Favoritos sincronizados",
  viewFavorites: "Ver favoritos",
  accountSecurity: "Seguran\u00e7a da conta",
  accountSecurityText:
    "A autentica\u00e7\u00e3o \u00e9 gerida pelo Supabase com sess\u00e3o segura no dispositivo.",
  loginOrCreate: "Entrar ou criar conta",
}

export default function ProfilePage() {
  const { dictionary } = useLanguage()
  const [user, setUser] = useState<User | null>(null)
  const [favoriteCount, setFavoriteCount] =
    useState(0)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")

  useEffect(() => {
    let active = true

    async function loadProfile() {
      const {
        data: { user },
      } = await supabaseClient.auth.getUser()

      if (!active) return

      setUser(user)

      if (user) {
        const result =
          await syncFavoritesFromAccount()
        setFavoriteCount(result.count)
      }

      setLoading(false)
    }

    void loadProfile()

    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user || null)

        if (session?.user) {
          const result =
            await syncFavoritesFromAccount()
          setFavoriteCount(result.count)
        } else {
          setFavoriteCount(0)
        }

        setLoading(false)
      }
    )

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  async function handleLogout() {
    setLoading(true)
    await supabaseClient.auth.signOut()
    setUser(null)
    setFavoriteCount(0)
    setMessage(copy.signedOut)
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-6 text-white lg:px-8">
      <section className="mx-auto max-w-3xl rounded-lg border border-white/[0.05] bg-[#0b0b0b] p-6 lg:p-10">
        <div className="mb-6 inline-flex items-center gap-2 rounded-lg border border-yellow-500/20 bg-yellow-500/10 px-3 py-2 text-xs font-bold uppercase text-yellow-300">
          <UserRound className="h-4 w-4" />
          {dictionary.common.profile}
        </div>

        <h1 className="text-4xl font-black">
          {dictionary.common.profile}
        </h1>

        {loading ? (
          <p className="mt-6 text-zinc-400">
            {dictionary.common.loading}
          </p>
        ) : user ? (
          <div className="mt-8 space-y-4">
            <p className="text-zinc-400">
              {copy.signedInHelp}
            </p>

            <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-5">
              <p className="text-xs font-black uppercase text-zinc-500">
                Email
              </p>
              <p className="mt-2 break-all text-lg font-black">
                {user.email}
              </p>
            </div>

            <div className="rounded-lg border border-yellow-400/20 bg-yellow-400/10 p-5">
              <div className="flex items-center gap-3">
                <Heart className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <p className="text-xs font-black uppercase text-yellow-300">
                  {copy.syncedFavorites}
                </p>
              </div>
              <p className="mt-3 text-4xl font-black">
                {favoriteCount}
              </p>
            </div>

            <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-5">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-emerald-300" />
                <p className="text-xs font-black uppercase text-zinc-500">
                  {copy.accountSecurity}
                </p>
              </div>
              <p className="mt-3 text-sm text-zinc-400">
                {copy.accountSecurityText}
              </p>
            </div>

            {message ? (
              <p className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-zinc-300">
                {message}
              </p>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/teams#favorites"
                className="inline-flex flex-1 items-center justify-center rounded-lg bg-yellow-400 px-5 py-4 font-black text-black transition hover:bg-yellow-300"
              >
                {copy.viewFavorites}
              </Link>

              <button
                onClick={handleLogout}
                disabled={loading}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-5 py-4 font-black transition hover:bg-white/[0.06] disabled:opacity-60"
                type="button"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-8 rounded-lg border border-white/[0.08] bg-white/[0.03] p-5">
            <p className="text-zinc-300">
              {copy.signedOutHelp}
            </p>
            <Link
              href="/login"
              className="mt-5 inline-flex rounded-lg bg-yellow-400 px-5 py-4 font-black text-black transition hover:bg-yellow-300"
            >
              {copy.loginOrCreate}
            </Link>
          </div>
        )}
      </section>
    </main>
  )
}
