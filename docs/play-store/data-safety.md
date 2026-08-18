# Google Play Data Safety - QueensArena

Este ficheiro é um guia de preenchimento. As respostas finais na Play Console devem refletir o comportamento real da app no momento da submissão.

## A App Recolhe ou Partilha Dados do Utilizador?

Resposta recomendada: **Sim**.

Motivo: a app pode usar autenticação, notificações, analítica, publicidade/consentimento e armazenamento de preferências.

## Tipos de Dados

### Personal Info

- Email address.
- Recolhido se a utilizadora criar conta.
- Finalidade: funcionamento da app, gestão de conta e sincronização de favoritos/preferências.
- Partilha: não vendido; pode ser processado tecnicamente por Supabase/auth providers.
- Obrigatório: apenas para funcionalidades de conta.

### App Activity

- Páginas vistas e interações na app.
- Recolhido apenas quando analítica estiver configurada e consentida.
- Finalidade: analítica e melhoria do produto.
- Partilha: com fornecedores técnicos de analítica/hosting quando configurados.
- Obrigatório: não.

### Device or Other IDs

- Identificadores técnicos de notificações, browser/dispositivo, analítica ou publicidade.
- Finalidade: notificações, funcionamento da app, analítica ou anúncios quando o consentimento se aplica.
- Obrigatório: não, exceto para funcionalidades escolhidas pela utilizadora.

### User Content

- Não recolhido atualmente como posts públicos ou uploads.
- Favoritos/preferências não são conteúdo público.

### Location

- Não recolhemos localização precisa ou aproximada do dispositivo.

### Financial Info

- Não recolhido na versão atual.

## Security Practices

- Os dados são transmitidos por HTTPS.
- As utilizadoras podem pedir eliminação de conta/dados em:
  `https://queensarena-next.vercel.app/account-deletion`
- Política de privacidade:
  `https://queensarena-next.vercel.app/privacy`

## Account Deletion

A app suporta criação de conta. A Play Console deve incluir:

- In-app path: `/account-deletion`
- Web link: `https://queensarena-next.vercel.app/account-deletion`

## Ads

Se Google AdSense, AdMob ou outro fornecedor estiver ativo no momento da submissão, declarar recolha/partilha relacionada com publicidade conforme o produto usado.

Se os anúncios ainda não estiverem ativos, responder de acordo com a versão real submetida.

## Checklist Antes da Submissão

- Confirmar se notificações estão ativas em produção.
- Confirmar se analítica está ativa.
- Confirmar se publicidade está ativa.
- Confirmar fornecedor de dados e termos de uso dos dados exibidos.
