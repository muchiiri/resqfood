-- A listing posted by a restaurant account points at that account's restaurant profile. The database
-- fills it in (see create_listing below); the policies keep anyone from pointing at someone else's.
alter table public.listings
  add column restaurant_id uuid references public.restaurants (id) on delete set null;

grant insert (restaurant_id) on public.listings to authenticated;

drop policy "Users can post their own listings" on public.listings;
create policy "Users can post their own listings"
  on public.listings for insert
  to authenticated
  with check (
    poster_id = auth.uid()
    and status = 'available'
    and (
      restaurant_id is null
      or exists (select 1 from public.restaurants r where r.id = restaurant_id and r.owner_id = auth.uid())
    )
  );

-- Anyone who can see a listing can read the restaurant behind it. The subquery runs under the viewer's
-- own listings policy, so only restaurants behind visible listings show up. The listings select policy
-- must never read restaurants, or the two policies would recurse into each other.
drop policy "Owners can read their restaurant" on public.restaurants;
create policy "Owners and viewers of its listings can read a restaurant"
  on public.restaurants for select
  to authenticated
  using (
    owner_id = auth.uid()
    or exists (select 1 from public.listings l where l.restaurant_id = restaurants.id)
  );

-- Same function as 0009, plus the restaurant link. Still runs as the caller, so row level security applies.
-- A restaurant account must have saved its business profile before it can post.
create or replace function public.create_listing(
  p_title text,
  p_description text,
  p_category text,
  p_quantity numeric,
  p_unit text,
  p_photo_path text,
  p_pickup_area text,
  p_pickup_details text,
  p_available_until timestamptz
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_id uuid;
  v_details text := nullif(btrim(p_pickup_details), '');
  v_restaurant uuid;
begin
  if p_available_until is null or p_available_until <= now() or p_available_until > now() + interval '7 days' then
    raise exception 'invalid availability';
  end if;

  select id into v_restaurant from public.restaurants where owner_id = auth.uid();
  if v_restaurant is null
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'restaurant') then
    raise exception 'restaurant_profile_required';
  end if;

  insert into public.listings
    (poster_id, restaurant_id, title, description, category, quantity, unit, photo_path, pickup_area, available_until)
  values
    (auth.uid(), v_restaurant, p_title, nullif(btrim(p_description), ''), p_category, p_quantity, p_unit,
     p_photo_path, p_pickup_area, p_available_until)
  returning id into v_id;

  if v_details is not null then
    insert into public.listing_pickup_details (listing_id, details) values (v_id, v_details);
  end if;

  return v_id;
end;
$$;
