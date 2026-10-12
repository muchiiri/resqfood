create type public.food_outcome as enum ('eaten', 'shared', 'thrown_away');

alter table public.food_items
  add column outcome public.food_outcome,
  add column outcome_at timestamptz,
  add constraint food_items_outcome_pair check ((outcome is null) = (outcome_at is null));

create index food_items_owner_outcome_idx on public.food_items (owner_id, outcome_at);

-- History rows (with an outcome) can no longer be edited by clients.
drop policy "Owners can update their food items" on public.food_items;
create policy "Owners can update their active food items"
  on public.food_items for update
  using (owner_id = auth.uid() and outcome is null)
  with check (owner_id = auth.uid() and outcome is null);

-- Clients cannot write outcome or outcome_at: the grants on food_items do not include them.
-- These functions run as the table owner but always filter by auth.uid().
create function public.record_food_outcome(p_item_id uuid, p_outcome public.food_outcome, p_quantity numeric)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  item public.food_items%rowtype;
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

  if p_quantity = item.quantity then
    update public.food_items
    set outcome = p_outcome, outcome_at = now()
    where id = item.id;
  else
    update public.food_items
    set quantity = quantity - p_quantity
    where id = item.id;

    insert into public.food_items
      (owner_id, name, kind, category, quantity, unit, purchased_at, expires_at, outcome, outcome_at)
    values
      (item.owner_id, item.name, item.kind, item.category, p_quantity, item.unit,
       item.purchased_at, item.expires_at, p_outcome, now());
  end if;
end;
$$;

create function public.restore_food_outcome(p_item_id uuid)
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
end;
$$;

revoke all on function public.record_food_outcome(uuid, public.food_outcome, numeric) from public;
revoke all on function public.restore_food_outcome(uuid) from public;
grant execute on function public.record_food_outcome(uuid, public.food_outcome, numeric) to authenticated;
grant execute on function public.restore_food_outcome(uuid) to authenticated;
