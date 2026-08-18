"use client"

import { useMemo, useState } from "react"
import { Check, Loader2, Send } from "lucide-react"

const sportOptions = [
  "Futebol",
  "Futsal",
  "Andebol",
  "Andebol de praia",
  "Voleibol",
  "Basquetebol",
  "Tenis",
  "Atletismo",
  "Rugby",
  "Hoquei em patins",
]

export function SportsPoll() {
  const [selectedSports, setSelectedSports] = useState<string[]>([])
  const [otherSport, setOtherSport] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDone, setIsDone] = useState(false)

  const canSubmit = useMemo(
    () => selectedSports.length > 0 || otherSport.trim().length > 0,
    [otherSport, selectedSports.length]
  )

  function toggleSport(sport: string) {
    setSelectedSports((current) =>
      current.includes(sport)
        ? current.filter((item) => item !== sport)
        : [...current, sport].slice(0, 6)
    )
  }

  async function submitPoll() {
    if (!canSubmit || isSubmitting) return

    setIsSubmitting(true)
    setMessage("")

    try {
      const response = await fetch("/api/polls/sports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          selectedSports,
          otherSport,
          email,
          locale: navigator.language,
        }),
      })
      const result = (await response.json()) as {
        success?: boolean
        message?: string
      }

      if (!response.ok || !result.success) {
        setMessage(result.message || "Nao foi possivel registar agora.")
        return
      }

      setIsDone(true)
      setMessage(result.message || "Voto registado. Obrigado.")
    } catch {
      setMessage("Nao foi possivel registar agora.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="rounded-lg border border-white/[0.08] bg-[#0b0b0b] p-5">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-black uppercase text-yellow-400">
          Enquete
        </p>
        <h2 className="text-2xl font-black text-white">
          Que modalidades queres ver na QueensArena?
        </h2>
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {sportOptions.map((sport) => {
          const isSelected = selectedSports.includes(sport)

          return (
            <button
              key={sport}
              type="button"
              onClick={() => toggleSport(sport)}
              className={`flex min-h-12 items-center justify-between rounded-lg border px-4 py-3 text-left text-sm font-black transition ${
                isSelected
                  ? "border-yellow-400 bg-yellow-400 text-black"
                  : "border-white/[0.08] bg-black text-zinc-300 hover:border-yellow-400/40 hover:text-white"
              }`}
            >
              {sport}
              {isSelected ? <Check className="h-4 w-4" /> : null}
            </button>
          )
        })}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
        <input
          value={otherSport}
          onChange={(event) => setOtherSport(event.target.value)}
          maxLength={80}
          placeholder="Outra modalidade"
          className="min-h-12 rounded-lg border border-white/[0.08] bg-black px-4 text-sm font-bold text-white outline-none placeholder:text-zinc-600 focus:border-yellow-400/60"
        />
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          maxLength={180}
          type="email"
          placeholder="Email opcional"
          className="min-h-12 rounded-lg border border-white/[0.08] bg-black px-4 text-sm font-bold text-white outline-none placeholder:text-zinc-600 focus:border-yellow-400/60"
        />
        <button
          type="button"
          onClick={submitPoll}
          disabled={!canSubmit || isSubmitting || isDone}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-yellow-400 px-5 text-sm font-black text-black transition disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          Votar
        </button>
      </div>

      {message ? (
        <p className="mt-4 text-sm font-bold text-zinc-300">{message}</p>
      ) : null}
    </section>
  )
}
