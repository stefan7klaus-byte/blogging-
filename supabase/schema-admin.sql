create extension if not exists "pgcrypto";

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text not null,
  category_id uuid references public.categories(id) on delete set null,
  author_name text not null default 'Zenith Hackers Intelligence',
  cover_image text,
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists articles_published_at_idx on public.articles(published_at desc);
create index if not exists articles_category_idx on public.articles(category_id);

alter table public.categories enable row level security;
alter table public.articles enable row level security;
alter table public.admin_users enable row level security;

revoke all on table public.categories from anon, authenticated;
revoke all on table public.articles from anon, authenticated;
revoke all on table public.admin_users from anon, authenticated;
grant select on public.admin_users to authenticated;

grant select on public.categories to anon, authenticated;
grant select on public.articles to anon, authenticated;
grant select, insert, update, delete on public.articles to authenticated;

drop policy if exists "Public can read categories" on public.categories;
create policy "Public can read categories" on public.categories
for select to anon, authenticated using (true);

drop policy if exists "Public can read published articles" on public.articles;
create policy "Public can read published articles" on public.articles
for select to anon, authenticated using (published = true);

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

insert into public.categories (name, slug, description) values
('Cybersecurity','cybersecurity','Security, threats and defensive awareness'),
('Digital Assets','digital-assets','Blockchain, cryptocurrency and transaction research'),
('OSINT','osint','Open-source intelligence and verification'),
('Fraud Awareness','fraud-awareness','Scam patterns, prevention and digital-risk education')
on conflict (slug) do nothing;
