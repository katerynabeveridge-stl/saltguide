-- Run in Supabase SQL Editor (staging + production when ready).
-- Gallery + featured flags for Places listing card layouts.

alter table public.places
  add column if not exists gallery_image_urls text[] default '{}',
  add column if not exists is_featured boolean default false;

-- If place_directory is a view, recreate it so gallery_image_urls and
-- is_featured are exposed. Example:
--   create or replace view public.place_directory as
--     select p.*, ...existing joins...
--     from public.places p ...;

-- Layout rules (app-side):
--   0 images                         → icon + name row
--   1 image, not salt/featured       → left thumbnail
--   1–3 images + salt pick/featured  → single hero
--     (or 2–3 images total)          → single hero
--   lead + ≥3 gallery URLs           → hero + row of 3

-- Workflow:
-- 1. Set photo_url (or cover_image_url) as the lead / hero photo
-- 2. Set gallery_image_urls to trailing shots (ordered)
-- 3. Optional: is_featured = true for FEATURED badge + hero preference
-- 4. Redeploy staging so the build picks up new values
