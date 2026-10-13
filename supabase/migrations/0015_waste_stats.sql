-- Read-only totals over the caller's own waste log. Both functions run as the caller (security invoker), so the
-- table's row level security applies as well as the explicit user_id filter. They change no data.

-- All-time totals. The sums skip entries that have no weight or no value; the counts say how many that is.
create function public.waste_stats_total()
returns table (
  eaten_kg numeric,
  shared_kg numeric,
  wasted_kg numeric,
  eaten_value numeric,
  shared_value numeric,
  wasted_value numeric,
  entries bigint,
  entries_without_weight bigint,
  entries_without_value bigint
)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    coalesce(sum(w.weight_kg) filter (where w.outcome = 'eaten'), 0),
    coalesce(sum(w.weight_kg) filter (where w.outcome = 'shared'), 0),
    coalesce(sum(w.weight_kg) filter (where w.outcome = 'thrown_away'), 0),
    coalesce(sum(w.estimated_value) filter (where w.outcome = 'eaten'), 0),
    coalesce(sum(w.estimated_value) filter (where w.outcome = 'shared'), 0),
    coalesce(sum(w.estimated_value) filter (where w.outcome = 'thrown_away'), 0),
    count(*),
    count(*) filter (where w.weight_kg is null),
    count(*) filter (where w.estimated_value is null)
  from public.waste_log_entries w
  where w.user_id = auth.uid();
$$;

-- One row per calendar month (Asia/Dubai time) for the last p_months months, oldest first, including the current
-- month. Months with no entries come back as zeros.
create function public.waste_stats_monthly(p_months integer)
returns table (
  month_start date,
  eaten_kg numeric,
  shared_kg numeric,
  wasted_kg numeric,
  eaten_value numeric,
  shared_value numeric,
  wasted_value numeric
)
language plpgsql
stable
security invoker
set search_path = ''
as $$
begin
  if p_months is null or p_months < 1 or p_months > 24 then
    raise exception 'invalid months';
  end if;

  return query
  with months as (
    select (date_trunc('month', now() at time zone 'Asia/Dubai') - make_interval(months => g))::date as start
    from generate_series(0, p_months - 1) as g
  )
  select
    m.start,
    coalesce(sum(w.weight_kg) filter (where w.outcome = 'eaten'), 0),
    coalesce(sum(w.weight_kg) filter (where w.outcome = 'shared'), 0),
    coalesce(sum(w.weight_kg) filter (where w.outcome = 'thrown_away'), 0),
    coalesce(sum(w.estimated_value) filter (where w.outcome = 'eaten'), 0),
    coalesce(sum(w.estimated_value) filter (where w.outcome = 'shared'), 0),
    coalesce(sum(w.estimated_value) filter (where w.outcome = 'thrown_away'), 0)
  from months m
  left join public.waste_log_entries w
    on w.user_id = auth.uid()
    and (w.logged_at at time zone 'Asia/Dubai') >= m.start
    and (w.logged_at at time zone 'Asia/Dubai') < (m.start + interval '1 month')
  group by m.start
  order by m.start;
end;
$$;

-- Supabase grants new functions to anon and authenticated by default, so revoke first (finding F-10).
revoke all on function public.waste_stats_total() from public, anon, authenticated;
grant execute on function public.waste_stats_total() to authenticated;
revoke all on function public.waste_stats_monthly(integer) from public, anon, authenticated;
grant execute on function public.waste_stats_monthly(integer) to authenticated;
