create table public.restaurants (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references public.profiles (id) on delete cascade,
  business_name text not null check (char_length(business_name) between 1 and 100),
  address text not null check (char_length(address) between 1 and 200),
  opening_hours jsonb not null check (jsonb_typeof(opening_hours) = 'object'),
  created_at timestamptz not null default now()
);

alter table public.restaurants enable row level security;

create policy "Owners can read their restaurant"
  on public.restaurants for select
  using (owner_id = auth.uid());

create policy "Restaurant accounts can add their restaurant"
  on public.restaurants for insert
  with check (
    owner_id = auth.uid()
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'restaurant')
  );

create policy "Owners can update their restaurant"
  on public.restaurants for update
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- Clients may write only these columns; id, owner_id and created_at stay fixed.
revoke insert, update on public.restaurants from authenticated;
grant insert (owner_id, business_name, address, opening_hours) on public.restaurants to authenticated;
grant update (business_name, address, opening_hours) on public.restaurants to authenticated;
