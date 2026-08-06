-- Additive only. Safe for Pebbles List.
-- Run in Supabase SQL Editor on project fqawqtqxiuynmuwvqmir.
--
-- Why this won't break Pebbles:
-- 1. We only ADD columns (no drops, renames, or view recreations).
-- 2. show_on_pebbles defaults to TRUE — existing behaviour stays "show everything"
--    if/when Pebbles starts filtering on this column.
-- 3. If Pebbles does not query these columns yet, adding them has zero effect.
-- 4. show_on_saltguide defaults to FALSE — Saltguide must opt events in explicitly.
-- 5. places already has both columns; this only touches events.

alter table public.events
  add column if not exists show_on_pebbles boolean not null default true,
  add column if not exists show_on_saltguide boolean not null default false;

comment on column public.events.show_on_pebbles is
  'When true, eligible for Pebbles List. Default true so existing events keep appearing.';

comment on column public.events.show_on_saltguide is
  'When true, eligible for Saltguide. Default false — opt in per event.';

-- Optional indexes for filtered reads (safe, additive).
create index if not exists events_show_on_pebbles_idx
  on public.events (show_on_pebbles)
  where show_on_pebbles = true;

create index if not exists events_show_on_saltguide_idx
  on public.events (show_on_saltguide)
  where show_on_saltguide = true;

-- Sanity check (optional): should return true/false counts.
-- select
--   count(*) filter (where show_on_pebbles) as pebbles_true,
--   count(*) filter (where not show_on_pebbles) as pebbles_false,
--   count(*) filter (where show_on_saltguide) as salt_true,
--   count(*) filter (where not show_on_saltguide) as salt_false
-- from public.events;
