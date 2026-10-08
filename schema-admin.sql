create extension if not exists "pgcrypto";

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

revoke all on table public.admin_users from anon, authenticated;
grant select on public.admin_users to authenticated;
grant select, insert, update, delete on public.articles to authenticated;

drop policy if exists "Admins can read all articles" on public.articles;
create policy "Admins can read all articles" on public.articles
for select to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())));

drop policy if exists "Admins can insert articles" on public.articles;
create policy "Admins can insert articles" on public.articles
for insert to authenticated
with check (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())));

drop policy if exists "Admins can update articles" on public.articles;
create policy "Admins can update articles" on public.articles
for update to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())))
with check (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())));

drop policy if exists "Admins can delete articles" on public.articles;
create policy "Admins can delete articles" on public.articles
for delete to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())));

drop policy if exists "Admins can read own admin row" on public.admin_users;
create policy "Admins can read own admin row" on public.admin_users
for select to authenticated
using (user_id = (select auth.uid()));

-- After creating the publisher in Supabase Authentication:
-- insert into public.admin_users (user_id) values ('YOUR-AUTH-USER-UUID');
