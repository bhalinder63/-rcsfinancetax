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
  uploaded_by uuid references public.profiles(id) on delete set null,
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

-- ═══ Phase 2b: timeline events + comments ═══

-- ── Timeline events (written only by triggers, never by the API) ──
create table if not exists public.request_events (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.requests(id) on delete cascade,
  actor uuid references public.profiles(id) on delete set null,
  type text not null check (type in ('created', 'status_changed', 'document_added')),
  detail text not null default '',
  created_at timestamptz not null default now()
);

alter table public.request_events enable row level security;

drop policy if exists "events: read via accessible request" on public.request_events;
create policy "events: read via accessible request"
  on public.request_events for select to authenticated
  using (
    exists (
      select 1 from public.requests r
      where r.id = request_id and (r.client_id = auth.uid() or public.is_admin())
    )
  );

grant select on public.request_events to authenticated;

-- Trigger writers (security definer bypasses RLS for inserts)
create or replace function public.log_request_event()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if tg_table_name = 'requests' then
    if tg_op = 'INSERT' then
      insert into request_events (request_id, actor, type, detail)
      values (new.id, new.client_id, 'created', new.service);
    elsif tg_op = 'UPDATE' and new.status is distinct from old.status then
      insert into request_events (request_id, actor, type, detail)
      values (new.id, auth.uid(), 'status_changed', new.status);
    end if;
  elsif tg_table_name = 'documents' then
    insert into request_events (request_id, actor, type, detail)
    values (new.request_id, new.uploaded_by, 'document_added', new.file_name);
  end if;
  return new;
end;
$$;

drop trigger if exists request_event_on_request on public.requests;
create trigger request_event_on_request
  after insert or update on public.requests
  for each row execute function public.log_request_event();

drop trigger if exists request_event_on_document on public.documents;
create trigger request_event_on_document
  after insert on public.documents
  for each row execute function public.log_request_event();

-- Backfill 'created' events for requests that existed before this table
insert into public.request_events (request_id, actor, type, detail, created_at)
select r.id, r.client_id, 'created', r.service, r.created_at
from public.requests r
where not exists (
  select 1 from public.request_events e where e.request_id = r.id and e.type = 'created'
);

-- ── Per-request comments ──
create table if not exists public.request_comments (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.requests(id) on delete cascade,
  author uuid references public.profiles(id) on delete set null,
  body text not null,
  created_at timestamptz not null default now()
);

alter table public.request_comments enable row level security;

drop policy if exists "comments: write on accessible request" on public.request_comments;
create policy "comments: write on accessible request"
  on public.request_comments for insert to authenticated
  with check (
    author = auth.uid()
    and exists (
      select 1 from public.requests r
      where r.id = request_id and (r.client_id = auth.uid() or public.is_admin())
    )
  );

drop policy if exists "comments: read via accessible request" on public.request_comments;
create policy "comments: read via accessible request"
  on public.request_comments for select to authenticated
  using (
    exists (
      select 1 from public.requests r
      where r.id = request_id and (r.client_id = auth.uid() or public.is_admin())
    )
  );

grant select, insert on public.request_comments to authenticated;

-- Live comments
do $$
begin
  alter publication supabase_realtime add table public.request_comments;
exception
  when duplicate_object then null;
end;
$$;

-- ═══ Website enquiries inbox ═══

create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text not null default '',
  service text not null default '',
  message text not null default '',
  status text not null default 'new' check (status in ('new', 'contacted', 'closed')),
  created_at timestamptz not null default now()
);

alter table public.enquiries enable row level security;

-- Anyone (including visitors who are not logged in) may submit an enquiry,
-- but only ever as status='new' and they can never read anything back.
drop policy if exists "enquiries: anyone can submit" on public.enquiries;
create policy "enquiries: anyone can submit"
  on public.enquiries for insert to anon, authenticated
  with check (status = 'new');

drop policy if exists "enquiries: only admin reads" on public.enquiries;
create policy "enquiries: only admin reads"
  on public.enquiries for select to authenticated
  using (public.is_admin());

drop policy if exists "enquiries: only admin updates" on public.enquiries;
create policy "enquiries: only admin updates"
  on public.enquiries for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant insert on public.enquiries to anon, authenticated;
grant select, update on public.enquiries to authenticated;

-- Live inbox for the admin panel
do $$
begin
  alter publication supabase_realtime add table public.enquiries;
exception
  when duplicate_object then null;
end;
$$;

-- ═══ Fix: deleting a user should never be blocked by their documents,
-- comments or timeline entries — those records stay, just with the
-- reference cleared, instead of a NO ACTION FK blocking the delete.
-- (No-op on a fresh install where the tables above already have this.)

alter table public.documents alter column uploaded_by drop not null;
alter table public.documents drop constraint if exists documents_uploaded_by_fkey;
alter table public.documents add constraint documents_uploaded_by_fkey
  foreign key (uploaded_by) references public.profiles(id) on delete set null;

alter table public.request_comments alter column author drop not null;
alter table public.request_comments drop constraint if exists request_comments_author_fkey;
alter table public.request_comments add constraint request_comments_author_fkey
  foreign key (author) references public.profiles(id) on delete set null;

alter table public.request_events drop constraint if exists request_events_actor_fkey;
alter table public.request_events add constraint request_events_actor_fkey
  foreign key (actor) references public.profiles(id) on delete set null;

