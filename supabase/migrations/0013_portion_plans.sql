create type public.hunger_level as enum ('light', 'normal', 'very_hungry');

-- A saved portion plan. The suggestion is computed by the server action and kept for history only.
create table public.portion_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  people integer not null check (people between 1 and 50),
  hunger_level public.hunger_level not null,
  preferences text[] not null default '{}'
    check (preferences <@ array['halal', 'vegetarian', 'vegan', 'gluten_free', 'nut_allergy', 'dairy_free']),
  suggestion jsonb not null check (jsonb_typeof(suggestion) = 'object'),
  created_at timestamptz not null default now()
);

create index portion_plans_user_created_idx on public.portion_plans (user_id, created_at desc);

alter table public.portion_plans enable row level security;

create policy "Users can read their portion plans"
  on public.portion_plans for select
  to authenticated
  using (user_id = auth.uid());

create policy "Users can save their own portion plans"
  on public.portion_plans for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "Users can delete their portion plans"
  on public.portion_plans for delete
  to authenticated
  using (user_id = auth.uid());

-- Supabase grants new tables to anon and authenticated by default, so revoke first.
-- There is no update: a plan is saved once and deleted, not edited.
revoke all on public.portion_plans from anon, authenticated;
grant select, delete on public.portion_plans to authenticated;
grant insert (user_id, people, hunger_level, preferences, suggestion) on public.portion_plans to authenticated;
