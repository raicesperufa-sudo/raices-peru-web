-- RAICES Peru: cuentas adultas, planes y perfiles minimos.
-- Ejecutar en un proyecto Supabase exclusivo de RAICES, nunca en JUFANTICS.

create extension if not exists pgcrypto;

create table if not exists public.raices_accounts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'adult_guardian'
    check (role in ('adult_guardian', 'admin_support', 'admin_security')),
  plan text not null default 'prueba-3-meses'
    check (plan in ('libre', 'prueba-3-meses', 'familia-plus-mensual', 'familia-plus-anual', 'cortesia', 'administracion-total')),
  access_level text not null default 'total'
    check (access_level in ('libre', 'total')),
  max_children smallint not null default 1 check (max_children between 0 and 2),
  valid_from timestamptz not null default now(),
  valid_until timestamptz,
  status text not null default 'active'
    check (status in ('active', 'suspended', 'expired')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.raices_child_profiles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  alias text not null check (char_length(alias) between 1 and 40),
  approximate_age smallint check (approximate_age between 2 and 99),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists raices_child_profiles_owner_idx
  on public.raices_child_profiles(owner_id);

alter table public.raices_accounts enable row level security;
alter table public.raices_child_profiles enable row level security;

revoke all on public.raices_accounts from anon;
revoke all on public.raices_child_profiles from anon;
revoke all on public.raices_accounts from authenticated;
revoke all on public.raices_child_profiles from authenticated;
grant select on public.raices_accounts to authenticated;
grant select, insert, update, delete on public.raices_child_profiles to authenticated;

drop policy if exists "adulto lee su cuenta" on public.raices_accounts;
create policy "adulto lee su cuenta"
  on public.raices_accounts for select to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

drop policy if exists "adulto lee sus perfiles" on public.raices_child_profiles;
create policy "adulto lee sus perfiles"
  on public.raices_child_profiles for select to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = owner_id);

drop policy if exists "adulto crea sus perfiles" on public.raices_child_profiles;
create policy "adulto crea sus perfiles"
  on public.raices_child_profiles for insert to authenticated
  with check (
    (select auth.uid()) is not null
    and (select auth.uid()) = owner_id
    and (select count(*) from public.raices_child_profiles profiles where profiles.owner_id = (select auth.uid()))
      < (select account.max_children from public.raices_accounts account where account.user_id = (select auth.uid()))
  );

drop policy if exists "adulto modifica sus perfiles" on public.raices_child_profiles;
create policy "adulto modifica sus perfiles"
  on public.raices_child_profiles for update to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = owner_id)
  with check ((select auth.uid()) is not null and (select auth.uid()) = owner_id);

drop policy if exists "adulto elimina sus perfiles" on public.raices_child_profiles;
create policy "adulto elimina sus perfiles"
  on public.raices_child_profiles for delete to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = owner_id);

create or replace function public.raices_create_trial_account()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.raices_accounts (
    user_id, role, plan, access_level, max_children, valid_from, valid_until, status
  ) values (
    new.id, 'adult_guardian', 'prueba-3-meses', 'total', 1, now(), now() + interval '3 months', 'active'
  ) on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists raices_auth_user_created on auth.users;
create trigger raices_auth_user_created
  after insert on auth.users
  for each row execute procedure public.raices_create_trial_account();

insert into public.raices_accounts (user_id, role, plan, access_level, max_children, valid_from, valid_until, status)
select id, 'adult_guardian', 'prueba-3-meses', 'total', 1, now(), now() + interval '3 months', 'active'
from auth.users
on conflict (user_id) do nothing;
