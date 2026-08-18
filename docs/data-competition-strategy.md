# QueensArena data and competition strategy

## Principio

A QueensArena pode ter a sua propria API e a sua propria base de dados. Isso ja comecou com a QueensArena Data API.

Mas a app nao consegue ser totalmente independente de terceiros para dados reais automáticos. Resultados, calendarios, planteis e estatisticas precisam sempre de uma origem:

- fornecedor pago/licenciado;
- API publica;
- fonte oficial de federacao/liga/clube;
- carregamento editorial/manual;
- parceria direta com competicoes, clubes ou federacoes.

O caminho certo e nao depender de um unico fornecedor. A QueensArena deve funcionar como camada propria: recolhe, valida, guarda, normaliza e apresenta dados de varias origens.

## Arquitetura recomendada

1. QueensArena Data API como fonte principal da app.
2. Supabase como base propria de dados normalizados.
3. Conectores por origem: TheSportsDB, Sportmonks, API-Sports, fontes oficiais e importacao manual.
4. Tabela de qualidade/cobertura por competicao.
5. Painel interno para corrigir nomes, mapear equipas e completar dados em falta.
6. Sincronizacao automatica diaria no plano gratuito da Vercel; mais frequente quando houver plano pago/fornecedor pago.

## Niveis de cobertura

### Nivel 1: Essencial

Dados minimos para aparecer publicamente:

- competicao;
- equipas;
- calendario;
- resultado;
- estado do jogo;
- fonte;
- data da ultima sincronizacao.

### Nivel 2: Bom

Dados que tornam a app realmente util:

- classificacao;
- emblemas;
- local do jogo;
- epoca;
- historico de resultados;
- detalhe de equipa.

### Nivel 3: Premium

Dados que normalmente exigem fornecedor pago ou parceria:

- planteis;
- jogadoras;
- estatisticas por jogadora;
- eventos do jogo;
- substituicoes;
- lineups;
- notificacoes em tempo quase real.

## Competicoes prioritarias

### Prioridade 1: lancamento publico

- Liga BPI
- Taca de Portugal Feminina
- Supertaca Feminina
- Liga Portuguesa de Andebol Feminino / Campeonato Nacional 1a Divisao Feminina
- Taca de Portugal Feminina de Andebol
- Supertaca Feminina de Andebol
- Campeonato Nacional Feminino de Futsal
- Taca Nacional Feminina de Futsal
- UEFA Women's Champions League
- UEFA Women's EURO
- NWSL
- EHF Champions League Women
- World Women's Handball Championship
- European Women's Handball Championship

### Prioridade 2: crescimento europeu

- Barclays Women's Super League
- Liga F
- Frauen Bundesliga
- Serie A Femminile
- Premiere Ligue Feminine
- Eredivisie Vrouwen
- Damallsvenskan
- Elitedivisionen Women

### Prioridade 3: selecoes e global

- FIFA Women's World Cup
- UEFA Women's Nations League
- SheBelieves Cup
- Algarve Cup
- Jogos Olimpicos femininos
- Copa America Femenina
- AFC Women's Asian Cup
- CAF Women's Africa Cup of Nations

### Prioridade 4: Portugal expandido

- Liga 2 feminina, se houver dados fiaveis
- competicoes sub-19 femininas
- futsal feminino nacional
- principais clubes portugueses em competicoes europeias
- Divisao de Honra Feminina de Andebol
- Campeonato Nacional 2a Divisao Feminina de Andebol
- Taca FAP feminina, se houver calendario/resultados publicos
- andebol de praia feminino nacional
- selecoes portuguesas de futsal feminino
- selecoes portuguesas de andebol de praia feminino

## Portugal como area estrategica

Portugal deve ser uma vantagem da QueensArena, nao uma nota secundaria.

Modalidades portuguesas prioritarias:

- futebol feminino;
- futsal feminino;
- andebol feminino;
- andebol de praia feminino.

Motivo:

- Portugal tem competicoes femininas relevantes e publico de nicho mal servido por apps internacionais.
- Futsal e andebol de praia sao modalidades onde Portugal tem peso competitivo internacional.
- As fontes internacionais tendem a dar pouca profundidade a competicoes portuguesas femininas.
- A QueensArena pode diferenciar-se por cobrir bem aquilo que as grandes plataformas cobrem mal.

## Estrategia para sermos "o nosso fornecedor"

A QueensArena deve ser o fornecedor da app, mas nao necessariamente a origem primaria de todos os dados.

Isto significa:

- a app nunca chama diretamente todos os fornecedores externos;
- a app chama a QueensArena Data API;
- a QueensArena Data API decide que fonte usar;
- os dados ficam guardados e normalizados;
- se um fornecedor falhar, a app continua com dados anteriores e estado claro;
- quando houver correcoes manuais, essas correcoes ficam na nossa base.

## Fornecedor automatico proprio

Podemos criar um fornecedor automatico proprio em termos tecnicos:

- crawlers/conectores que leem fontes publicas;
- importadores que recebem CSV/Excel/manual;
- normalizacao automatica de equipas, competicoes e epocas;
- detecao de alteracoes;
- alertas quando uma fonte muda;
- cache historica propria;
- API publica e privada da QueensArena.

Mas isto nao elimina a necessidade de uma origem primaria. Um sistema automatico proprio precisa sempre de buscar dados a algum lado.

Fontes possiveis:

- paginas oficiais de federacoes;
- sites oficiais de competicoes;
- APIs publicas ou pagas;
- dados enviados por clubes;
- ficheiros publicados oficialmente;
- insercao editorial.

Risco principal:

- nem todas as paginas permitem recolha automatica;
- algumas fontes mudam estrutura sem aviso;
- pode haver limites legais/termos de uso;
- dados oficiais podem exigir licenca se forem usados comercialmente;
- scraping sem autorizacao pode ser fragil e arriscado para uma app publica.

Conclusao:

A QueensArena deve criar o seu motor automatico proprio, mas com fontes autorizadas, rastreaveis e substituiveis.

## Modelo ideal para modalidades portuguesas

1. Comecar com catalogo proprio de competicoes portuguesas.
2. Tentar fonte oficial/publica para calendario e resultados.
3. Guardar tudo em Supabase.
4. Criar mapeamento manual de equipas quando necessario.
5. Adicionar importacao CSV para corrigir falhas rapidamente.
6. Contactar federacoes/ligas/clubes para acesso oficial quando a app ganhar tracao.
7. Usar fornecedor pago apenas onde o custo compense a cobertura.

## O que podemos automatizar sem pagar ja

- jogos e resultados de competicoes disponiveis em APIs gratuitas;
- catalogo de competicoes e equipas acompanhadas;
- sincronizacao diaria;
- normalizacao de nomes;
- deteção de equipas por mapear;
- API publica propria;
- painel de qualidade de dados.

## O que dificilmente sera gratuito e completo

- Liga BPI com estatisticas completas;
- planteis completos e atualizados;
- estatisticas por jogadora;
- eventos ao minuto;
- notificacoes em tempo real;
- dados oficiais com direito comercial claro.

## Decisao recomendada

Antes de pagar fornecedor:

1. Fechar lista de competicoes prioritarias.
2. Mapear que dados ja conseguimos obter gratuitamente.
3. Identificar lacunas por competicao.
4. Pedir teste/free trial a 1 ou 2 fornecedores.
5. Comparar cobertura real para futebol feminino e Portugal.
6. So depois escolher fornecedor pago.

Antes de pagar Google:

1. Gerar Android App Bundle.
2. Confirmar `assetlinks.json`.
3. Testar TWA em Android.
4. Fazer teste interno.
5. Corrigir problemas.
6. Pagar/submeter quando a base estiver estavel.
