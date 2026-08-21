-- CEV Trendyol EuroVolley 2026 Women — matchday 1
-- Source: https://www.eurovolley.tv/pages/m_CJ1HXzt
-- Official competition page: https://eurovolley.cev.eu/en/2026/women/
-- Times below are UTC, matching the official EuroVolleyTV schedule.

alter table public.matches
  add column if not exists season text,
  add column if not exists gender text not null default 'women',
  add column if not exists data_status text not null default 'verified',
  add column if not exists source_url text,
  add column if not exists updated_at timestamptz not null default now();

insert into public.data_sources (
  provider,
  sport,
  competition,
  season,
  country,
  region,
  source_url,
  coverage_level,
  reliability,
  enabled,
  notes
)
select
  'CEV',
  'Volleyball',
  'CEV Trendyol EuroVolley 2026 Feminino',
  '2026',
  null,
  'Europa',
  'https://www.eurovolley.tv/pages/m_CJ1HXzt',
  'official_schedule',
  'official',
  true,
  'Calendário oficial CEV/EuroVolleyTV; horários gravados em UTC e resultados devem ser atualizados após os jogos.'
where not exists (
  select 1
  from public.data_sources
  where provider = 'CEV'
    and competition = 'CEV Trendyol EuroVolley 2026 Feminino'
    and season = '2026'
);

insert into public.matches (
  external_id,
  sport,
  home_team,
  away_team,
  home_score,
  away_score,
  venue,
  status,
  starts_at,
  competition,
  source,
  region,
  season,
  gender,
  data_status,
  source_url,
  updated_at
)
values
  ('cev-ev2026-w-20260821-fra-svk', 'Volleyball', 'France', 'Slovakia', 0, 0, 'Scandinavium, Gothenburg', 'SCHEDULED', '2026-08-21T11:00:00Z', 'CEV Trendyol EuroVolley 2026 Feminino', 'CEV', 'Europa', '2026', 'women', 'verified', 'https://www.eurovolley.tv/pages/m_CJ1HXzt', now()),
  ('cev-ev2026-w-20260821-aut-srb', 'Volleyball', 'Austria', 'Serbia', 0, 0, 'Brno Exhibition Centre, Brno', 'SCHEDULED', '2026-08-21T12:00:00Z', 'CEV Trendyol EuroVolley 2026 Feminino', 'CEV', 'Europa', '2026', 'women', 'verified', 'https://www.eurovolley.tv/pages/m_CJ1HXzt', now()),
  ('cev-ev2026-w-20260821-cro-ita', 'Volleyball', 'Croatia', 'Italy', 0, 0, 'Scandinavium, Gothenburg', 'SCHEDULED', '2026-08-21T14:00:00Z', 'CEV Trendyol EuroVolley 2026 Feminino', 'CEV', 'Europa', '2026', 'women', 'verified', 'https://www.eurovolley.tv/pages/m_CJ1HXzt', now()),
  ('cev-ev2026-w-20260821-bul-ukr', 'Volleyball', 'Bulgaria', 'Ukraine', 0, 0, 'Brno Exhibition Centre, Brno', 'SCHEDULED', '2026-08-21T15:00:00Z', 'CEV Trendyol EuroVolley 2026 Feminino', 'CEV', 'Europa', '2026', 'women', 'verified', 'https://www.eurovolley.tv/pages/m_CJ1HXzt', now()),
  ('cev-ev2026-w-20260821-aze-por', 'Volleyball', 'Azerbaijan', 'Portugal', 0, 0, 'National Gymnastics Arena, Baku', 'SCHEDULED', '2026-08-21T15:00:00Z', 'CEV Trendyol EuroVolley 2026 Feminino', 'CEV', 'Europa', '2026', 'women', 'verified', 'https://www.eurovolley.tv/pages/m_CJ1HXzt', now()),
  ('cev-ev2026-w-20260821-tur-lat', 'Volleyball', 'Türkiye', 'Latvia', 0, 0, 'Sinan Erdem, Istanbul', 'SCHEDULED', '2026-08-21T16:00:00Z', 'CEV Trendyol EuroVolley 2026 Feminino', 'CEV', 'Europa', '2026', 'women', 'verified', 'https://www.eurovolley.tv/pages/m_CJ1HXzt', now()),
  ('cev-ev2026-w-20260821-swe-mne', 'Volleyball', 'Sweden', 'Montenegro', 0, 0, 'Scandinavium, Gothenburg', 'SCHEDULED', '2026-08-21T17:00:00Z', 'CEV Trendyol EuroVolley 2026 Feminino', 'CEV', 'Europa', '2026', 'women', 'verified', 'https://www.eurovolley.tv/pages/m_CJ1HXzt', now()),
  ('cev-ev2026-w-20260821-cze-gre', 'Volleyball', 'Czechia', 'Greece', 0, 0, 'Brno Exhibition Centre, Brno', 'SCHEDULED', '2026-08-21T18:00:00Z', 'CEV Trendyol EuroVolley 2026 Feminino', 'CEV', 'Europa', '2026', 'women', 'verified', 'https://www.eurovolley.tv/pages/m_CJ1HXzt', now())
on conflict (external_id) do update set
  home_team = excluded.home_team,
  away_team = excluded.away_team,
  venue = excluded.venue,
  status = case when public.matches.status = 'FINISHED' then public.matches.status else excluded.status end,
  starts_at = excluded.starts_at,
  competition = excluded.competition,
  source = excluded.source,
  region = excluded.region,
  season = excluded.season,
  gender = excluded.gender,
  data_status = excluded.data_status,
  source_url = excluded.source_url,
  updated_at = now();

insert into public.data_import_batches (
  provider,
  sport,
  competition,
  season,
  source_url,
  status,
  imported_count,
  warning_count
)
values (
  'CEV',
  'Volleyball',
  'CEV Trendyol EuroVolley 2026 Feminino',
  '2026',
  'https://www.eurovolley.tv/pages/m_CJ1HXzt',
  'completed',
  8,
  0
);
