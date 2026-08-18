import type { Metadata } from "next"
import { InfoPage } from "@/components/info-page"

export const metadata: Metadata = {
  title: "Publicidade",
}

const packages = [
  {
    title: "Parceiro da semana",
    text: "Destaque discreto para uma marca ligada ao desporto feminino.",
  },
  {
    title: "Competição em destaque",
    text: "Associação editorial a uma competição acompanhada pela QueensArena.",
  },
  {
    title: "Clube ou academia",
    text: "Presença institucional para projetos ligados ao futebol ou andebol feminino.",
  },
]

export default function AdvertisePage() {
  return (
    <InfoPage
      eyebrow="Parcerias"
      title="Publicidade e patrocínios"
      description="A QueensArena abre espaço a marcas, clubes e projetos que queiram crescer junto da comunidade do desporto feminino."
    >
      <p>
        A experiência é pensada para ser discreta e útil: poucos espaços,
        sem cobrir resultados, sem pop-ups agressivos e com prioridade à
        leitura no telemóvel.
      </p>

      <p>
        Para Portugal, o caminho passa por combinar publicidade
        automática bem controlada com parcerias diretas com marcas
        ligadas ao desporto feminino, academias, clubes, fisioterapia,
        equipamentos e media locais.
      </p>

      <div className="grid gap-3 md:grid-cols-3">
        {packages.map((item) => (
          <div
            key={item.title}
            className="rounded-lg border border-white/[0.08] bg-[#0b0b0b] p-4"
          >
            <h2 className="font-black text-white">
              {item.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              {item.text}
            </p>
          </div>
        ))}
      </div>

      <p>
        Para propostas comerciais, o contacto é{" "}
        <a href="mailto:queensarena13@gmail.com">
          queensarena13@gmail.com
        </a>
        .
      </p>
    </InfoPage>
  )
}
