# QueensArena Internal Testing

## Release name

```text
QueensArena 1.0.0 - Teste interno
```

## Release notes

```text
Primeira versão Android da QueensArena para teste interno.

Inclui resultados, calendário, competições acompanhadas, equipas, jogadoras, favoritos, login/perfil, notificações opcionais e páginas de privacidade, fontes e eliminação de conta.
```

## Testers

Começar com 3 a 10 pessoas:

- 1 Android recente.
- 1 Android mais antigo.
- 1 pessoa fora da equipa, para testar clareza da navegação.

## Checklist de instalação

- A app instala pela Play Store Internal Testing.
- O ícone aparece como QueensArena.
- A app abre sem barra de endereços do browser.
- O splash/logo aparece corretamente.
- O botão voltar do Android não cria comportamento estranho.

## Checklist de navegação

- Home abre rápido e mostra apenas o essencial.
- Modalidades mostra apenas modalidades.
- Competições filtram por modalidade.
- Página de futebol mostra apenas futebol.
- Página de andebol mostra apenas andebol.
- Página de equipa mostra apenas jogos dessa equipa/modalidade.
- Página de jogadora abre sem erro.
- Pesquisa encontra equipas, competições e jogadoras.

## Checklist de dados

- Liga BPI aparece com nome profissional.
- Andebol português aparece como `Campeonato Nacional 1.ª Divisão Feminina de Andebol`.
- Não aparece `1a Divisão - Women` no público.
- Não aparecem textos com `Ã`, `Â` ou caracteres partidos.
- Classificações e estatísticas carregam.
- Fontes e dados abre e lista as fontes.

## Checklist legal e conta

- Política de privacidade abre.
- Termos abrem.
- Cookies abre.
- Eliminação de conta abre.
- Contacto abre e o email é clicável.
- Login cria conta/inicia sessão.
- Perfil mostra email e favoritos sincronizados.
- Favoritos continuam a funcionar sem sessão.

## Checklist publicidade

- Se anúncios não estiverem aprovados, a app não deve prometer monetização ativa.
- Se AdMob/AdSense for ativado antes da submissão, atualizar Data Safety.
- Confirmar `ads.txt` e `app-ads.txt`.

## Critério para promover a produção

Promover para produção apenas quando:

- O teste interno instala sem avisos críticos.
- O domínio TWA é validado com o SHA-256 correto.
- `npm run verify:launch` passa.
- A Play Console não mostra problemas em Política, Data Safety ou App Content.
