import type { Metadata } from "next"
import { Database, Link as LinkIcon, ShieldCheck } from "lucide-react"
import { InfoPage } from "@/components/info-page"

export const metadata: Metadata = {
  title: "Parcerias de dados",
  description:
    "Pedido de colaboração da QueensArena para dados oficiais de competições femininas.",
}

const requestedData = [
  "calendários e horários",
  "resultados e estados dos jogos",
  "classificações",
  "equipas e clubes",
  "atletas e estatísticas quando autorizadas",
  "links oficiais, fonte e data de atualização",
]

const prioritySports = [
  "futebol, futsal e futebol de praia",
  "andebol e andebol de praia",
  "voleibol e voleibol de praia",
  "basquetebol e 3x3",
]

export default function DataPartnershipsPage() {
  return (
    <InfoPage
      eyebrow="Dados oficiais"
      title="Parcerias de dados"
      description="A QueensArena quer trabalhar com federações, ligas, clubes e entidades oficiais para apresentar dados femininos fiáveis, autorizados e corretamente atribuídos."
    >
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-white/[0.06] bg-[#0b0b0b] p-5">
          <Database className="h-6 w-6 text-yellow-400" />
          <h2>O que procuramos</h2>
          <p>
            API, feed JSON/XML/CSV, ficheiro regular ou autorização
            para integração estruturada de fontes oficiais.
          </p>
        </div>

        <div className="rounded-lg border border-white/[0.06] bg-[#0b0b0b] p-5">
          <ShieldCheck className="h-6 w-6 text-yellow-400" />
          <h2>Como usamos</h2>
          <p>
            Com atribuição visível, cache, controlo de qualidade,
            limites técnicos e ligação à fonte original.
          </p>
        </div>

        <div className="rounded-lg border border-white/[0.06] bg-[#0b0b0b] p-5">
          <LinkIcon className="h-6 w-6 text-yellow-400" />
          <h2>Contacto</h2>
          <p>
            Para dados, competições ou parcerias:{" "}
            <a href="mailto:queensarena13@gmail.com">
              queensarena13@gmail.com
            </a>
            .
          </p>
        </div>
      </section>

      <section className="rounded-lg border border-white/[0.06] bg-[#0b0b0b] p-5">
        <h2>Dados pretendidos</h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {requestedData.map((item) => (
            <li key={item} className="rounded-lg bg-black/40 px-3 py-2">
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-lg border border-white/[0.06] bg-[#0b0b0b] p-5">
        <h2>Modalidades prioritárias</h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {prioritySports.map((sport) => (
            <li key={sport} className="rounded-lg bg-black/40 px-3 py-2">
              {sport}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-lg border border-white/[0.06] bg-[#0b0b0b] p-5">
        <h2>Enquadramento</h2>
        <p>
          A QueensArena não é uma aplicação de apostas. O objetivo é
          aumentar a visibilidade do desporto feminino e facilitar o
          acompanhamento de competições, equipas e atletas com dados
          organizados e fonte oficial identificada.
        </p>
      </section>
    </InfoPage>
  )
}
