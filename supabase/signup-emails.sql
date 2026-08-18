create table if not exists public.signup_emails (
  email text primary key,
  status text not null default 'submitted',
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

alter table public.signup_emails enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'signup_emails'
      and policyname = 'Service role manages signup emails'
  ) then
    create policy "Service role manages signup emails"
      on public.signup_emails
      for all
      using (auth.role() = 'service_role')
      with check (auth.role() = 'service_role');
  end if;
end $$;
