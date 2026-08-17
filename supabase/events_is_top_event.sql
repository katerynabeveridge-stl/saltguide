-- Additive only. Safe for Pebbles List.
-- Run in Supabase SQL Editor on project fqawqtqxiuynmuwvqmir.
--
-- Flags events for Saltguide home "Top events coming up".
-- Default false so existing events stay off the featured section until you opt in.

alter table public.events
  add column if not exists is_top_event boolean not null default false;

comment on column public.events.is_top_event is
  'When true, eligible for Saltguide home "Top events coming up". Default false.';

-- Tick upcoming Saltguide events in Table Editor (events → is_top_event),
-- or set a few by title, for example:
--
-- update public.events
-- set is_top_event = true
-- where show_on_saltguide = true
--   and status = 'approved'
--   and title in (
--     'Fights Camera Action!',
--     'Millie''s Nightclub'
--   );
