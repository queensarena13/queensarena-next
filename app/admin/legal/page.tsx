import type { Metadata } from "next"
import { InfoPage } from "@/components/info-page"

export const metadata: Metadata = {
  title: "Base legal",
}

export default function LegalAdminPage() {
  return (
    <InfoPage
      eyebrow="Portugal"
      title="Checklist legal portuguesa"
      description="Base de controlo antes de monetização, publicidade, contas de utilizador e notificações em produção."
    >
      <p>
        <strong>RGPD e Lei n.º 58/2019:</strong> a política de
        privacidade já refere direitos dos titulares, contacto e
        CNPD. Falta mapear dados, finalidades, fundamentos de
        licitude, prazos de conservação e subcontratantes antes de
        lançar contas, anúncios ou analítica.
      </p>

      <p>
        <strong>Cookies e consentimento:</strong> já existe uma
        primeira página de cookies e um aviso de consentimento.
        Antes de analítica ou publicidade, falta ligar o mecanismo
        aos fornecedores reais usados.
      </p>

      <p>
        <strong>Informação comercial:</strong> se houver atividade
        comercial, a app deve identificar o responsável, NIF, morada
        ou sede quando aplicável, meios de contacto e restantes
        elementos obrigatórios.
      </p>

      <p>
        <strong>Livro de Reclamações Eletrónico:</strong> quando
        existir prestação de serviços ou venda ao público em
        Portugal, é necessário confirmar a obrigação de registo e
        ligação ao Livro de Reclamações Eletrónico.
      </p>

      <p>
        <strong>Termos de utilização:</strong> já existe uma base
        com limites de responsabilidade, uso informativo e marcas de
        terceiros. Deve ser revista juridicamente antes de
        monetização.
      </p>
    </InfoPage>
  )
}
