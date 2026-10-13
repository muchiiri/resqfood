-- Marks unclaimed listings as expired once their available-until time has passed. Claimed listings
-- are left alone: a pending claim stays until it is collected or cancelled. Returns how many listings
-- it changed, and changes nothing the second time it runs.
create function public.expire_listings()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_expired integer;
begin
  update public.listings
  set status = 'expired'
  where status = 'available'
    and available_until <= now();

  get diagnostics v_expired = row_count;
  return v_expired;
end;
$$;

-- Supabase grants new functions to anon and authenticated by default, so name them explicitly.
-- Nobody is granted execute: only the cron job and the SQL editor run it.
revoke all on function public.expire_listings() from public, anon, authenticated;

-- If this fails, enable the pg_cron extension in the Supabase dashboard (Database, Extensions) and rerun.
create extension if not exists pg_cron with schema pg_catalog;

select cron.schedule('listing-expiry', '*/5 * * * *', 'select public.expire_listings()');
