# TableTalk — Project Instructions

## What This Is
TableTalk is a restaurant guest issue ticketing system — like an IT helpdesk but for restaurants. Guests scan a QR code and submit issues in real time; the restaurant team tracks and resolves them before the guest leaves.

**Core positioning:** "Catch guest issues before they become bad reviews."

## Stack
- Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui, Lucide icons
- Supabase (auth + DB), Vercel, react-qr-code

## Demo Restaurant
- **Name:** Sol & Smoke Kitchen, San Antonio TX
- **Slug:** `sol-smoke-kitchen`

## Build Order — UI First, Always

Build the static UI with mock data before any backend work. Every version must be demo-ready.

1. Static landing page
2. Static restaurant dashboard with mock ticket data
3. Static customer issue submission page
4. Static ticket detail page
5. Supabase database setup
6. Connect customer issue form to Supabase
7. Connect dashboard to real tickets with Realtime
8. QR code generation page
9. Polish and deploy

**Never build backend and frontend in parallel.** Complete and approve the static UI before wiring up Supabase, APIs, or auth.

## Language Rules
Use these terms only:
- "Guest Issues", "Tickets", "Open Issues", "Resolved Issues", "Recovery Requests", "Response Time"

Never call it a survey, feedback form, or complaint system.
