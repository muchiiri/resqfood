create type public.claim_status as enum ('pending', 'collected', 'cancelled');

create table public.claims (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  claimer_id uuid not null references public.profiles (id) on delete cascade,
  status public.claim_status not null default 'pending',
  claimed_at timestamptz not null default now(),
  resolved_at timestamptz
);

-- At most one active claim per listing, even if two requests slip past the row lock.
create unique index claims_one_pending_per_listing_idx on public.claims (listing_id) where status = 'pending';
create index claims_claimer_status_idx on public.claims (claimer_id, status);

alter table public.claims enable row level security;

-- Policies on listings and claims need to look at each other. Plain subqueries would make them
-- recurse forever, so they call these definer helpers, which read the tables without row level security.
create function public.is_poster(p_listing uuid)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (select 1 from public.listings where id = p_listing and poster_id = auth.uid());
$$;

create function public.is_claimer(p_listing uuid)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1 from public.claims
    where listing_id = p_listing and claimer_id = auth.uid() and status in ('pending', 'collected')
  );
$$;

create function public.is_active_claimer(p_listing uuid)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1 from public.claims
    where listing_id = p_listing and claimer_id = auth.uid() and status = 'pending'
  );
$$;

revoke all on function public.is_poster(uuid), public.is_claimer(uuid), public.is_active_claimer(uuid)
  from public, anon, authenticated;
grant execute on function public.is_poster(uuid), public.is_claimer(uuid), public.is_active_claimer(uuid)
  to authenticated;

create policy "Claimers and posters can read claims"
  on public.claims for select
  to authenticated
  using (claimer_id = auth.uid() or public.is_poster(listing_id));

revoke all on public.claims from anon, authenticated;
grant select on public.claims to authenticated;

-- Claimers can see the listing they claimed, and read its private pickup details while the claim is active.
drop policy "Posters and signed-in users can read available listings" on public.listings;
create policy "Posters, claimers and signed-in users can read listings"
  on public.listings for select
  to authenticated
  using (
    poster_id = auth.uid()
    or (status = 'available' and available_until > now())
    or public.is_claimer(id)
  );

drop policy "Posters can read their pickup details" on public.listing_pickup_details;
create policy "Posters and active claimers can read pickup details"
  on public.listing_pickup_details for select
  to authenticated
  using (public.is_poster(listing_id) or public.is_active_claimer(listing_id));

-- Claim a listing. Locks the listing row so only one of two simultaneous claimers wins.
create function public.claim_listing(p_listing_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_listing public.listings%rowtype;
  v_claim uuid;
  v_notify boolean;
begin
  if auth.uid() is null then
    raise exception 'not_signed_in';
  end if;

  -- Serialises one user's claims so the limit below cannot be raced across different listings.
  perform pg_advisory_xact_lock(hashtext(auth.uid()::text));

  select * into v_listing
  from public.listings
  where id = p_listing_id
    and status = 'available'
    and available_until > now()
    and poster_id <> auth.uid()
  for update;
  if not found then
    raise exception 'listing_unavailable';
  end if;

  if (select count(*) from public.claims where claimer_id = auth.uid() and status = 'pending') >= 2 then
    raise exception 'claim_limit';
  end if;

  insert into public.claims (listing_id, claimer_id) values (v_listing.id, auth.uid())
  returning id into v_claim;

  update public.listings set status = 'claimed' where id = v_listing.id;

  select notify_claims into v_notify from public.profiles where id = v_listing.poster_id;
  if coalesce(v_notify, false) then
    insert into public.notifications (user_id, type, message, dedupe_key)
    values (
      v_listing.poster_id,
      'claims',
      'Your listing "' || left(v_listing.title, 100) || '" was claimed.',
      'claim:' || v_claim
    )
    on conflict (user_id, dedupe_key) where dedupe_key is not null do nothing;
  end if;

  return v_claim;
end;
$$;

-- Cancel a pending claim. Either the claimer or the poster can do it; the listing goes back on the
-- feed while its time has not passed.
create function public.cancel_claim(p_claim_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_listing_id uuid;
  v_listing public.listings%rowtype;
  v_claim public.claims%rowtype;
  v_still_open boolean;
  v_notify boolean;
begin
  if auth.uid() is null then
    raise exception 'not_signed_in';
  end if;

  select listing_id into v_listing_id from public.claims where id = p_claim_id;
  if not found then
    raise exception 'claim_unavailable';
  end if;

  -- Lock the listing first, then the claim, in the same order as claim_listing.
  select * into v_listing from public.listings where id = v_listing_id for update;
  select * into v_claim from public.claims where id = p_claim_id and status = 'pending' for update;
  if not found or (v_claim.claimer_id <> auth.uid() and v_listing.poster_id <> auth.uid()) then
    raise exception 'claim_unavailable';
  end if;

  v_still_open := v_listing.available_until > now();

  update public.claims set status = 'cancelled', resolved_at = now() where id = v_claim.id;
  update public.listings
  set status = case when v_still_open then 'available'::public.listing_status else 'expired'::public.listing_status end
  where id = v_listing.id;

  if v_claim.claimer_id = auth.uid() then
    select notify_claims into v_notify from public.profiles where id = v_listing.poster_id;
    if coalesce(v_notify, false) then
      insert into public.notifications (user_id, type, message, dedupe_key)
      values (
        v_listing.poster_id,
        'claims',
        'A claim on "' || left(v_listing.title, 100) || '" was cancelled.'
          || case when v_still_open then ' It is available again.' else '' end,
        'claim-cancelled:' || v_claim.id
      )
      on conflict (user_id, dedupe_key) where dedupe_key is not null do nothing;
    end if;
  else
    insert into public.notifications (user_id, type, message, dedupe_key)
    values (
      v_claim.claimer_id,
      'claims',
      'The poster released your claim on "' || left(v_listing.title, 100) || '".',
      'claim-cancelled:' || v_claim.id
    )
    on conflict (user_id, dedupe_key) where dedupe_key is not null do nothing;
  end if;
end;
$$;

-- The poster confirms the handover.
create function public.confirm_collected(p_claim_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_listing_id uuid;
  v_listing public.listings%rowtype;
  v_claim public.claims%rowtype;
begin
  if auth.uid() is null then
    raise exception 'not_signed_in';
  end if;

  select listing_id into v_listing_id from public.claims where id = p_claim_id;
  if not found then
    raise exception 'claim_unavailable';
  end if;

  select * into v_listing from public.listings where id = v_listing_id for update;
  select * into v_claim from public.claims where id = p_claim_id and status = 'pending' for update;
  if not found or v_listing.poster_id <> auth.uid() then
    raise exception 'claim_unavailable';
  end if;

  update public.claims set status = 'collected', resolved_at = now() where id = v_claim.id;
  update public.listings set status = 'collected' where id = v_listing.id;

  insert into public.notifications (user_id, type, message, dedupe_key)
  values (
    v_claim.claimer_id,
    'claims',
    '"' || left(v_listing.title, 100) || '" was marked as collected.',
    'collected:' || v_claim.id
  )
  on conflict (user_id, dedupe_key) where dedupe_key is not null do nothing;
end;
$$;

-- Supabase grants new functions to anon and authenticated by default, so revoke first.
revoke all on function public.claim_listing(uuid), public.cancel_claim(uuid), public.confirm_collected(uuid)
  from public, anon, authenticated;
grant execute on function public.claim_listing(uuid), public.cancel_claim(uuid), public.confirm_collected(uuid)
  to authenticated;
