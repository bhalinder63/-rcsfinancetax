-- ═══════════════════════════════════════════════════════════════
-- Public website enquiries -> admin panel inbox
-- Run once in Supabase SQL Editor. Idempotent.
-- ═══════════════════════════════════════════════════════════════

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

select 'enquiries table ready' as status;
