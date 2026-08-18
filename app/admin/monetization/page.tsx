import type { Metadata } from "next"
import {
  BadgeEuro,
  CheckCircle2,
  Megaphone,
  Store,
} from "lucide-react"
import { getLaunchReadiness } from "@/lib/launch-readiness"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Monetização",
}

const packages = [
  {
    title: "Parceiro fundador",
    text: "Marca presente em zona discreta da home, página de competições e materiais de lançamento.",
  },
  {
    title: "Competição em destaque",
    text: "Patrocínio editorial de uma competição acompanhada, com posição controlada e sem interferir nos resultados.",
  },
  {
    title: "Apoio a futebol feminino",
    text: "Formato para clubes, academias, equipamentos, fisioterapia, media locais ou projetos de formação.",
  },
]

export default async function MonetizationAdminPage() {
  const readiness = await getLaunchReadiness()

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-8 text-white lg:px-8">
      <div className="mx-auto max-w-6xl">
        <p className="inline-flex items-center gap-2 rounded-lg border border-yellow-500/20 bg-yellow-500/10 px-3 py-2 text-xs font-black uppercase text-yellow-300">
          <BadgeEuro className="h-4 w-4" />
          Monetização
        </p>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section>
            <h1 className="text-4xl font-black md:text-5xl">
              Caminho comercial
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-400">
              A QueensArena deve começar por patrocínios diretos
              pequenos e transparentes. Publicidade automática só faz
              sentido depois de tráfego, consentimento e melhor
              cobertura portuguesa.
            </p>
          </section>

          <section className="rounded-lg border border-white/[0.06] bg-[#0b0b0b] p-5">
            <p className="text-xs font-black uppercase text-zinc-500">
              Recomendação
            </p>
            <h2 className="mt-3 text-3xl font-black">
              {readiness.betaReady
                ? "Beta + patrocínio direto"
                : "Preparar beta"}
            </h2>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              {readiness.monetizationReady
                ? "A base já suporta conversas comerciais iniciais."
                : "Ainda não recomendo AdSense/AdMob. Foca fornecedores de dados e beta público primeiro."}
            </p>
          </section>
        </div>

        <section className="mt-6 grid gap-3 md:grid-cols-3">
          {packages.map((item) => (
            <article
              key={item.title}
              className="rounded-lg border border-white/[0.06] bg-[#0b0b0b] p-5"
            >
              <Megaphone className="h-6 w-6 text-yellow-400" />
              <h2 className="mt-5 text-xl font-black">
                {item.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-zinc-500">
                {item.text}
              </p>
            </article>
          ))}
        </section>

        <section className="mt-6 grid gap-3 md:grid-cols-2">
          <article className="rounded-lg border border-white/[0.06] bg-[#0b0b0b] p-5">
            <CheckCircle2 className="h-6 w-6 text-green-400" />
            <h2 className="mt-5 text-xl font-black">
              Já vendável em conversa direta
            </h2>
            <p className="mt-2 text-sm leading-7 text-zinc-500">
              Conceito, nicho, marca, app pública, dados reais de NWSL,
              UWCL e andebol, páginas legais base e contacto comercial.
            </p>
          </article>

          <article className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-5">
            <Store className="h-6 w-6 text-yellow-300" />
            <h2 className="mt-5 text-xl font-black">
              Ainda não para anúncios automáticos
            </h2>
            <p className="mt-2 text-sm leading-7 text-yellow-100/80">
              Falta fornecedor pago com Liga BPI/Portugal, analítica
              com consentimento, política legal revista e tráfego real
              medido.
            </p>
          </article>
        </section>
      </div>
    </main>
  )
}
