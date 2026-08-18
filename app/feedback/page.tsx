import type { Metadata } from "next"
import Link from "next/link"
import { Mail, MessageCircle } from "lucide-react"
import { SportsPoll } from "@/components/sports-poll"

export const metadata: Metadata = {
  title: "Feedback",
}

export default function FeedbackPage() {
  const subject = encodeURIComponent("Feedback QueensArena")
  const body = encodeURIComponent(
    [
      "Olá QueensArena,",
      "",
      "O meu feedback é:",
      "",
      "Modalidades/competições prioritárias:",
      "Sugestões:",
      "",
    ].join("\n")
  )

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-8 text-white lg:px-8">
      <div className="mx-auto max-w-5xl">
        <p className="inline-flex items-center gap-2 rounded-lg border border-yellow-500/20 bg-yellow-500/10 px-3 py-2 text-xs font-black uppercase text-yellow-300">
          <MessageCircle className="h-4 w-4" />
          Feedback
        </p>

        <section className="mt-6">
          <h1 className="text-4xl font-black md:text-5xl">
            Ajuda a definir a próxima fase
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-400">
            Queremos priorizar as modalidades certas e reforçar a cobertura
            com dados reais.
          </p>
        </section>

        <div className="mt-6">
          <SportsPoll />
        </div>

        <section className="mt-6 rounded-lg border border-white/[0.08] bg-[#0b0b0b] p-5">
          <Mail className="h-6 w-6 text-yellow-300" />
          <h2 className="mt-4 text-2xl font-black">Contacto direto</h2>
          <Link
            href={`mailto:queensarena13@gmail.com?subject=${subject}&body=${body}`}
            className="mt-5 inline-flex rounded-lg bg-yellow-400 px-4 py-3 text-sm font-black text-black"
          >
            queensarena13@gmail.com
          </Link>
        </section>
      </div>
    </main>
  )
}
