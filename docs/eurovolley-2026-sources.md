# EuroVolley 2026 — fontes e factos confirmados

## Fontes oficiais

- CEV EuroVolley 2026 Women: https://eurovolley.cev.eu/en/2026/women/
- CEV — calendário completo: https://www.cev.eu/articles/volleyball/cev-eurovolley-2026-full-competition-schedule-now-released/

## Factos confirmados

- EuroVolley 2026 feminino: 21 de agosto a 6 de setembro de 2026; 24 seleções; 76 jogos; países anfitriões Türkiye, Czechia, Azerbaijão e Suécia.
- A CEV indica que a fase de grupos e as fases eliminatórias têm calendário oficial publicado.

## Decisão técnica pendente

O projeto atual usa TheSportsDB, API-SPORTS e fontes oficiais manuais. Para o EuroVolley feminino, foi criado um importador controlado a partir das fontes oficiais CEV/EuroVolleyTV, com `source_url`, `data_status` e auditoria de atualização. Não devem ser inventados resultados ou horários.

## Observação sobre a extração

A página oficial resumida da CEV expõe datas, países anfitriões, número de seleções e número de jogos, mas o calendário detalhado é carregado/ligado de forma dinâmica. Os jogos carregados foram validados pela agenda oficial EuroVolleyTV e gravados com horários UTC.

## Calendário detalhado oficial feminino

A página oficial da CEV liga o EuroVolley feminino à competição antiga com o identificador `ID=1573&PID=2992`: https://www-old.cev.eu/Competition-Area/Competition.aspx?ID=1573&PID=2992. A página é dinâmica/antiga e não forneceu conteúdo textual no ambiente de extração, mas o link é uma referência oficial publicada pela própria CEV. A mesma página oficial disponibiliza o boletim de equipas de 20 de agosto de 2026: https://eurovolley.cev.eu/media/spxfowrh/cev-trendyol-ev2026-women-bulletin-no-1.pdf.

## Agenda operacional EuroVolleyTV

A agenda oficial do EuroVolleyTV apresenta, para hoje, os seguintes jogos da fase de grupos feminina: França–Eslováquia, Áustria–Sérvia, Croácia–Itália, Bulgária–Ucrânia, Azerbaijão–Portugal, Türkiye–Letónia, Suécia–Montenegro e Czechia–Grécia. A agenda também apresentava, para o dia seguinte, Bélgica–Espanha e Alemanha–Eslovénia; esses jogos ficam documentados como fonte para a próxima carga feminina. A fonte é https://www.eurovolley.tv/pages/m_CJ1HXzt.

Os horários relativos da página foram convertidos para UTC com base no horário oficial CEV apresentado no calendário de competição. Os resultados devem ser atualizados após os jogos, sem substituir a fonte oficial.
