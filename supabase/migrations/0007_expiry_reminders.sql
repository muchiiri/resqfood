-- A producer can set dedupe_key to make an insert safe to repeat. Clients cannot write it:
-- their only grant on notifications is update (read).
alter table public.notifications add column dedupe_key text;

create unique index notifications_user_dedupe_idx
  on public.notifications (user_id, dedupe_key)
  where dedupe_key is not null;

-- Daily digest of items expiring today or within 3 days (UAE time), one per user per day,
-- for users who have not turned expiry reminders off. Returns how many digests were created.
create function public.send_expiry_reminders()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_today date := (now() at time zone 'Asia/Dubai')::date;
  v_inserted integer;
begin
  with due as (
    select
      fi.owner_id,
      count(*) as item_count,
      array_agg(left(fi.name, 60) order by fi.expires_at, fi.created_at) as names
    from public.food_items fi
    join public.profiles p on p.id = fi.owner_id
    where fi.outcome is null
      and fi.expires_at between v_today and v_today + 3
      and p.notify_expiry
    group by fi.owner_id
  )
  insert into public.notifications (user_id, type, message, dedupe_key)
  select
    owner_id,
    'expiry',
    left(
      case
        when item_count = 1 then names[1] || ' expires within 3 days.'
        else item_count || ' items expire within 3 days: '
          || array_to_string(names[1:3], ', ')
          || case when item_count > 3 then ' and ' || (item_count - 3) || ' more' else '' end
          || '.'
      end,
      280
    ),
    'expiry-digest:' || v_today
  from due
  on conflict (user_id, dedupe_key) where dedupe_key is not null do nothing;

  get diagnostics v_inserted = row_count;
  return v_inserted;
end;
$$;

-- Supabase grants new functions to anon and authenticated by default, so name them explicitly.
revoke all on function public.send_expiry_reminders() from public, anon, authenticated;

-- 04:00 UTC is 08:00 in Asia/Dubai (UTC+4, no daylight saving).
-- If this fails, enable the pg_cron extension in the Supabase dashboard (Database, Extensions) and rerun.
create extension if not exists pg_cron with schema pg_catalog;

select cron.schedule('expiry-reminders', '0 4 * * *', 'select public.send_expiry_reminders()');
