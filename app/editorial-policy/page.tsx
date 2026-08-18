import type { Metadata } from "next"
import { InfoPage } from "@/components/info-page"

export const metadata: Metadata = {
  title: "Política editorial e fontes",
}

export default function EditorialPolicyPage() {
  return (
    <InfoPage
      eyebrow="Transparência"
      title="Política editorial e legal das fontes"
      description="Como a QueensArena escolhe, identifica e corrige dados de competições, equipas, jogos e jogadoras."
    >
      <h2>Critério de fontes</h2>
      <p>
        A QueensArena privilegia fontes oficiais, fornecedores
        licenciados e APIs com documentação pública. Quando uma
        competição ainda não tem integração completa, a app identifica
        essa cobertura como lista acompanhada ou cobertura em validação.
      </p>

      <h2>Dados e correções</h2>
      <p>
        Resultados, calendários, classificações, plantéis e estatísticas
        podem ser atualizados por federações, ligas, clubes ou
        fornecedores após a primeira publicação. Quando detetarmos erro
        relevante, corrigimos a informação e mantemos a fonte de dados
        identificada na página de fontes.
      </p>

      <h2>Uso de nomes, marcas e logótipos</h2>
      <p>
        Nomes de clubes, seleções, competições, marcas, logótipos,
        imagens e outros sinais distintivos pertencem aos respetivos
        titulares. A sua referência na QueensArena tem finalidade
        informativa, editorial e de identificação desportiva, sem sugerir
        patrocínio, parceria ou autorização comercial salvo indicação
        expressa.
      </p>

      <h2>Portugal e proteção das utilizadoras</h2>
      <p>
        A app é preparada para cumprir regras portuguesas e europeias de
        privacidade, comunicações eletrónicas e publicidade. Analytics,
        notificações e publicidade dependem de consentimento quando
        aplicável.
      </p>

      <h2>Contacto</h2>
      <p>
        Correções, pedidos de fonte, remoção de conteúdo ou dúvidas
        legais podem ser enviados para{" "}
        <a href="mailto:queensarena13@gmail.com">
          queensarena13@gmail.com
        </a>
        .
      </p>
    </InfoPage>
  )
}
