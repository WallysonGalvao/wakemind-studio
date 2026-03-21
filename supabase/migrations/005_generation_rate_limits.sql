-- ─────────────────────────────────────────────────────────────
-- Rate Limiting for Generation Edge Functions
-- Limits: 10 requests/minute + 100 requests/day per user
-- ─────────────────────────────────────────────────────────────

create table if not exists public.generation_requests (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users on delete cascade,
  function_name text not null check (function_name in ('generate-image', 'generate-sound')),
  created_at    timestamptz not null default now()
);

-- Index for fast per-user lookups within time windows
create index generation_requests_user_created_idx
  on public.generation_requests (user_id, created_at desc);

-- RLS: users can only see their own requests (read-only from client)
alter table public.generation_requests enable row level security;

create policy "Users can view their own generation requests"
  on public.generation_requests for select
  using (auth.uid() = user_id);

-- Auto-cleanup: remove requests older than 48h (keeps table slim)
create or replace function public.cleanup_old_generation_requests()
returns void as $$
begin
  delete from public.generation_requests
  where created_at < now() - interval '48 hours';
end;
$$ language plpgsql security definer;

-- ── Rate limit check function ────────────────────────────────
-- Called from Edge Functions via RPC with service role client.
-- Atomically checks limits and records the request if allowed.

create or replace function public.check_generation_rate_limit(
  p_user_id       uuid,
  p_function_name text,
  p_per_minute    int default 10,
  p_per_day       int default 100
)
returns jsonb as $$
declare
  v_minute_count int;
  v_day_count    int;
begin
  -- Count requests in the last minute
  select count(*) into v_minute_count
  from public.generation_requests
  where user_id = p_user_id
    and created_at > now() - interval '1 minute';

  if v_minute_count >= p_per_minute then
    return jsonb_build_object(
      'allowed',     false,
      'reason',      'minute_limit',
      'retry_after', 60
    );
  end if;

  -- Count requests in the last 24 hours
  select count(*) into v_day_count
  from public.generation_requests
  where user_id = p_user_id
    and created_at > now() - interval '1 day';

  if v_day_count >= p_per_day then
    return jsonb_build_object(
      'allowed',     false,
      'reason',      'day_limit',
      'retry_after', 3600
    );
  end if;

  -- Under limits → record this request
  insert into public.generation_requests (user_id, function_name)
  values (p_user_id, p_function_name);

  return jsonb_build_object(
    'allowed',          true,
    'minute_remaining', p_per_minute - v_minute_count - 1,
    'day_remaining',    p_per_day - v_day_count - 1
  );
end;
$$ language plpgsql security definer;
