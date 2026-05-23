# TableTalk — Mobile Responsiveness Audit
*Read-only inspection · May 23, 2026*

---

## HIGH Severity

---

### DASH-01 — Filter tabs: tap targets critically undersized
**Route:** `/dashboard`
**Screen:** All mobile (≤ 640px)
**Status:** ✅ Fixed — `py-1.5` → `py-2.5` in `DashboardClient.tsx`

Filter buttons used `py-1.5` = ~28px tall. Apple HIG minimum is 44px; WCAG 2.5.5 recommends 44×44px. Staff swiping quickly through filters on a busy Friday night will frequently miss these.

**Fix:** Change `py-1.5` → `py-2.5` on every filter tab button. No layout change needed.

---

### QR-01 — QR page header CTAs: tap targets critically undersized
**Route:** `/dashboard/qr`
**Screen:** All mobile
**Status:** ✅ Fixed — Copy link `py-1.5` → `py-2.5`, Print `py-1.5` → `py-3` in `QRClient.tsx`

Both "Copy link" (`py-1.5 px-3`) and "Print" (`py-1.5 px-4`) rendered at ~28px tall. Print is the primary action on this page — a manager standing at the printer tapping this on a phone will reliably miss it.

**Fix:** Copy link → `py-2.5`. Print → `py-3` to signal it is the primary action.

---

### DETAIL-01 — Ticket detail meta grid: 3 columns on all screen sizes
**Route:** `/dashboard/tickets/[id]`
**Screen:** All mobile (≤ 640px); worst at 320px
**Status:** ✅ Fixed — `grid-cols-3` → `grid-cols-2 sm:grid-cols-3` in `tickets/[id]/page.tsx`

The section containing Guest status / Submitted / Order ref used `grid grid-cols-3 gap-4` with no responsive override. At 375px with `p-6` card padding, each column was ~101px. At 320px it dropped to ~73px. "Guest status" renders a `User` icon + label text + a value with an inline colored dot and "Still here" — all in 73px. Essentially unreadable; "Still here" would overflow or truncate with no ellipsis.

**Fix:** `grid-cols-2 sm:grid-cols-3` — Guest status and Submitted on first row, Order ref on second row left on mobile. Three-across layout preserved on `sm` (640px+) and above.

---

## MEDIUM Severity

---

### DASH-02 — Filter tab scroll: no visual affordance on 320px
**Route:** `/dashboard`
**Screen:** 320px (iPhone SE and equivalents)
**Status:** 🔲 Not yet implemented

Five tabs at current widths total ~310px. On 320px viewport with `px-6` = 272px usable — tabs overflow and require horizontal scroll. The `overflow-x-auto` handles the scroll mechanically, but there is no visual cue (fade/shadow on the right edge) that tabs extend further. A user who can only see "All · New · In P..." will not know to swipe.

**Fix:** Wrap the tab row in a `relative` container and add a right-edge gradient overlay (`pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white`) that disappears once the user has scrolled to the end.

---

### DASH-03 — Search input: tap target and mobile keyboard behavior
**Route:** `/dashboard`
**Screen:** All mobile
**Status:** ✅ Fixed — `py-2` → `py-3`, added `autoComplete/autoCorrect/autoCapitalize/spellCheck` attrs in `DashboardClient.tsx`

Two problems together:
1. `py-2` = ~32px input height, below 44px minimum.
2. No `autoComplete="off"`, `autoCorrect="off"`, `autoCapitalize="none"`, `spellCheck={false}`. Mobile keyboards will try to capitalize "table 4" → "Table 4", autocorrect "12b" → something else, and suggest completions on every keystroke.

**Fix:** `py-3` on the input. Add `autoComplete="off" autoCorrect="off" autoCapitalize="none" spellCheck={false}`.

---

### DASH-04 — Load More button: tap target too small
**Route:** `/dashboard`
**Screen:** All mobile
**Status:** ✅ Fixed — `py-2` → `py-3`, `w-full` added, removed `text-center` from wrapper in `DashboardClient.tsx`

`py-2` = ~32px. The button is also narrow (content-width only, centered). A small tap target at the bottom of a scrolled list is the worst place for one.

**Fix:** `py-3 w-full` — full width makes it easy to hit after scrolling down.

---

### DETAIL-02 — Status stepper: separator `›` orphans on line wrap
**Route:** `/dashboard/tickets/[id]`
**Screen:** ≤ 480px
**Status:** 🔲 Not yet implemented

The stepper is `flex flex-wrap` with `›` separators as standalone `<span>` elements between buttons. On narrow screens buttons wrap to a new line but separators do not logically attach — a `›` can appear at the end of line 1 or start of line 2, making the progression visually incoherent. On 375px, all four buttons + separators + gaps ≈ 347px against ~327px available — a wrap is likely.

**Fix:** Switch from `flex-wrap` to `overflow-x-auto` (single scrollable row, no wrapping). This keeps the linear progression readable. Remove `flex-wrap`, add `overflow-x-auto`, keep `shrink-0` on each button.

---

### DETAIL-03 — Save Note button: tap target too small
**Route:** `/dashboard/tickets/[id]`
**Screen:** All mobile
**Status:** 🔲 Not yet implemented

`py-2` on the Save Note button = ~32px. Staff updating notes while holding a tablet or phone in one hand will frequently miss this.

**Fix:** `py-2` → `py-3` on the Save Note button.

---

### QR-02 — QR header: overflow risk on 320px
**Route:** `/dashboard/qr`
**Screen:** 320px
**Status:** ✅ Fixed — "Copy link" and "Copied" text wrapped in `<span className="hidden sm:inline">` in `QRClient.tsx`

"← Dashboard" (~95px) + "Copy link" with icon (~85px) + "Print" with icon (~65px) + gaps + `px-6` = ~269px against 272px usable. Any user-set font size increase, browser zoom, or longer restaurant name will break this. "Copy link" is also redundant on mobile since sharing is handled via the OS share sheet.

**Fix:** Hide the "Copy link" label on mobile, keep only the icon — `<span className="hidden sm:inline">Copy link</span>`. Recovers ~50px on mobile.

---

### GUEST-01 — Issue type grid: "Cleanliness issue" label wraps at 320px
**Route:** `/r/[slug]`
**Screen:** 320px
**Status:** 🔲 Not yet implemented

`grid grid-cols-2` with `px-4 py-3` buttons. At 320px each button is 134px wide; after `px-4` the label area is ~102px. "Cleanliness issue" (14px ≈ 106px) + icon (16px) + gap (8px) = ~130px — does not fit. Label wraps, making that button taller than all others. The grid rows then have mismatched heights and the `col-span-2` "Other" row breaks the visual rhythm.

**Fix:** Add `text-[13px]` to issue type buttons (down from `text-sm`/14px), or reduce icon to `w-3.5 h-3.5` and cut `gap-2` to `gap-1.5`.

---

### GUEST-02 — Sticky header + virtual keyboard interaction
**Route:** `/r/[slug]`
**Screen:** All mobile (iOS Safari, Android Chrome)
**Status:** 🔲 Not yet implemented

The guest form header is `sticky top-0 z-10` (~72px tall). When a guest taps a field near the bottom of the form, the virtual keyboard rises ~300px. The browser scrolls the focused field into view but does not account for the sticky header. The focused field can end up visually obscured behind the header.

**Fix:** Add `scroll-padding-top: 72px` to the `<html>` element in `globals.css` so the browser's scroll-into-view offset accounts for the sticky header height.

---

## LOW Severity

---

### DASH-05 — Dashboard header: restaurant name has no overflow protection
**Route:** `/dashboard`
**Screen:** ≤ 480px with long names
**Status:** 🔲 Not yet implemented

The restaurant name and subtitle `<div>` has no `min-w-0` and the `<p>` has no `truncate`. A long restaurant name with the right-side nav (QR Code + Logout) causes the flex row to overflow or wrap, breaking the header height.

**Fix:** Add `min-w-0` to the name container `<div>` and `truncate` to the name `<p>`.

---

### DASH-06 — Stat card subtitles: inconsistent card heights at 2-col layout
**Route:** `/dashboard`
**Screen:** 375px
**Status:** 🔲 Not yet implemented

At 2-column layout, each stat card is ~165px wide with `p-5`. Long subtitles like "With open issues · act now" and "No open issues on-site" wrap to 2 lines, making cards in the same row differ in height — visually uneven.

**Fix:** Add `min-h-[120px]` to each stat card, or shorten subtitles.

---

### DASH-07 — Ticket rows: badge stack cramped at 320px
**Route:** `/dashboard`
**Screen:** 320px
**Status:** 🔲 Not yet implemented

Ticket rows are `flex items-center gap-4 px-6`. The meta column + chevron take ~80px, leaving main content ~160px on 320px. When a ticket has all three badges ("Still here" + priority + status), the `flex-wrap` badge row stacks 2–3 lines and the row becomes disproportionately tall.

**Fix:** Reduce `px-6` → `px-4` on rows, or move the table/time meta to a second line with `flex-col sm:flex-row`.

---

### GUEST-03 — Guest form header: restaurant name has no truncation
**Route:** `/r/[slug]`
**Screen:** ≤ 375px with long names
**Status:** 🔲 Not yet implemented

`<p className="font-semibold text-sm ...">` has no `truncate`. For the guest-facing sticky header, a two-line restaurant name increases the header height and shifts the whole page scroll offset.

**Fix:** Add `truncate` to the name and `min-w-0` to its container `<div>`.

---

### GUEST-04 — Success screen: `p-10` padding too large at 320px
**Route:** `/r/[slug]` (post-submit state)
**Screen:** 320px
**Status:** 🔲 Not yet implemented

The success card uses `p-10` (40px all sides). On 320px that leaves only 240px content width — text wraps tightly and the layout looks cramped.

**Fix:** `p-6 sm:p-10` on the success card.

---

## Summary Table

| ID | Route | Element | Screen | Severity | Status |
|---|---|---|---|---|---|
| DASH-01 | `/dashboard` | Filter tab buttons | All mobile | **High** | ✅ Fixed |
| QR-01 | `/dashboard/qr` | Copy/Print buttons | All mobile | **High** | ✅ Fixed |
| DETAIL-01 | `/dashboard/tickets/[id]` | Meta 3-col grid | All mobile | **High** | ✅ Fixed |
| DASH-02 | `/dashboard` | Filter tab scroll hint | 320px | Medium | 🔲 Pending |
| DASH-03 | `/dashboard` | Search input | All mobile | Medium | ✅ Fixed |
| DASH-04 | `/dashboard` | Load More button | All mobile | Medium | ✅ Fixed |
| DETAIL-02 | `/dashboard/tickets/[id]` | Status stepper wrap | ≤ 480px | Medium | 🔲 Pending |
| DETAIL-03 | `/dashboard/tickets/[id]` | Save Note button | All mobile | Medium | 🔲 Pending |
| QR-02 | `/dashboard/qr` | Header overflow | 320px | Medium | ✅ Fixed |
| GUEST-01 | `/r/[slug]` | Issue type grid | 320px | Medium | 🔲 Pending |
| GUEST-02 | `/r/[slug]` | Sticky header + keyboard | All mobile | Medium | 🔲 Pending |
| DASH-05 | `/dashboard` | Header restaurant name | ≤ 480px | Low | 🔲 Pending |
| DASH-06 | `/dashboard` | Stat card subtitles | 375px | Low | 🔲 Pending |
| DASH-07 | `/dashboard` | Ticket rows | 320px | Low | 🔲 Pending |
| GUEST-03 | `/r/[slug]` | Header restaurant name | ≤ 375px | Low | 🔲 Pending |
| GUEST-04 | `/r/[slug]` | Success card padding | 320px | Low | 🔲 Pending |

**3 High (3 fixed) · 8 Medium · 5 Low**
