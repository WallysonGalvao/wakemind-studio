-- ─────────────────────────────────────────────────────────────
-- Fenrir — Initial Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ─────────────────────────────────────────────────────────────

-- ── Profiles ──────────────────────────────────────────────────
create table if not exists public.profiles (
  id         uuid primary key references auth.users on delete cascade,
  name       text not null default '',
  avatar_url text,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Packages ──────────────────────────────────────────────────
create table if not exists public.packages (
  id           text primary key,
  user_id      uuid not null references auth.users on delete cascade,
  name         text not null,
  description  text not null default '',
  color        text not null default '#6366f1',
  achievements jsonb not null default '[]',
  style_config jsonb not null default '{}',
  created_at   bigint not null default extract(epoch from now()) * 1000
);

alter table public.packages enable row level security;

create policy "Users can view their own packages"
  on public.packages for select
  using (auth.uid() = user_id);

create policy "Users can insert their own packages"
  on public.packages for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own packages"
  on public.packages for update
  using (auth.uid() = user_id);

create policy "Users can delete their own packages"
  on public.packages for delete
  using (auth.uid() = user_id);

-- ── Assets ────────────────────────────────────────────────────
create table if not exists public.assets (
  id           text primary key,
  user_id      uuid not null references auth.users on delete cascade,
  package_id   text references public.packages(id) on delete set null,
  name         text not null,
  type         text not null check (type in ('image', 'sound')),
  format       text not null,
  mime_type    text not null,
  prompt       text not null default '',
  model        text not null default '',
  settings     jsonb not null default '{}',
  storage_path text not null,
  created_at   bigint not null default extract(epoch from now()) * 1000
);

alter table public.assets enable row level security;

create policy "Users can view their own assets"
  on public.assets for select
  using (auth.uid() = user_id);

create policy "Users can insert their own assets"
  on public.assets for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own assets"
  on public.assets for delete
  using (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────
-- Storage: run these in Dashboard → Storage → New bucket
--   Bucket name: assets
--   Public: NO (private)
--
-- Then add this policy via Dashboard → Storage → assets → Policies:
--   Policy name: Users can manage their own assets
--   Allowed operations: SELECT, INSERT, DELETE
--   Policy definition:
--     (auth.uid())::text = (storage.foldername(name))[1]
-- ─────────────────────────────────────────────────────────────
