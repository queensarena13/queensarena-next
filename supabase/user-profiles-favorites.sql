create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  role text not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

alter table public.profiles
  add column if not exists email text,
  add column if not exists display_name text,
  add column if not exists role text not null default 'user',
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

alter table public.favorites
  alter column team_id drop not null;

alter table public.favorites
  add column if not exists team_key text,
  add column if not exists team_name text,
  add column if not exists sport text,
  add column if not exists updated_at timestamptz not null default now();

create unique index if not exists favorites_user_team_key_unique
  on public.favorites (user_id, team_key)
  where team_key is not null;

create index if not exists favorites_user_id_idx
  on public.favorites (user_id);

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do update
    set email = excluded.email,
        updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;

create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row execute procedure public.handle_new_user_profile();

insert into public.profiles (id, email, display_name)
select
  id,
  email,
  coalesce(raw_user_meta_data->>'display_name', split_part(email, '@', 1))
from auth.users
on conflict (id) do update
  set email = excluded.email,
      updated_at = now();

do $$
begin
  if exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'Public read profiles'
  ) then
    drop policy "Public read profiles" on public.profiles;
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'Users read own profile'
  ) then
    create policy "Users read own profile"
      on public.profiles for select
      using (auth.uid() = id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'Users update own profile'
  ) then
    create policy "Users update own profile"
      on public.profiles for update
      using (auth.uid() = id)
      with check (auth.uid() = id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'favorites'
      and policyname = 'Users read own favorites'
  ) then
    create policy "Users read own favorites"
      on public.favorites for select
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'favorites'
      and policyname = 'Users insert own favorites'
  ) then
    create policy "Users insert own favorites"
      on public.favorites for insert
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'favorites'
      and policyname = 'Users update own favorites'
  ) then
    create policy "Users update own favorites"
      on public.favorites for update
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'favorites'
      and policyname = 'Users delete own favorites'
  ) then
    create policy "Users delete own favorites"
      on public.favorites for delete
      using (auth.uid() = user_id);
  end if;
end $$;
