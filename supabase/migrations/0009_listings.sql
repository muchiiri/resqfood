create type public.listing_status as enum ('available', 'claimed', 'collected', 'expired');

create table public.listings (
  id uuid primary key default gen_random_uuid(),
  poster_id uuid not null references public.profiles (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 100),
  description text check (char_length(description) <= 500),
  category text not null
    check (category in ('produce', 'dairy', 'meat_fish', 'bakery', 'dry_goods', 'cooked_meals', 'drinks', 'other')),
  quantity numeric(10, 2) not null check (quantity > 0 and quantity <= 100000),
  unit text not null check (unit in ('pcs', 'kg', 'g', 'l', 'ml', 'pack')),
  photo_path text,
  pickup_area text not null check (char_length(pickup_area) between 1 and 80),
  available_until timestamptz not null,
  status public.listing_status not null default 'available',
  created_at timestamptz not null default now(),
  check (available_until > created_at)
);

create index listings_poster_created_idx on public.listings (poster_id, created_at desc);
create index listings_status_until_idx on public.listings (status, available_until);

-- Private pickup details. Only the poster can read or write them for now; claiming (feature 14)
-- will add access for the person who claims the listing.
create table public.listing_pickup_details (
  listing_id uuid primary key references public.listings (id) on delete cascade,
  details text not null check (char_length(details) between 1 and 300)
);

alter table public.listings enable row level security;
alter table public.listing_pickup_details enable row level security;

create policy "Posters and signed-in users can read available listings"
  on public.listings for select
  to authenticated
  using (poster_id = auth.uid() or (status = 'available' and available_until > now()));

create policy "Users can post their own listings"
  on public.listings for insert
  to authenticated
  with check (poster_id = auth.uid() and status = 'available');

create policy "Posters can withdraw their available listings"
  on public.listings for delete
  to authenticated
  using (poster_id = auth.uid() and status = 'available');

create policy "Posters can read their pickup details"
  on public.listing_pickup_details for select
  to authenticated
  using (exists (select 1 from public.listings l where l.id = listing_id and l.poster_id = auth.uid()));

create policy "Posters can add pickup details to their listings"
  on public.listing_pickup_details for insert
  to authenticated
  with check (exists (select 1 from public.listings l where l.id = listing_id and l.poster_id = auth.uid()));

-- Supabase grants new tables to anon and authenticated by default, so revoke first.
revoke all on public.listings from anon, authenticated;
revoke all on public.listing_pickup_details from anon, authenticated;
grant select, delete on public.listings to authenticated;
grant insert (poster_id, title, description, category, quantity, unit, photo_path, pickup_area, available_until)
  on public.listings to authenticated;
grant select on public.listing_pickup_details to authenticated;
grant insert (listing_id, details) on public.listing_pickup_details to authenticated;

-- Posts a listing and its optional pickup details in one transaction. Runs as the caller,
-- so the row level security above applies.
create function public.create_listing(
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
begin
  if p_available_until is null or p_available_until <= now() or p_available_until > now() + interval '7 days' then
    raise exception 'invalid availability';
  end if;

  insert into public.listings
    (poster_id, title, description, category, quantity, unit, photo_path, pickup_area, available_until)
  values
    (auth.uid(), p_title, nullif(btrim(p_description), ''), p_category, p_quantity, p_unit,
     p_photo_path, p_pickup_area, p_available_until)
  returning id into v_id;

  if v_details is not null then
    insert into public.listing_pickup_details (listing_id, details) values (v_id, v_details);
  end if;

  return v_id;
end;
$$;

revoke all on function public.create_listing(text, text, text, numeric, text, text, text, text, timestamptz)
  from public, anon, authenticated;
grant execute on function public.create_listing(text, text, text, numeric, text, text, text, text, timestamptz)
  to authenticated;

-- Photos: one public-read bucket. The public URL works without a select policy; the
-- authenticated select policy below is needed so owners can delete their own objects.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('listing-photos', 'listing-photos', true, 2097152, array['image/jpeg'])
on conflict (id) do nothing;

create policy "Users upload listing photos to their own folder"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'listing-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users delete their own listing photos"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'listing-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Signed-in users can read listing photo objects"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'listing-photos');
