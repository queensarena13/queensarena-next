"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"
import { supabaseClient } from "@/lib/supabase-client"
import { useLanguage } from "@/components/language-provider"
import { syncFavoritesFromAccount } from "@/lib/synced-favorites"

function getPublicSiteUrl() {
  if (typeof window !== "undefined") {
    return window.location.origin
  }

  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://queensarena-next.vercel.app"
  )
}

const copy = {
  accountActive:
    "A tua conta QueensArena est\u00e1 ativa neste dispositivo.",
  emailConfirmed:
    "Email confirmado. Sess\u00e3o iniciada.",
  validEmail: "Indica um email v\u00e1lido.",
  validPassword:
    "A palavra-passe deve ter pelo menos 6 caracteres.",
  signedIn:
    "Sess\u00e3o iniciada. Favoritos sincronizados.",
  signedOut: "Sess\u00e3o terminada.",
  signupSent:
    "Pedido enviado. Abre o email de confirma\u00e7\u00e3o para ativar a conta.",
  resetSent:
    "Envi\u00e1mos um email para recuperares a palavra-passe.",
  confirmationSent:
    "Reenvi\u00e1mos o email de confirma\u00e7\u00e3o.",
  passwordUpdated:
    "Palavra-passe atualizada. J\u00e1 podes usar a tua conta.",
  signInFailed:
    "N\u00e3o foi poss\u00edvel iniciar sess\u00e3o neste momento.",
  signupFailed:
    "N\u00e3o foi poss\u00edvel criar conta neste momento.",
  resetFailed:
    "N\u00e3o foi poss\u00edvel enviar o email de recupera\u00e7\u00e3o.",
  updateFailed:
    "N\u00e3o foi poss\u00edvel atualizar a palavra-passe.",
  favoritesDescription:
    "As equipas favoritas ficam associadas \u00e0 tua conta e continuam dispon\u00edveis neste dispositivo.",
  forgotPassword: "Esqueci-me da palavra-passe",
  resendConfirmation: "Reenviar confirma\u00e7\u00e3o",
  newPassword: "Nova palavra-passe",
  updatePassword: "Atualizar palavra-passe",
  sending: "A enviar...",
  entering: "A entrar...",
  creating: "A criar...",
  ending: "A terminar...",
  updating: "A atualizar...",
  deleteAccount: "Eliminar conta ou dados associados",
}

async function recordSignupEmail(
  email: string,
  status: string
) {
  try {
    await fetch("/api/auth/signup-email", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ email, status }),
    })
  } catch {
    // Account creation should not fail because the audit log is unavailable.
  }
}

function friendlyAuthError(message: string) {
  const normalized = message.toLowerCase()

  if (normalized.includes("rate limit")) {
    return "O limite tempor\u00e1rio de emails foi atingido. Aguarda alguns minutos antes de pedir novo email de confirma\u00e7\u00e3o."
  }

  if (normalized.includes("invalid")) {
    return "N\u00e3o foi poss\u00edvel validar este email. Usa um email real e confirma se est\u00e1 escrito corretamente."
  }

  if (
    normalized.includes("already") ||
    normalized.includes("registered")
  ) {
    return "Esta conta j\u00e1 existe. Usa o bot\u00e3o Entrar."
  }

  if (normalized.includes("email not confirmed")) {
    return "Este email ainda n\u00e3o foi confirmado. Usa o bot\u00e3o para reenviar a confirma\u00e7\u00e3o."
  }

  return message
}

export default function LoginPage() {
  const router = useRouter()
  const { dictionary } = useLanguage()

  const [email, setEmail] = useState("")
  const [password, setPassword] =
    useState("")
  const [newPassword, setNewPassword] =
    useState("")
  const [loading, setLoading] =
    useState(false)
  const [mode, setMode] = useState<
    | "login"
    | "signup"
    | "logout"
    | "reset"
    | "resend"
    | "update"
    | ""
  >("")
  const [user, setUser] = useState<User | null>(null)
  const [favoriteCount, setFavoriteCount] =
    useState(0)
  const [syncMessage, setSyncMessage] =
    useState("")
  const [errorMessage, setErrorMessage] =
    useState("")
  const [canUpdatePassword, setCanUpdatePassword] =
    useState(false)

  useEffect(() => {
    let active = true

    async function loadSession() {
      const code = new URLSearchParams(
        window.location.search
      ).get("code")

      if (code) {
        const { error } =
          await supabaseClient.auth.exchangeCodeForSession(
            code
          )

        window.history.replaceState(
          {},
          "",
          "/login"
        )

        if (error) {
          setErrorMessage(
            friendlyAuthError(error.message)
          )
        } else {
          setSyncMessage(copy.emailConfirmed)
        }
      }

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
    }

    void loadSession()

    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null)

        if (event === "PASSWORD_RECOVERY") {
          setCanUpdatePassword(true)
        }

        if (session?.user) {
          const result =
            await syncFavoritesFromAccount()
          setFavoriteCount(result.count)
        } else {
          setFavoriteCount(0)
        }
      }
    )

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  function validateEmailOnly() {
    const cleanEmail = email.trim()

    if (!cleanEmail.includes("@")) {
      return copy.validEmail
    }

    return ""
  }

  function validateCredentials(value = password) {
    const emailError = validateEmailOnly()

    if (emailError) return emailError

    return validatePasswordOnly(value)
  }

  function validatePasswordOnly(value: string) {
    if (value.length < 6) {
      return copy.validPassword
    }

    return ""
  }

  function startRequest(nextMode: typeof mode) {
    setLoading(true)
    setMode(nextMode)
    setErrorMessage("")
    setSyncMessage("")
  }

  function finishRequest() {
    setLoading(false)
    setMode("")
  }

  async function handleLogin() {
    const validationError = validateCredentials()

    if (validationError) {
      setErrorMessage(validationError)
      return
    }

    startRequest("login")

    try {
      const { error } =
        await supabaseClient.auth.signInWithPassword({
          email: email.trim(),
          password,
        })

      if (error) {
        setErrorMessage(
          friendlyAuthError(error.message)
        )
        return
      }

      const result = await syncFavoritesFromAccount()
      setFavoriteCount(result.count)
      setSyncMessage(copy.signedIn)
      router.push("/profile")
      router.refresh()
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? friendlyAuthError(error.message)
          : copy.signInFailed
      )
    } finally {
      finishRequest()
    }
  }

  async function handleSignup() {
    const validationError = validateCredentials()

    if (validationError) {
      setErrorMessage(validationError)
      return
    }

    startRequest("signup")

    try {
      const cleanEmail = email.trim()
      await recordSignupEmail(cleanEmail, "submitted")

      const { data, error } =
        await supabaseClient.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            emailRedirectTo: `${getPublicSiteUrl()}/login`,
          },
        })

      if (error) {
        setErrorMessage(
          friendlyAuthError(error.message)
        )
        return
      }

      if (data.user?.identities?.length === 0) {
        setErrorMessage(
          "Esta conta já existe. Entra com a tua palavra-passe ou usa a recuperação."
        )
        await recordSignupEmail(cleanEmail, "already_exists")
        return
      }

      await recordSignupEmail(cleanEmail, "confirmation_sent")
      setSyncMessage(copy.signupSent)
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? friendlyAuthError(error.message)
          : copy.signupFailed
      )
    } finally {
      finishRequest()
    }
  }

  async function handlePasswordReset() {
    const validationError = validateEmailOnly()

    if (validationError) {
      setErrorMessage(validationError)
      return
    }

    startRequest("reset")

    try {
      const { error } =
        await supabaseClient.auth.resetPasswordForEmail(
          email.trim(),
          {
            redirectTo: `${getPublicSiteUrl()}/login`,
          }
        )

      if (error) {
        setErrorMessage(
          friendlyAuthError(error.message)
        )
        return
      }

      setSyncMessage(copy.resetSent)
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? friendlyAuthError(error.message)
          : copy.resetFailed
      )
    } finally {
      finishRequest()
    }
  }

  async function handleResendConfirmation() {
    const validationError = validateEmailOnly()

    if (validationError) {
      setErrorMessage(validationError)
      return
    }

    startRequest("resend")

    try {
      const { error } =
        await supabaseClient.auth.resend({
          type: "signup",
          email: email.trim(),
          options: {
            emailRedirectTo: `${getPublicSiteUrl()}/login`,
          },
        })

      if (error) {
        setErrorMessage(
          friendlyAuthError(error.message)
        )
        return
      }

      setSyncMessage(copy.confirmationSent)
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? friendlyAuthError(error.message)
          : copy.signupFailed
      )
    } finally {
      finishRequest()
    }
  }

  async function handlePasswordUpdate() {
    const validationError =
      validatePasswordOnly(newPassword)

    if (validationError) {
      setErrorMessage(validationError)
      return
    }

    startRequest("update")

    try {
      const { error } =
        await supabaseClient.auth.updateUser({
          password: newPassword,
        })

      if (error) {
        setErrorMessage(
          friendlyAuthError(error.message)
        )
        return
      }

      setNewPassword("")
      setCanUpdatePassword(false)
      setSyncMessage(copy.passwordUpdated)
      router.push("/profile")
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? friendlyAuthError(error.message)
          : copy.updateFailed
      )
    } finally {
      finishRequest()
    }
  }

  async function handleLogout() {
    startRequest("logout")
    await supabaseClient.auth.signOut()
    setUser(null)
    setFavoriteCount(0)
    setSyncMessage(copy.signedOut)
    finishRequest()
    router.refresh()
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050505] p-6 text-white">
      <div className="w-full max-w-[450px] rounded-lg border border-white/[0.05] bg-[#0b0b0b] p-8">
        <p className="text-sm font-bold uppercase text-yellow-400">
          {dictionary.common.appName}
        </p>

        <h1 className="mt-4 text-4xl font-black">
          {dictionary.auth.welcome}
        </h1>

        <p className="mt-3 text-zinc-500">
          {user
            ? copy.accountActive
            : dictionary.auth.description}
        </p>

        {errorMessage ? (
          <p className="mt-5 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {errorMessage}
          </p>
        ) : null}

        {syncMessage ? (
          <p className="mt-5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            {syncMessage}
          </p>
        ) : null}

        {canUpdatePassword ? (
          <div className="mt-8 space-y-4">
            <input
              type="password"
              placeholder={copy.newPassword}
              value={newPassword}
              onChange={(event) =>
                setNewPassword(event.target.value)
              }
              className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-5 py-4 outline-none"
            />
            <button
              onClick={handlePasswordUpdate}
              disabled={loading}
              className="w-full rounded-lg bg-yellow-400 px-5 py-4 font-semibold text-black transition-all hover:bg-yellow-300 disabled:opacity-60"
              type="button"
            >
              {mode === "update"
                ? copy.updating
                : copy.updatePassword}
            </button>
          </div>
        ) : user ? (
          <div className="mt-8 space-y-4">
            <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-5">
              <p className="text-xs font-black uppercase text-zinc-500">
                Email
              </p>
              <p className="mt-2 break-all text-lg font-black">
                {user.email}
              </p>
            </div>

            <div className="rounded-lg border border-yellow-400/20 bg-yellow-400/10 p-5">
              <p className="text-xs font-black uppercase text-yellow-300">
                Favoritos sincronizados
              </p>
              <p className="mt-2 text-3xl font-black text-white">
                {favoriteCount}
              </p>
              <p className="mt-2 text-sm text-zinc-400">
                {copy.favoritesDescription}
              </p>
            </div>

            <button
              onClick={handleLogout}
              disabled={loading}
              className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-5 py-4 font-semibold transition-all hover:bg-white/[0.06] disabled:opacity-60"
              type="button"
            >
              {mode === "logout"
                ? copy.ending
                : "Sair"}
            </button>
          </div>
        ) : (
          <>
            <div className="mt-8 space-y-4">
              <input
                type="email"
                placeholder={dictionary.auth.email}
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-5 py-4 outline-none"
              />

              <input
                type="password"
                placeholder={
                  dictionary.auth.password
                }
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value
                  )
                }
                className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-5 py-4 outline-none"
              />
            </div>

            <div className="mt-8 flex gap-3">
              <button
                onClick={handleLogin}
                disabled={loading}
                className="flex-1 rounded-lg bg-yellow-400 px-5 py-4 font-semibold text-black transition-all hover:bg-yellow-300 disabled:opacity-60"
                type="button"
              >
                {mode === "login"
                  ? copy.entering
                  : dictionary.auth.login}
              </button>

              <button
                onClick={handleSignup}
                disabled={loading}
                className="flex-1 rounded-lg border border-white/[0.08] bg-white/[0.03] px-5 py-4 font-semibold transition-all hover:bg-white/[0.06] disabled:opacity-60"
                type="button"
              >
                {mode === "signup"
                  ? copy.creating
                  : dictionary.auth.signup}
              </button>
            </div>

            <div className="mt-4 grid gap-2 text-left text-sm sm:grid-cols-2">
              <button
                onClick={handlePasswordReset}
                disabled={loading}
                className="rounded-lg px-3 py-2 text-left font-bold text-yellow-400 transition hover:bg-white/[0.04] disabled:opacity-60"
                type="button"
              >
                {mode === "reset"
                  ? copy.sending
                  : copy.forgotPassword}
              </button>
              <button
                onClick={handleResendConfirmation}
                disabled={loading}
                className="rounded-lg px-3 py-2 text-left font-bold text-yellow-400 transition hover:bg-white/[0.04] disabled:opacity-60 sm:text-right"
                type="button"
              >
                {mode === "resend"
                  ? copy.sending
                  : copy.resendConfirmation}
              </button>
            </div>
          </>
        )}

        <Link
          href="/account-deletion"
          className="mt-5 inline-flex text-sm font-bold text-yellow-400 transition hover:text-yellow-300"
        >
          {copy.deleteAccount}
        </Link>
      </div>
    </main>
  )
}
