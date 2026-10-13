create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null check (type in ('expiry', 'nearby', 'claims')),
  message text not null check (char_length(message) between 1 and 280),
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index notifications_user_read_created_idx on public.notifications (user_id, read, created_at desc);

alter table public.notifications enable row level security;

create policy "Users can read their notifications"
  on public.notifications for select
  using (user_id = auth.uid());

create policy "Users can mark their notifications read"
  on public.notifications for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Clients may change only the read flag. Rows are created by server-side or SQL-editor inserts,
-- which bypass these rules; there is no insert or delete policy for clients.
revoke insert, update, delete on public.notifications from authenticated;
grant update (read) on public.notifications to authenticated;
