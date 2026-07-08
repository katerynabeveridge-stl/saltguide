-- Run in Supabase SQL Editor (staging + production when ready).
-- Adds cover image fields and a public media bucket for Saltguide.

-- 1. Image URL columns on places and events
alter table public.places
  add column if not exists cover_image_url text,
  add column if not exists cover_image_alt text;

alter table public.events
  add column if not exists cover_image_url text,
  add column if not exists cover_image_alt text;

-- If place_directory is a view, recreate it so cover_image_url / cover_image_alt
-- are exposed (adjust to match your view definition). Example:
-- create or replace view public.place_directory as
--   select p.*, ...existing joins...
--   from public.places p ...;

-- 2. Storage bucket (public read)
insert into storage.buckets (id, name, public)
values ('guide-media', 'guide-media', true)
on conflict (id) do update set public = true;

-- 3. Storage policies
drop policy if exists "Public read guide media" on storage.objects;
create policy "Public read guide media"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'guide-media');

drop policy if exists "Authenticated upload guide media" on storage.objects;
create policy "Authenticated upload guide media"
on storage.objects for insert
to authenticated
with check (bucket_id = 'guide-media');

drop policy if exists "Authenticated update guide media" on storage.objects;
create policy "Authenticated update guide media"
on storage.objects for update
to authenticated
using (bucket_id = 'guide-media');

-- Upload workflow:
-- 1. Storage → guide-media → upload to places/ or events/ folder
-- 2. Copy public URL into cover_image_url on the row
-- 3. Optional: cover_image_alt for accessibility
-- 4. Redeploy staging so the build picks up new URLs
