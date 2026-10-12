alter table public.profiles
  add column name text check (char_length(name) <= 80),
  add column location text check (char_length(location) <= 120),
  add column household_size smallint check (household_size between 1 and 20),
  add column food_preferences text[] not null default '{}'
    check (food_preferences <@ array['halal', 'vegetarian', 'vegan', 'gluten_free', 'nut_allergy', 'dairy_free']),
  add column notify_expiry boolean not null default true,
  add column notify_nearby boolean not null default true,
  add column notify_claims boolean not null default true;

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Clients may change only these columns; role and id stay immutable.
revoke update on public.profiles from authenticated;
grant update (name, location, household_size, food_preferences, notify_expiry, notify_nearby, notify_claims)
  on public.profiles to authenticated;
