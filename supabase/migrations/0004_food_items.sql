create type public.food_kind as enum ('grocery', 'leftover');

create table public.food_items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 100),
  kind public.food_kind not null,
  category text not null
    check (category in ('produce', 'dairy', 'meat_fish', 'bakery', 'dry_goods', 'cooked_meals', 'drinks', 'other')),
  quantity numeric(10, 2) not null check (quantity > 0 and quantity <= 100000),
  unit text not null check (unit in ('pcs', 'kg', 'g', 'l', 'ml', 'pack')),
  purchased_at date not null,
  expires_at date not null,
  created_at timestamptz not null default now(),
  check (expires_at >= purchased_at)
);

create index food_items_owner_expiry_idx on public.food_items (owner_id, expires_at);

alter table public.food_items enable row level security;

create policy "Owners can read their food items"
  on public.food_items for select
  using (owner_id = auth.uid());

create policy "Owners can add food items"
  on public.food_items for insert
  with check (owner_id = auth.uid());

create policy "Owners can update their food items"
  on public.food_items for update
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "Owners can delete their food items"
  on public.food_items for delete
  using (owner_id = auth.uid());

-- Clients may write only these columns; id, owner_id and created_at stay fixed.
revoke insert, update on public.food_items from authenticated;
grant insert (owner_id, name, kind, category, quantity, unit, purchased_at, expires_at)
  on public.food_items to authenticated;
grant update (name, kind, category, quantity, unit, purchased_at, expires_at)
  on public.food_items to authenticated;
