-- One row per thing eaten, shared or thrown away. Rows made from a pantry outcome point at that outcome row and
-- are written by the functions below; clients can only add and delete manual rows (no food_item_id).
create table public.waste_log_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  food_item_id uuid references public.food_items (id) on delete set null,
  name text not null check (char_length(name) between 1 and 100),
  outcome public.food_outcome not null,
  quantity numeric(10, 2) not null check (quantity > 0 and quantity <= 100000),
  unit text not null check (unit in ('pcs', 'kg', 'g', 'l', 'ml', 'pack')),
  weight_kg numeric(10, 3) check (weight_kg > 0 and weight_kg <= 100000),
  estimated_value numeric(10, 2) check (estimated_value >= 0 and estimated_value <= 1000000),
  logged_at timestamptz not null default now()
);

create unique index waste_log_entries_food_item_idx
  on public.waste_log_entries (food_item_id)
  where food_item_id is not null;
create index waste_log_entries_user_logged_idx on public.waste_log_entries (user_id, logged_at desc);

alter table public.waste_log_entries enable row level security;

create policy "Users can read their waste log"
  on public.waste_log_entries for select
  to authenticated
  using (user_id = auth.uid());

create policy "Users can add manual waste log entries"
  on public.waste_log_entries for insert
  to authenticated
  with check (user_id = auth.uid() and food_item_id is null);

create policy "Users can delete their manual waste log entries"
  on public.waste_log_entries for delete
  to authenticated
  using (user_id = auth.uid() and food_item_id is null);

-- Supabase grants new tables to anon and authenticated by default, so revoke first.
-- There is no update, and clients cannot set food_item_id or logged_at.
revoke all on public.waste_log_entries from anon, authenticated;
grant select, delete on public.waste_log_entries to authenticated;
grant insert (user_id, name, outcome, quantity, unit, weight_kg, estimated_value)
  on public.waste_log_entries to authenticated;

-- Same function as 0005 plus an optional weight and value, and the log entry. The old three-argument version is
-- dropped so the RPC name stays unambiguous.
drop function public.record_food_outcome(uuid, public.food_outcome, numeric);

create function public.record_food_outcome(
  p_item_id uuid,
  p_outcome public.food_outcome,
  p_quantity numeric,
  p_weight_kg numeric default null,
  p_estimated_value numeric default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  item public.food_items%rowtype;
  v_outcome_row uuid;
begin
  select * into item
  from public.food_items
  where id = p_item_id and owner_id = auth.uid() and outcome is null
  for update;
  if not found then
    raise exception 'food item not found';
  end if;

  if p_quantity is null or p_quantity <= 0 or p_quantity <> round(p_quantity, 2) or p_quantity > item.quantity then
    raise exception 'invalid quantity';
  end if;

  if p_weight_kg is not null
    and (p_weight_kg <= 0 or p_weight_kg > 100000 or p_weight_kg <> round(p_weight_kg, 3)) then
    raise exception 'invalid log values';
  end if;
  if p_estimated_value is not null
    and (p_estimated_value < 0 or p_estimated_value > 1000000 or p_estimated_value <> round(p_estimated_value, 2)) then
    raise exception 'invalid log values';
  end if;

  if p_quantity = item.quantity then
    update public.food_items
    set outcome = p_outcome, outcome_at = now()
    where id = item.id;
    v_outcome_row := item.id;
  else
    update public.food_items
    set quantity = quantity - p_quantity
    where id = item.id;

    insert into public.food_items
      (owner_id, name, kind, category, quantity, unit, purchased_at, expires_at, outcome, outcome_at)
    values
      (item.owner_id, item.name, item.kind, item.category, p_quantity, item.unit,
       item.purchased_at, item.expires_at, p_outcome, now())
    returning id into v_outcome_row;
  end if;

  insert into public.waste_log_entries
    (user_id, food_item_id, name, outcome, quantity, unit, weight_kg, estimated_value)
  values
    (item.owner_id, v_outcome_row, item.name, p_outcome, p_quantity, item.unit, p_weight_kg, p_estimated_value);
end;
$$;

-- Restoring an outcome also removes its log entry.
create or replace function public.restore_food_outcome(p_item_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.food_items
  set outcome = null, outcome_at = null
  where id = p_item_id and owner_id = auth.uid() and outcome is not null;
  if not found then
    raise exception 'food outcome not found';
  end if;

  delete from public.waste_log_entries
  where food_item_id = p_item_id and user_id = auth.uid();
end;
$$;

-- Supabase grants new functions to anon and authenticated by default, so revoke first (finding F-10).
revoke all on function public.record_food_outcome(uuid, public.food_outcome, numeric, numeric, numeric)
  from public, anon, authenticated;
grant execute on function public.record_food_outcome(uuid, public.food_outcome, numeric, numeric, numeric)
  to authenticated;
revoke all on function public.restore_food_outcome(uuid) from public, anon, authenticated;
grant execute on function public.restore_food_outcome(uuid) to authenticated;

-- Back-fill once for outcomes recorded before this table existed: no weight and no value. Safe to re-run.
insert into public.waste_log_entries (user_id, food_item_id, name, outcome, quantity, unit, logged_at)
select fi.owner_id, fi.id, fi.name, fi.outcome, fi.quantity, fi.unit, fi.outcome_at
from public.food_items fi
where fi.outcome is not null
  and not exists (select 1 from public.waste_log_entries w where w.food_item_id = fi.id);
