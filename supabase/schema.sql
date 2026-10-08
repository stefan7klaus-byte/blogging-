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

create index if not exists articles_published_at_idx on public.articles(published_at desc);
create index if not exists articles_category_idx on public.articles(category_id);

alter table public.categories enable row level security;
alter table public.articles enable row level security;

drop policy if exists "Public can read categories" on public.categories;
create policy "Public can read categories" on public.categories
for select to anon, authenticated using (true);

drop policy if exists "Public can read published articles" on public.articles;
create policy "Public can read published articles" on public.articles
for select to anon, authenticated using (published = true);

insert into public.categories (name, slug, description) values
('Cybersecurity','cybersecurity','Security, threats and defensive awareness'),
('Digital Assets','digital-assets','Blockchain, cryptocurrency and transaction research'),
('OSINT','osint','Open-source intelligence and verification'),
('Fraud Awareness','fraud-awareness','Scam patterns, prevention and digital-risk education')
on conflict (slug) do nothing;
