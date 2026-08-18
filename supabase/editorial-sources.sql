create table if not exists public.editorial_sources (
  slug text primary key,
  name text not null,
  homepage_url text not null,
  sports_url text not null,
  rss_url text,
  category text not null,
  region text not null,
  language text not null,
  coverage text[] not null default '{}',
  priority integer not null default 50,
  enabled boolean not null default true,
  rights_note text not null default 'Links e metadados; artigos completos permanecem na fonte original.',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.editorial_sources enable row level security;

drop policy if exists "Public read editorial sources" on public.editorial_sources;

create policy "Public read editorial sources"
  on public.editorial_sources
  for select
  using (enabled = true);
