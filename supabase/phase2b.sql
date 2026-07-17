-- ═══════════════════════════════════════════════════════════════
-- Phase 2b: request timeline events + per-request comments
-- Run once in Supabase SQL Editor. Idempotent.
-- ═══════════════════════════════════════════════════════════════

-- ── Timeline events (written only by triggers, never by the API) ──
create table if not exists public.request_events (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.requests(id) on delete cascade,
  actor uuid references public.profiles(id),
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
  author uuid not null references public.profiles(id),
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

select 'phase 2b schema applied' as status;
