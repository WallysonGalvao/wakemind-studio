-- ─────────────────────────────────────────────────────────────
-- Fenrir — Initial Schema
-- Projeto Supabase: fenrir
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

-- ── Projects ──────────────────────────────────────────────────
create table if not exists public.projects (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users on delete cascade,
  name         text not null,
  slug         text not null,

  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.projects enable row level security;

create policy "Users can view their own projects"
  on public.projects for select
  using (auth.uid() = user_id);

create policy "Users can insert their own projects"
  on public.projects for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own projects"
  on public.projects for update
  using (auth.uid() = user_id);

create policy "Users can delete their own projects"
  on public.projects for delete
  using (auth.uid() = user_id);

create unique index projects_slug_user_id_idx
  on public.projects (slug, user_id);

-- ── Project Integrations (Analytics credentials via Vault) ────
create table if not exists public.project_integrations (
  id              uuid primary key default gen_random_uuid(),
  project_id      uuid not null references public.projects(id) on delete cascade,
  provider        text not null check (provider in ('mixpanel', 'revenuecat')),
  vault_secret_id uuid not null,

  created_at      timestamptz not null default now(),

  unique (project_id, provider)
);

alter table public.project_integrations enable row level security;

create policy "Users can manage integrations of their projects"
  on public.project_integrations for all
  using (
    project_id in (
      select id from public.projects where user_id = auth.uid()
    )
  );

-- ── Packages ──────────────────────────────────────────────────
create table if not exists public.packages (
  id           text primary key,
  user_id      uuid not null references auth.users on delete cascade,
  project_id   uuid not null references public.projects(id) on delete cascade,
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
  with check (
    auth.uid() = user_id
    and project_id in (select id from public.projects where user_id = auth.uid())
  );

create policy "Users can update their own packages"
  on public.packages for update
  using (auth.uid() = user_id)
  with check (
    project_id in (select id from public.projects where user_id = auth.uid())
  );

create policy "Users can delete their own packages"
  on public.packages for delete
  using (auth.uid() = user_id);

-- ── Assets ────────────────────────────────────────────────────
create table if not exists public.assets (
  id           text primary key,
  user_id      uuid not null references auth.users on delete cascade,
  project_id   uuid not null references public.projects(id) on delete cascade,
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
  with check (
    auth.uid() = user_id
    and project_id in (select id from public.projects where user_id = auth.uid())
  );

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
