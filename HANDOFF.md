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
| Framework | Next.js 16.2.6 (App Router), TypeScript |
| Styling | Tailwind CSS v4, shadcn/ui, Lucide icons |
| Database + Realtime | Supabase (Postgres + Realtime subscriptions) |
| Email | Resend (v6.12.3) via `/api/notify` route |
| Deploy | Vercel (auto-deploys on push to `main`) |
| QR codes | react-qr-code |

---

## Repository & Deploy

- **GitHub:** https://github.com/Cmdavis14/tabletalk
- **Branch:** `main` — Vercel deploys automatically on every push
- **Local dev:** `npm run dev` → `http://localhost:3000`

---

## Environment Variables

All five vars required. Set in `.env.local` for local dev and in Vercel project settings for production.

| Variable | Visibility | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Public (browser-safe) | Supabase project API URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public (browser-safe) | Supabase anon key — RLS controls access |
| `NEXT_PUBLIC_APP_URL` | Public (browser-safe) | Live domain, e.g. `https://tabletalk.vercel.app` — used to build QR code URLs. **Baked at build time — changing requires redeploy.** |
| `NEXT_PUBLIC_DEMO_RESTAURANT_SLUG` | Public (browser-safe) | Which restaurant the dashboard shows. Defaults to `sol-smoke-kitchen` if omitted. **Baked at build time.** |
| `DASHBOARD_DEMO_PASSWORD` | **Server-only** | Password for the temporary dashboard gate. Takes effect immediately — no redeploy needed. |
| `RESEND_API_KEY` | **Server-only** | Resend API key — never exposed to browser. Get from resend.com → API Keys. |
| `NOTIFY_EMAIL` | **Server-only** | Email address that receives guest issue notifications. |
| `RESEND_FROM_EMAIL` | **Server-only** | The "from" address Resend sends as. See note below. |

> `NEXT_PUBLIC_` vars are baked in at build time — changing them in Vercel requires a redeploy.
> The three `RESEND_*` vars are runtime-only and take effect immediately for new function invocations.

**Important Resend domain note:**
- Using `onboarding@resend.dev` as `RESEND_FROM_EMAIL` works without domain verification, but Resend's shared test domain can **only deliver to the email address registered on your Resend account**. Set `NOTIFY_EMAIL` to that same address, or verify a custom domain in Resend and use it instead (e.g. `notifications@tabletalk.app`).
- To verify a domain: Resend dashboard → Domains → Add Domain → follow DNS instructions.

---

## Complete File Structure

```
app/
  layout.tsx                          Root layout — Geist font, metadata
  globals.css                         Tailwind v4 + shadcn tokens + brand CSS vars
  page.tsx                            Landing page (public, server component)
  icon.svg                            Branded favicon — navy→teal gradient + white T

  r/[slug]/
    page.tsx                          Guest issue submission form (public, client component)

  api/
    notify/
      route.ts                        POST handler — receives ticket data, sends email via Resend

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
      QRClient.tsx                    Client component — QR card UI, copy/print

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

## Brand System

All pages use a consistent brand identity:

| Token | Value | Usage |
|---|---|---|
| `#07111F` | Dark navy | Headers, primary buttons, logo mark gradient start |
| `#009B9A` | Teal | Accent color, teal elements, logo mark gradient end |
| `#DDFBFA` | Soft teal | "Guests Here" card background, "Still here" badge background |
| `#9EECEB` | Teal border | Borders on teal-background elements |

**Logo mark pattern** (used in nav on every page):
```tsx
<div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#07111F] to-[#009B9A] flex items-center justify-center">
  <MessageSquare className="w-4 h-4 text-white" />
</div>
```

**Gradient wordmark** (light backgrounds):
```tsx
<span className="font-bold text-lg tracking-tight bg-gradient-to-r from-[#07111F] to-[#009B9A] bg-clip-text text-transparent">
  TableTalk
</span>
```

**Dark navy header** — dashboard, ticket detail, QR page:
```tsx
<header className="bg-[#07111F]">
```

---

## Database Schema

Two tables in Supabase. No schema changes have been made through the app.

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
| customer_phone | text | nullable, collected in schema but not used anywhere |
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
- Hero with tagline, 3-step "How it works" strip, 3 feature cards, branded footer
- Dark navy + teal brand identity throughout
- Links to dashboard (password-gated) and the demo guest form

### 2. Guest submission form — `/r/[slug]`
- Public, client component — no auth required, by design
- Fetches restaurant by slug from Supabase on mount
- Issue type selector: 7 types with icons
- Still here / Already left toggle; table number + order ref; message textarea; optional contact info
- On submit: inserts row into `guest_issues` with auto-assigned priority
- After successful insert: fires fire-and-forget POST to `/api/notify` — guest sees success screen immediately regardless of email outcome
- Shows branded success screen with teal check icon

### 3. Email notifications — `/api/notify`
- Server-only API route (secrets never reach the browser)
- Receives POST with `{ restaurantName, issueType, priority, guestStatus, tableNumber, message }`
- Sends branded HTML email via Resend: navy header, priority emoji, issue details table, guest message
- If env vars are missing: logs `[notify] Missing env vars` on server, returns 500
- If Resend fails: logs `[notify] Resend error:` on server, browser logs `[TableTalk] Email notification failed:`
- Guest success screen is **never blocked** by email delivery

### 4. Dashboard — `/dashboard` and `/dashboard/*`
- **Password-gated** (see "Auth Gate" section below)
- Server component fetches initial restaurant + tickets; `DashboardClient` holds Realtime subscription
- Timestamps re-render every 60 seconds so "6 min ago" labels stay live

**Summary cards (4):**
- Open Issues — count of non-resolved/closed tickets
- Critical — turns red-tinted when count > 0
- Guests Here — teal card, count of "Still here" guests with open issues
- Resolved — count; "Most resolved: X" subtitle counts resolved tickets only

**Ticket list:**
- Issue type, "Still here" teal badge, priority badge, status badge, message preview, table, time-ago
- Critical tickets: red left border
- Clicking a row navigates to ticket detail

### 5. Ticket detail — `/dashboard/tickets/[id]`
- Status stepper: `New → Seen → In Progress → Resolved` with teal active state
- Teal timeline node for current step
- Internal notes textarea (amber callout, team-only)
- Meta grid: guest status (teal dot if still here), time submitted, order ref
- Shows contact info if guest provided it

### 6. QR code page — `/dashboard/qr`
- Dark navy header, teal print button
- Screen preview of the printable table card
- Copy link button, Print button
- Print-only CSS: clean 3.5" × 5" card at exact print size

### 7. Auth gate — `/dashboard/login`
- **Temporary demo protection — not production auth**
- Edge middleware checks `tabletalk_demo_auth` cookie against `DASHBOARD_DEMO_PASSWORD`
- Branded login page with gradient logo mark
- Footer: "TableTalk · Restaurant Operations" (no longer hardcoded to a specific restaurant)
- 7-day cookie; logout clears it and redirects to login

### 8. Favicon
- `app/icon.svg` — navy→teal gradient rounded square with white T mark
- Injected as `<link rel="icon" type="image/svg+xml">` by Next.js App Router
- Takes priority over the legacy `favicon.ico` in all modern browsers

---

## Seed Data

File: `supabase/seed.sql`

Run it in **Supabase → SQL Editor → New query → paste → Run**. Safe to rerun at any time before a demo.

**What it creates:**

| Restaurant | Slug | Location |
|---|---|---|
| Sol & Smoke Kitchen | `sol-smoke-kitchen` | San Antonio, TX |
| Goro's Sushi Demo | `goros-sushi-demo` | Austin, TX |

**10 guest issues (5 per restaurant) with realistic messages, fixed UUIDs, and relative timestamps (`NOW() - INTERVAL`).**

- Real guest-submitted issues (random UUIDs) are never touched by the seed.
- Seed issues are deleted and reinserted each run so timestamps always look fresh.

---

## Auth Gate

- **Temporary demo protection — not production auth**
- `middleware.ts` runs on the Edge, intercepts every `/dashboard/*` request except `/dashboard/login`
- Cookie: `tabletalk_demo_auth`, httpOnly, Secure in production, SameSite strict, 7-day expiry
- Login uses React 19 `useActionState` + server action (`loginAction`)
- Logout calls `logoutAction` (server action) — deletes cookie, redirects to login
- `/`, `/r/[slug]`, `/api/*` are **not** protected — public by design

---

## Known Issues / Gaps

### 1. No production auth
Single shared password. Full Supabase Auth (per-user logins, JWT sessions) not built.

### 2. No Row Level Security (RLS)
Supabase anon key has unrestricted read/write access. Must be added before real restaurants use it.

### 3. Supabase Realtime must be manually enabled
The subscription code is wired in `DashboardClient.tsx` but Realtime must be turned on in Supabase:
**Supabase dashboard → Database → Replication → toggle `guest_issues` on.**

### 4. Dashboard is single-restaurant only
`NEXT_PUBLIC_DEMO_RESTAURANT_SLUG` points the dashboard at one restaurant. Changing it requires an env var update + redeploy (it's `NEXT_PUBLIC_`).

### 5. `customer_phone` not collected or displayed
The column exists in the schema but the guest form doesn't collect it and ticket detail doesn't show it.

### 6. Resend test domain limitation
`onboarding@resend.dev` as `RESEND_FROM_EMAIL` can only deliver to the email registered on your Resend account. For production (or to send to any address), verify a custom domain in Resend and update the env var.

### 7. `/api/notify` has no auth
Anyone who finds the endpoint can POST to it and trigger emails. For production, add a shared-secret header check (`x-tabletalk-secret`) compared against a server-only env var.

### 8. `customer_phone` column unused
Collected in schema, not shown anywhere, not collected by the form.

### 9. No pagination
Dashboard fetches all tickets for a restaurant with no limit. Fine for demo; will degrade at scale.

---

## What Hasn't Been Built Yet

| Feature | Notes |
|---|---|
| **Full auth** | Supabase Auth — per-user logins, JWT sessions, restaurant-scoped data |
| **RLS policies** | Must be added before going to real restaurants |
| **Multi-tenant routing** | Each restaurant has its own dashboard URL |
| **Custom email domain** | Verify a domain in Resend so emails come from `@tabletalk.app` or similar |
| **Notify email per restaurant** | Currently one `NOTIFY_EMAIL` env var; should come from `restaurants` table |
| **Guest follow-up emails** | Send resolution email to `customer_email` when ticket is resolved |
| **SMS alerts** | Notify staff via SMS for critical issues |
| **Avg Response Time** | Compute from `created_at` / `resolved_at` |
| **Ticket filtering / sorting** | Filter by status, priority, date |
| **Ticket search** | Search by message text, table, order ref |
| **Analytics** | Weekly trends, top issue types, resolution rate |
| **Onboarding flow** | Restaurant signup, slug creation, first QR card |
| **`/api/notify` auth** | Shared-secret header to prevent abuse |

---

## Demo Flow (walkthrough order)

1. **`/`** — Landing page. Show the 3-step strip and feature cards.
2. **`/dashboard`** (password-gated) — Enter the demo password. Shows Sol & Smoke Kitchen's live ticket board. Point out: Critical cards (red), "Guests Here" stat (teal), "Still here" badges, red left borders on critical rows.
3. **`/dashboard/tickets/[id]`** — Click any ticket. Show status stepper (teal active), timeline, guest message, amber internal notes callout.
4. **`/r/sol-smoke-kitchen`** — Open in a new tab (or on mobile). Fill out and submit a guest issue. Switch back to the dashboard tab — the new ticket appears in real time (once Realtime is enabled in Supabase). An email notification also fires to `NOTIFY_EMAIL`.
5. **`/dashboard/qr`** — Show the print card. Explain it goes on the table or receipt.

**To switch the demo to Goro's Sushi:** Set `NEXT_PUBLIC_DEMO_RESTAURANT_SLUG=goros-sushi-demo` in Vercel and redeploy, or set it in `.env.local` and restart dev server locally.

**To reset seed data before a demo:** Run `supabase/seed.sql` in the Supabase SQL Editor.

---

## Pre-Demo Checklist

- [ ] `NEXT_PUBLIC_APP_URL` set in Vercel (QR codes point to localhost if missing)
- [ ] `DASHBOARD_DEMO_PASSWORD` set in Vercel
- [ ] `RESEND_API_KEY`, `NOTIFY_EMAIL`, `RESEND_FROM_EMAIL` set in Vercel
- [ ] Supabase Realtime enabled for `guest_issues` table (one-time setup)
- [ ] Seed data freshly run in Supabase SQL Editor
- [ ] Test: submit a guest issue → appears on dashboard live → email arrives
