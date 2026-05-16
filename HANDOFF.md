# TableTalk — ChatGPT Handoff Document
**Last updated:** May 2026

---

## What This Is

TableTalk is a restaurant guest issue ticketing system — like an IT helpdesk, but for restaurants. Guests scan a QR code at their table, submit issues privately, and the restaurant team tracks and resolves them before the guest leaves.

**Core positioning:** "Catch guest issues before they become bad reviews."

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router), TypeScript |
| Styling | Tailwind CSS v4, shadcn/ui, Lucide icons |
| Database + Realtime | Supabase (Postgres + Realtime subscriptions) |
| Deploy | Vercel (auto-deploys on push to `main`) |
| QR codes | react-qr-code |

---

## Repository & Deploy

- **GitHub:** https://github.com/Cmdavis14/tabletalk
- **Branch:** `main` — Vercel deploys automatically on every push
- **Local dev:** `npm run dev` → `http://localhost:3000`

---

## Environment Variables

Three vars required. Set in `.env.local` for local dev and in Vercel project settings for production.

| Variable | Visibility | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Public (browser-safe) | Supabase project API URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public (browser-safe) | Supabase anon key — RLS controls access |
| `NEXT_PUBLIC_APP_URL` | Public (browser-safe) | Live domain, e.g. `https://tabletalk.vercel.app` — used to build the QR code URL |
| `NEXT_PUBLIC_DEMO_RESTAURANT_SLUG` | Public (browser-safe) | Which restaurant the dashboard shows. Defaults to `sol-smoke-kitchen` if omitted |
| `DASHBOARD_DEMO_PASSWORD` | **Server-only (never NEXT_PUBLIC_)** | Password for the temporary dashboard gate |

> `NEXT_PUBLIC_` vars are baked in at build time — changing them in Vercel requires a redeploy.
> `DASHBOARD_DEMO_PASSWORD` is runtime-only and never exposed to the browser.

---

## Complete File Structure

```
app/
  layout.tsx                          Root layout — Geist font, metadata
  globals.css                         Tailwind v4 + shadcn token setup
  page.tsx                            Landing page (public, server component)

  r/[slug]/
    page.tsx                          Guest issue submission form (public, client component)

  dashboard/
    page.tsx                          Server component — fetches initial tickets, renders DashboardClient
    DashboardClient.tsx               Client component — Realtime subscription + full dashboard UI
    actions.ts                        Server actions: loginAction, logoutAction (cookie management)

    login/
      page.tsx                        Login form (client component, useActionState)

    tickets/[id]/
      page.tsx                        Ticket detail — status updates, internal notes (client component)

    qr/
      page.tsx                        Server component — fetches restaurant name, renders QRClient
      QRClient.tsx                    Client component — QR card UI, copy/print (client component)

lib/
  supabase.ts                         Single Supabase client instance (NEXT_PUBLIC_ env vars)
  db.ts                               DB types (DbRestaurant, DbGuestIssue), label maps, dbToTicket()
  mock-data.ts                        Type definitions only: Ticket, Priority, Status, GuestStatus
  ticket-utils.ts                     priorityConfig(), statusConfig(), timeAgo()
  utils.ts                            cn() (clsx + tailwind-merge)

middleware.ts                         Edge middleware — protects /dashboard/* routes, checks auth cookie

supabase/
  seed.sql                            Demo seed data — safe to rerun (see "Seed Data" section below)
```

---

## Database Schema

Two tables in Supabase. No schema changes have been made through the app — all migrations are manual.

### `restaurants`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK, auto-generated |
| created_at | timestamptz | auto |
| name | text | Display name |
| slug | text | URL-safe identifier, used in `/r/[slug]` |
| location | text | nullable |
| business_type | text | nullable, unused by app currently |
| owner_email | text | nullable, unused by app currently |
| is_active | boolean | |

### `guest_issues`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK, auto-generated |
| created_at | timestamptz | auto |
| restaurant_id | uuid | FK → restaurants.id |
| issue_type | text | `food_problem` `long_wait` `wrong_order` `service_issue` `cleanliness_issue` `manager_request` `other` |
| priority | text | `low` `medium` `high` `critical` — auto-assigned on insert by guest form |
| status | text | `new` `seen` `in_progress` `resolved` `closed` |
| is_guest_still_here | boolean | |
| table_number | text | nullable |
| order_identifier | text | nullable |
| message | text | nullable |
| customer_name | text | nullable |
| customer_phone | text | nullable, collected but not displayed anywhere yet |
| customer_email | text | nullable |
| internal_notes | text | nullable — team-only, never shown to guests |
| resolved_at | timestamptz | nullable — set when status is moved to `resolved` |

**Priority auto-assignment** (set on insert in `lib/db.ts → ISSUE_PRIORITY_MAP`):
- `manager_request` → `critical`
- `food_problem`, `wrong_order`, `cleanliness_issue` → `high`
- `long_wait`, `service_issue` → `medium`
- `other` → `low`

---

## What's Built and Working

### 1. Landing page — `/`
- Public, server component
- Hero with tagline, 3-step "How it works" strip, 3 feature cards (gray / amber / emerald), branded footer
- Links to dashboard (password-gated) and the demo guest form
- `NEXT_PUBLIC_DEMO_RESTAURANT_SLUG` controls which guest form the demo CTA links to

### 2. Guest submission form — `/r/[slug]`
- Public, client component — no auth required, by design
- Fetches restaurant by slug from Supabase on mount
- Issue type selector: 7 types with icons (Utensils, Clock, AlertCircle, User, Sparkles, UserCog, HelpCircle)
- Still here / Already left toggle
- Table number + order ref (optional)
- Message textarea (required)
- Optional contact name + email for follow-up
- On submit: inserts row into `guest_issues` with auto-assigned priority; shows branded success screen
- Form validates: issue type + non-empty message both required before submit enables
- Works for any restaurant slug — `/r/sol-smoke-kitchen`, `/r/goros-sushi-demo`, etc.

### 3. Dashboard — `/dashboard` and `/dashboard/*`
- **Password-gated** (see "Auth Gate" section below)
- `page.tsx` is a server component with `force-dynamic` — fetches initial restaurant + tickets from Supabase on every load
- `DashboardClient.tsx` is a client component that:
  - Holds tickets in React state, seeded from server-fetched data
  - Subscribes to Supabase Realtime `postgres_changes` on `guest_issues` filtered by `restaurant_id`
  - Handles `INSERT` (new ticket prepended), `UPDATE` (ticket updated in-place), `DELETE` (ticket removed)
- Which restaurant it shows is controlled by `NEXT_PUBLIC_DEMO_RESTAURANT_SLUG`

**Summary cards (4):**
- Open Issues — count of non-resolved/closed tickets; subtitle shows new-ticket count
- Critical — count of critical-priority tickets; card turns red-tinted when count > 0
- Guests Here — count of guests marked "Still here" with open issues (most actionable live stat)
- Resolved — count of resolved tickets; shows top issue type as subtitle

**Ticket list:**
- Each row: issue type, "Still here" green badge (when applicable), priority badge, status badge, message preview, table number, time-ago
- Critical tickets: red left border
- Clicking a row navigates to ticket detail
- Empty state: Inbox icon with a link to the guest form

### 4. Ticket detail — `/dashboard/tickets/[id]`
- Fetches issue by UUID from Supabase on mount
- Status stepper: `New → Seen → In Progress → Resolved` — clicking updates `status` in DB; sets `resolved_at` when resolved
- Visual timeline showing progression
- Internal notes textarea — saves to `internal_notes` column; amber callout box makes clear it's team-only
- Meta grid: guest status, time submitted, order ref — each with a small icon
- Shows contact info (name, email) if the guest provided it

### 5. QR code page — `/dashboard/qr`
- Server component fetches restaurant name by slug; passes it + guest URL to `QRClient`
- Screen preview of the printable table card
- Copy link button, Print button
- Print-only CSS renders a clean 3.5" × 5" card at exact print size
- QR card headline: "Something not right? Tell us privately — we'll fix it now."
- QR URL: `NEXT_PUBLIC_APP_URL/r/NEXT_PUBLIC_DEMO_RESTAURANT_SLUG`

### 6. Auth gate — `/dashboard/login`
- **Temporary demo protection — not production auth**
- `middleware.ts` runs on the Edge; intercepts every `/dashboard/*` request except `/dashboard/login`
- Checks for an httpOnly cookie named `tabletalk_demo_auth` whose value must match `DASHBOARD_DEMO_PASSWORD`
- If missing or wrong → redirect to `/dashboard/login`
- Login page uses React 19 `useActionState` + a server action (`loginAction`) to verify password and set the cookie
- Cookie: httpOnly, Secure in production, SameSite strict, 7-day expiry
- Logout button in the dashboard header calls `logoutAction` (server action) — deletes cookie, redirects to login
- `/`, `/r/[slug]` are **not** protected — public by design

---

## Seed Data

File: `supabase/seed.sql`

Run it in **Supabase → SQL Editor → New query → paste → Run**. Safe to rerun at any time before a demo.

**What it creates:**

| Restaurant | Slug | Location |
|---|---|---|
| Sol & Smoke Kitchen | `sol-smoke-kitchen` | San Antonio, TX |
| Goro's Sushi Demo | `goros-sushi-demo` | Austin, TX |

**10 guest issues (5 per restaurant), with fixed UUIDs:**

| # | Restaurant | Issue Type | Priority | Status | Still Here? |
|---|---|---|---|---|---|
| 1 | Sol & Smoke | Food problem (cold brisket) | Critical | New | Yes |
| 2 | Sol & Smoke | Wrong order (chicken vs pork) | High | In Progress | Yes |
| 3 | Sol & Smoke | Service issue (no server) | Medium | Seen | Yes |
| 4 | Sol & Smoke | Long wait | Medium | Resolved | No |
| 5 | Sol & Smoke | Manager request (double charge) | Critical | In Progress | Yes |
| 6 | Goro's | Wrong roll (allergy risk) | High | New | Yes |
| 7 | Goro's | Long wait for sushi | Medium | Seen | Yes |
| 8 | Goro's | Manager request | Critical | In Progress | Yes |
| 9 | Goro's | Food different than expected | High | Resolved | No |
| 10 | Goro's | Table not checked on | Medium | New | Yes |

**How the seed works:**
- Restaurants: looked up by slug, inserted if missing, updated if present — never duplicates
- Issues: the 10 fixed UUIDs are deleted and reinserted fresh each run — timestamps are relative to `NOW()`, so data always looks recent
- Real guest-submitted issues (random UUIDs) are never touched

---

## Known Issues / Gaps

### 1. No production auth
The dashboard gate is password-only (a single shared secret in `DASHBOARD_DEMO_PASSWORD`). It is intentionally temporary. Full Supabase auth (per-user login, sessions, restaurant-scoped access) has not been built.

### 2. No Row Level Security (RLS)
Supabase RLS policies have not been configured. The anon key currently has unrestricted read/write access to both tables. Before this goes to real restaurants, RLS must be added:
- Guests should only be able to `INSERT` into `guest_issues` (not read)
- Dashboard reads/writes should require an authenticated session

### 3. Supabase Realtime not yet enabled in project settings
The subscription code is fully wired in `DashboardClient.tsx`, but **Realtime must be turned on for `guest_issues` in Supabase** before it will fire. To enable: Supabase dashboard → Database → Replication → toggle `guest_issues` on. This was intentionally deferred.

### 4. Dashboard is single-restaurant only
`NEXT_PUBLIC_DEMO_RESTAURANT_SLUG` points the dashboard at one restaurant at a time. Changing it requires updating the env var and redeploying. A restaurant picker UI or multi-tenant routing has not been built.

### 5. `customer_phone` is collected in the DB schema but never shown
The `guest_issues` table has a `customer_phone` column. The guest form does not collect it and the ticket detail page does not display it. Either add it to both, or drop the column.

### 6. Avg Response Time is gone, not computed
The old "Avg Response" dashboard card was replaced with "Guests Here" (a live, useful stat). If average resolution time is needed, it would require computing the average of `(resolved_at - created_at)` across resolved tickets.

### 7. `timeAgo()` timestamps don't tick
The "6 min ago" timestamps on dashboard ticket rows are computed once on render and don't update. A `setInterval` inside `DashboardClient` would keep them fresh.

### 8. No pagination
The dashboard fetches all tickets for a restaurant with no limit. Fine for a demo; will degrade at scale.

### 9. Login page footer is hardcoded
`app/dashboard/login/page.tsx` has "Sol & Smoke Kitchen · San Antonio, TX" hardcoded at the bottom. It should use `NEXT_PUBLIC_DEMO_RESTAURANT_SLUG` or be removed.

---

## What Hasn't Been Built Yet

| Feature | Notes |
|---|---|
| **Full auth** | Supabase Auth — per-user logins, JWT sessions, restaurant-scoped data |
| **RLS policies** | Must be added before going to real restaurants |
| **Multi-tenant routing** | Each restaurant has its own dashboard URL, not just a shared `/dashboard` |
| **Email / SMS alerts** | Notify staff when a new critical issue comes in |
| **Guest follow-up emails** | Send a resolution email to `customer_email` when a ticket is resolved |
| **Avg Response Time** | Compute from `created_at` / `resolved_at` |
| **Ticket filtering / sorting** | Filter by status, priority, date on the dashboard |
| **Ticket search** | Search by message text, table, order ref |
| **Analytics** | Weekly trends, top issue types, resolution rate over time |
| **Onboarding flow** | Restaurant signup, slug creation, first QR card generation |

---

## Demo Flow (walkthrough order)

1. **`/`** — Landing page. Show the 3-step strip and feature cards.
2. **`/dashboard`** (password-gated) — Enter the demo password. Shows Sol & Smoke Kitchen's live ticket board. Point out: Critical cards, "Guests Here" stat, "Still here" badges, red left borders on critical rows.
3. **`/dashboard/tickets/[id]`** — Click any ticket. Show status stepper with flow arrows, guest message, amber internal notes callout.
4. **`/r/sol-smoke-kitchen`** — Open in a new tab (or on mobile). Fill out and submit a guest issue. Switch back to the dashboard tab — the new ticket appears in real time (once Realtime is enabled in Supabase).
5. **`/dashboard/qr`** — Show the print card. Explain it goes on the table or receipt.

**To switch the demo to Goro's Sushi:** Set `NEXT_PUBLIC_DEMO_RESTAURANT_SLUG=goros-sushi-demo` in Vercel and redeploy, or set it in `.env.local` and restart dev server locally.

**To reset seed data before a demo:** Run `supabase/seed.sql` in the Supabase SQL Editor.
