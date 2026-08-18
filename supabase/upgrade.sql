alter table public.matches
  add column if not exists competition text,
  add column if not exists source text,
  add column if not exists region text;

create unique index if not exists leagues_name_unique
  on public.leagues (name);

create unique index if not exists teams_name_unique
  on public.teams (name);

create unique index if not exists matches_external_id_unique
  on public.matches (external_id);
