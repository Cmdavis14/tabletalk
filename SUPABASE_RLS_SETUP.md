# Supabase RLS Setup — TableTalk MVP

Run these SQL commands in the Supabase Dashboard → SQL Editor for the TableTalk project.

---

## Why RLS matters here

TableTalk's anon key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`) is embedded in the client bundle — any
visitor to the site can read it from the page source or network tab. Without Row Level Security
enabled, that key grants direct read/write access to every row in every table via the Supabase
REST API, bypassing the application entirely. RLS is the last line of defense at the database layer.

---

## Current auth limitations

The dashboard login is a **cookie-based demo gate**, not a Supabase Auth session. When a staff
member logs in, the app sets a `tabletalk_demo_auth=authenticated` cookie and the Next.js proxy
checks it on every dashboard request. Supabase never sees a JWT that identifies this user.

From Supabase's perspective, every request — from a guest scanning a QR code and from a
restaurant manager viewing the dashboard — arrives with the same anon key and no user identity.
RLS cannot distinguish between them. All policies below apply equally to both.

This is the intentional trade-off for an MVP. The upgrade path is described at the bottom.

---

## SQL — Enable RLS and add policies

Run these statements in order. Each is idempotent: running them more than once is safe.

### 1. Enable RLS on both tables

```sql
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_issues ENABLE ROW LEVEL SECURITY;
```

Once RLS is enabled, **all access is denied by default** until a matching policy grants it.
The policies below restore exactly the access the application needs and nothing more.

---

### 2. `restaurants` — allow anon SELECT

The guest form looks up a restaurant by slug to display the restaurant name and validate the
URL. The dashboard and QR page also read the restaurant name and location. All three are
read-only.

```sql
CREATE POLICY "anon_select_restaurants"
  ON restaurants
  FOR SELECT
  TO anon
  USING (true);
```

No INSERT, UPDATE, or DELETE policy is created for `restaurants`. Omitting them means the
anon key cannot create, modify, or remove restaurant records.

---

### 3. `guest_issues` — allow anon INSERT

Guest submissions arrive via a Next.js Server Action (`app/r/[slug]/actions.ts`). The action
runs server-side but uses the anon key. Guests must be able to insert a row.

```sql
CREATE POLICY "anon_insert_guest_issues"
  ON guest_issues
  FOR INSERT
  TO anon
  WITH CHECK (true);
```

---

### 4. `guest_issues` — allow anon SELECT

Required by two paths:

- **Ticket detail page** (`/dashboard/tickets/[id]`): a client-side `useEffect` fetches a
  single row by id using the anon key.
- **Realtime subscription** in `DashboardClient.tsx`: Supabase Realtime enforces RLS on the
  channel. If anon cannot SELECT from `guest_issues`, the live dashboard feed stops receiving
  events — there is no workaround without changing the subscription architecture.

```sql
CREATE POLICY "anon_select_guest_issues"
  ON guest_issues
  FOR SELECT
  TO anon
  USING (true);
```

---

### 5. `guest_issues` — allow anon UPDATE

The ticket detail page updates `status`, `resolved_at`, and `internal_notes` directly from
the browser using the anon key. Until these writes are moved to Server Actions, the anon key
needs UPDATE permission.

```sql
CREATE POLICY "anon_update_guest_issues"
  ON guest_issues
  FOR UPDATE
  TO anon
  USING (true);
```

---

### 6. DELETE — denied by omission

No DELETE policy is created for either table. No application code deletes rows. Omitting the
policy means the anon key cannot delete anything.

---

## Realtime limitation

The live ticket feed in `DashboardClient.tsx` opens a Supabase Realtime channel using the
client-side anon key. Realtime enforces RLS: the channel only delivers change events for rows
the subscriber's key is allowed to SELECT. This means:

- If anon SELECT is granted (as above), Realtime works and the dashboard is live.
- If anon SELECT is removed to lock down guest_issues, Realtime silently stops delivering
  events with no error — the dashboard appears to work but never updates.

There is no way to use the service role key for a client-side Realtime subscription. The
subscription must be moved to an authenticated Supabase session (see migration path below)
before SELECT can be restricted.

---

## Future migration path — Supabase Auth

To enforce proper row-level ownership and remove the blanket anon permissions:

1. **Add Supabase Auth to the dashboard login.** Replace `loginAction` + cookie with
   `supabase.auth.signInWithPassword()`. Staff accounts become real Supabase Auth users.

2. **Create a server-side Supabase client.** Add `SUPABASE_SERVICE_ROLE_KEY` to env and
   create a second client in `lib/supabase-server.ts`. Use it in all Server Components and
   Server Actions (dashboard page, QR page, ticket detail actions). This client bypasses RLS
   and is never sent to the browser.

3. **Tighten RLS to use `auth.uid()`.** With real sessions, policies can check the caller's
   identity:

   ```sql
   -- Example: only the owning restaurant user can select their own tickets
   CREATE POLICY "owner_select_guest_issues"
     ON guest_issues
     FOR SELECT
     TO authenticated
     USING (
       restaurant_id IN (
         SELECT id FROM restaurants WHERE owner_email = auth.email()
       )
     );
   ```

4. **Realtime works with auth sessions.** Once the dashboard user has a Supabase session, the
   Realtime channel carries their JWT. The policy above ensures they only receive events for
   their own restaurant's tickets.

5. **Remove anon SELECT and UPDATE from `guest_issues`.** Keep only anon INSERT (for guest
   submissions). All dashboard reads and writes go through authenticated sessions or the
   service role key.

---

## Warning — MVP-level security

> **This configuration is appropriate for a private demo or early pilot. It is not
> enterprise-grade security.**

What this setup does:
- Prevents direct table access when RLS is disabled (the worst case)
- Blocks anon INSERT/UPDATE/DELETE on `restaurants`
- Blocks anon DELETE on `guest_issues`
- Ensures no unauthenticated database-level access exists

What this setup does NOT do:
- Prevent a person with the anon key from reading all guest PII across all restaurants
- Prevent a person with the anon key from updating any ticket's status or internal notes
- Enforce any per-restaurant data isolation

Before onboarding real paying restaurants or handling real guest data at scale, complete the
Supabase Auth migration described above.
