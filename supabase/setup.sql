-- ═══════════════════════════════════════════════════════════════
-- RCS Finance & Tax Experts — client portal schema (Phase 1)
-- Run this once in Supabase Dashboard → SQL Editor → New query → Run
-- ═══════════════════════════════════════════════════════════════

-- ── Profiles: one row per auth user; role is NEVER set by the website ──
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text not null default '',
  role text not null default 'client' check (role in ('client', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Every new auth user automatically gets a profile with role='client'.
-- Runs inside Postgres; the browser cannot influence the role.
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'phone', '')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helper used by policies. SECURITY DEFINER so it can read profiles
-- without tripping profiles' own RLS (avoids recursion).
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

-- Block role changes from the API entirely (only service_role/dashboard can).
create or replace function public.protect_role()
returns trigger
language plpgsql
as $$
begin
  if new.role is distinct from old.role then
    raise exception 'role cannot be changed through the API';
  end if;
  return new;
end;
$$;

drop trigger if exists protect_role_change on public.profiles;
create trigger protect_role_change
  before update on public.profiles
  for each row
  when (current_setting('request.jwt.claims', true) is not null)
  execute function public.protect_role();

drop policy if exists "profiles: read own or admin reads all" on public.profiles;
create policy "profiles: read own or admin reads all"
  on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles: update own" on public.profiles;
create policy "profiles: update own"
  on public.profiles for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- ── Requests: a client's service request ──
create table if not exists public.requests (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  service text not null,
  note text not null default '',
  status text not null default 'submitted' check (status in ('submitted', 'in_process', 'completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.requests enable row level security;

create or replace function public.set_updated_at()
returns trigger language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists requests_updated_at on public.requests;
create trigger requests_updated_at
  before update on public.requests
  for each row execute function public.set_updated_at();

drop policy if exists "requests: client creates own as submitted" on public.requests;
create policy "requests: client creates own as submitted"
  on public.requests for insert to authenticated
  with check (client_id = auth.uid() and status = 'submitted');

drop policy if exists "requests: read own or admin reads all" on public.requests;
create policy "requests: read own or admin reads all"
  on public.requests for select to authenticated
  using (client_id = auth.uid() or public.is_admin());

drop policy if exists "requests: only admin updates" on public.requests;
create policy "requests: only admin updates"
  on public.requests for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ── Documents: files attached to a request ──
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.requests(id) on delete cascade,
  uploaded_by uuid not null references public.profiles(id),
  file_path text not null,
  file_name text not null,
  created_at timestamptz not null default now()
);

alter table public.documents enable row level security;

drop policy if exists "documents: attach to accessible request" on public.documents;
create policy "documents: attach to accessible request"
  on public.documents for insert to authenticated
  with check (
    uploaded_by = auth.uid()
    and exists (
      select 1 from public.requests r
      where r.id = request_id and (r.client_id = auth.uid() or public.is_admin())
    )
  );

drop policy if exists "documents: read via accessible request" on public.documents;
create policy "documents: read via accessible request"
  on public.documents for select to authenticated
  using (
    exists (
      select 1 from public.requests r
      where r.id = request_id and (r.client_id = auth.uid() or public.is_admin())
    )
  );

-- ── Private storage bucket for uploads ──
-- Files are stored under {user_id}/{request_id}/{filename}, so the first
-- folder of the path identifies the owner.
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

drop policy if exists "storage: upload to own folder or admin" on storage.objects;
create policy "storage: upload to own folder or admin"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'documents'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );

drop policy if exists "storage: read own folder or admin" on storage.objects;
create policy "storage: read own folder or admin"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'documents'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );

-- ── API access grants ──
-- The project was created with "Automatically expose new tables" disabled,
-- so table privileges must be granted explicitly. RLS still controls rows.
grant usage on schema public to anon, authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update on public.requests to authenticated;
grant select, insert on public.documents to authenticated;

-- ── Live status updates on the client portal ──
do $$
begin
  alter publication supabase_realtime add table public.requests;
exception
  when duplicate_object then null;
end;
$$;

do $$
begin
  alter publication supabase_realtime add table public.documents;
exception
  when duplicate_object then null;
end;
$$;
