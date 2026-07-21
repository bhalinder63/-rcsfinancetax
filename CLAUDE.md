# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A single-page marketing site for RCS Finance & Tax Experts (a unit of Rao Consultancy Services, Ghaziabad), plus a client portal and admin panel backed by Supabase. React 19 + Vite 7 + Tailwind CSS v4, no TypeScript, deployed on Vercel.

## Commands

```
npm run dev       # start Vite dev server
npm run build     # production build to dist/
npm run preview   # preview the production build locally
```

There is no lint, format, or test setup — none of `eslint`, `prettier`, `vitest`, or `jest` are configured. Don't invent commands for these.

## Branching / deploy model

- `main` — marketing site only.
- `development` — active branch, includes the client portal; deployed to Vercel from here. Work generally happens on `development`.
- `vercel.json` does a full SPA rewrite (`/(.*) → /index.html`) since this is a client-side-routed React app.

## Architecture

### Two halves of the app

1. **Public marketing page** (`src/App.jsx`) — a single scrolling page assembled from section components (`Hero`, `TrustedBy`, `Stats`, `Services`, `WhyRcs`, plus `Topbar`/`Navbar`/`Footer`/`WhatsAppFloat`). All copy and structured content (contact info, nav links, service list, stats, reasons, client names) lives in one place: `src/data.js`. There is no CMS — editing site copy means editing that file.
2. **Client portal + admin panel**, routed in `src/main.jsx` via `react-router-dom`: `/login`, `/reset-password`, `/portal` (client), `/admin`, `/admin/enquiries`, `/admin/clients`, `/admin/clients/:id`, `/request/:id`. Every portal/admin route except `/login` and `/reset-password` is wrapped in `ProtectedRoute`, which reads `session`/`profile` from `AuthContext` and redirects based on `profile.role` (`client` vs `admin`).

The enquiry form (`EnquiryModal`) is available from the public page and writes to the `enquiries` table for the admin inbox — it is intentionally separate from the WhatsApp floating button, which just opens a `wa.me` link.

### Auth & data (Supabase)

- `src/lib/supabase.js` creates the client from `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` (with hardcoded fallbacks to the live project — the anon/publishable key is safe to ship, access is governed by RLS). It also holds shared helpers: `openDocument` (signed URL for private storage) and `uploadRequestDocuments` (uploads into `{client_id}/{request_id}/...` and inserts a `documents` row).
- `AuthContext` (`src/context/AuthContext.jsx`) tracks the Supabase session and loads the matching `profiles` row. `profile.role` (`'client'` or `'admin'`) drives all routing/authorization in the UI — **role is never settable from the client**, only via SQL (see below).
- **Schema of record: `supabase/setup.sql`** — idempotent (uses `create table if not exists`, `drop policy if exists`, etc.), safe to re-run wholesale in the Supabase SQL Editor. It's the union of every phase to date (profiles/requests/documents, timeline events + comments, enquiries inbox). `supabase/enquiries.sql` and `supabase/phase2b.sql` are the original incremental migration files for two of those phases, kept for history — don't treat them as separate things to apply; `setup.sql` already includes their content.
- The Supabase project was created with "Automatically expose new tables" **disabled**. Every new table needs an explicit `grant ... to authenticated` in addition to RLS policies, or PostgREST returns `42501 permission denied`.
- `role` changes are blocked at the database level (`protect_role` trigger) and a new signup always gets `role = 'client'` via the `handle_new_user` trigger — admin promotion is a manual SQL update.
- Realtime is enabled (`supabase_realtime` publication) on `requests`, `documents`, `request_comments`, and `enquiries` — portal/admin pages subscribe via `supabase.channel(...).on('postgres_changes', ...)` to stay live without polling (see `Admin.jsx`'s `loadRequests` + channel subscription for the pattern).
- Private file storage: bucket `documents`, non-public, path convention `{client_id}/{request_id}/{timestamp}_{sanitized filename}` — the first path segment is what RLS storage policies check against `auth.uid()`.

### Styling

Tailwind CSS v4 via `@tailwindcss/vite` — there is no `tailwind.config.js`; theme tokens (the dark-luxury gold-on-black palette, `Cinzel`/`Jost` fonts) are declared with `@theme` directly in `src/index.css`. Use the existing color tokens (`night`, `panel`, `card`, `gold`/`gold-bright`/`gold-light`/`gold-deep`, `ivory`, `cream`, `mist`, `sand`, `muted`/`muted-2`/`muted-3`) rather than introducing new ad-hoc colors.

## Known placeholders

Contact details in `src/data.js` (`CONTACT`: phone, email, WhatsApp number) are placeholders from the original design and need to be confirmed with the client before launch — don't treat them as real production values.
