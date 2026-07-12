-- Run in Supabase SQL Editor (staging + production when ready).
-- Adds editorial fields for What's On cards.

alter table public.events
  add column if not exists price_label text,
  add column if not exists salt_says text,
  add column if not exists recurrence_label text;

-- Workflow:
-- 1. Set price_label (e.g. "£8", "Free", "Mains from £12")
-- 2. Set salt_says for the editorial one-liner shown when expanded
-- 3. Set recurrence_label for recurring events (e.g. "TUESDAYS", "FIRST MONDAYS")
-- 4. Redeploy staging so the build picks up new values
