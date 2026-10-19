-- Run this in Supabase SQL Editor after the existing Zenith schema.
-- Guest accounts use Supabase Auth; new comments and posts remain pending until approved by an administrator.

create table if not exists public.article_comments (
  id uuid primary key default gen_random_uuid(),
  article_slug text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null default 'Community member',
  body text not null check (char_length(body) between 1 and 3000),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);
create index if not exists article_comments_article_status_created_idx
  on public.article_comments(article_slug, status, created_at);

create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null default 'Community member',
  title text not null check (char_length(title) between 1 and 120),
  body text not null check (char_length(body) between 1 and 5000),
  image_url text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);
create index if not exists community_posts_status_created_idx
  on public.community_posts(status, created_at desc);

alter table public.article_comments enable row level security;
alter table public.community_posts enable row level security;
revoke all on public.article_comments from anon, authenticated;
revoke all on public.community_posts from anon, authenticated;
grant select on public.article_comments to anon, authenticated;
grant insert on public.article_comments to authenticated;
grant select on public.community_posts to anon, authenticated;
grant insert on public.community_posts to authenticated;

drop policy if exists "Anyone can read approved article comments" on public.article_comments;
create policy "Anyone can read approved article comments" on public.article_comments
  for select to anon, authenticated using (status = 'approved' or user_id = (select auth.uid()));
drop policy if exists "Signed-in users can submit comments" on public.article_comments;
create policy "Signed-in users can submit comments" on public.article_comments
  for insert to authenticated with check (
    user_id = (select auth.uid()) and status = 'pending'
    and char_length(trim(body)) between 1 and 3000
    and char_length(trim(article_slug)) between 1 and 200
  );

drop policy if exists "Anyone can read approved community posts" on public.community_posts;
create policy "Anyone can read approved community posts" on public.community_posts
  for select to anon, authenticated using (status = 'approved' or user_id = (select auth.uid()));
drop policy if exists "Signed-in users can submit community posts" on public.community_posts;
create policy "Signed-in users can submit community posts" on public.community_posts
  for insert to authenticated with check (
    user_id = (select auth.uid()) and status = 'pending'
    and char_length(trim(title)) between 1 and 120
    and char_length(trim(body)) between 1 and 5000
  );

-- Create a public image bucket with authenticated, per-user upload paths.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('community-images', 'community-images', true, 5242880, array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update set public = true, file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg','image/png','image/webp','image/gif'];

drop policy if exists "Public can view community images" on storage.objects;
create policy "Public can view community images" on storage.objects
  for select to anon, authenticated using (bucket_id = 'community-images');
drop policy if exists "Users can upload community images to own folder" on storage.objects;
create policy "Users can upload community images to own folder" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'community-images' and (storage.foldername(name))[1] = (select auth.uid())::text
  );
drop policy if exists "Users can delete own community images" on storage.objects;
create policy "Users can delete own community images" on storage.objects
  for delete to authenticated using (
    bucket_id = 'community-images' and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- To approve submissions, update status to 'approved' in the Supabase Table Editor.
-- Keep the publishable key in browser code; never expose a service_role key.
