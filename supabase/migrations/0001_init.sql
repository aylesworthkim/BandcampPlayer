-- Project Sesh — cloud sessions schema
-- Run in the Supabase SQL editor (or via the Supabase CLI).

create extension if not exists "pgcrypto";

-- Sessions ---------------------------------------------------------------

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists sessions_user_id_idx on public.sessions (user_id);

-- Session items ----------------------------------------------------------

create table if not exists public.session_items (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions (id) on delete cascade,
  position integer not null,
  kind text not null,
  input text not null,
  label text,
  artist text,
  title text,
  album text,
  artwork_url text,
  source_url text,
  embed_src text,
  created_at timestamptz not null default now()
);

create index if not exists session_items_session_id_idx
  on public.session_items (session_id);

-- Row Level Security -----------------------------------------------------

alter table public.sessions enable row level security;
alter table public.session_items enable row level security;

-- Users may only touch their own sessions.
create policy "sessions_select_own" on public.sessions
  for select using (auth.uid() = user_id);
create policy "sessions_insert_own" on public.sessions
  for insert with check (auth.uid() = user_id);
create policy "sessions_update_own" on public.sessions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "sessions_delete_own" on public.sessions
  for delete using (auth.uid() = user_id);

-- Items inherit ownership from their parent session.
create policy "session_items_select_own" on public.session_items
  for select using (
    exists (
      select 1 from public.sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  );
create policy "session_items_insert_own" on public.session_items
  for insert with check (
    exists (
      select 1 from public.sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  );
create policy "session_items_update_own" on public.session_items
  for update using (
    exists (
      select 1 from public.sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  );
create policy "session_items_delete_own" on public.session_items
  for delete using (
    exists (
      select 1 from public.sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  );
