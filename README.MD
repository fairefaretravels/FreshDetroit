# FRESH DETROIT — Firebase foundation build notes

## What I found before touching anything

- `fairefaretravels/Food` only uses Firestore in `WhiteLabel/index.html`,
  writing to a single collection: `appReviews`. That's untouched.
- `fairefaretravels/FreshDetroit` (the code behind fresh-detroit.vercel.app)
  is a *separate* prototype, already live on this same Firebase project,
  writing to `crops` / `food_listings` / `orders` with **no auth at all**.
  That's where your pasted rules came from. This file is also untouched —
  the new build is a separate, edited copy (see below).

## What I built

A rewired copy of `FreshDetroit/index.html` — same green/tan/cream design,
same screens, same nav — now reading and writing the `fd_*` collections
from your approval message, with real anonymous-auth identity behind it:

- **fd_users** — created automatically on first visit via
  `signInAnonymously()`. Browsing is never gated on this.
- **fd_growers / fd_gardens** — created together the moment someone taps
  "Become a Grower" in Garden Buddy (new onboarding card, only shown if
  this uid has no grower profile yet). A default "My Garden" is created
  alongside it.
- **fd_crops** — Add Crop now writes here, scoped to `growerId`.
- **fd_harvests** — new step: a ready crop gets a "Mark Harvested" button,
  which creates the harvest doc and flips the crop to `status: harvested`.
- **fd_listings** — "List My Harvest" now starts from a harvest (not
  directly from a crop), matching the workflow in your brief:
  *Garden Buddy → Harvest → List My Harvest → fd_listings → Marketplace*.
- **fd_claims** — Consumer "Claim" creates a claim doc only. It does
  **not** silently flip the listing's status, because per your rules
  request only the owning grower can update their own listing. Instead,
  the grower's Garden Dashboard shows incoming claims with a
  "Mark Fulfilled" button that updates both the claim and the listing.
- **fd_alerts** — auto-created whenever a harvest is published; feeds the
  Alerts tab and the home "Fresh Alerts" section.
- **fd_notifications** — created on claim, targeted at the grower
  (`toGrowerId`), schema is in place even though the dashboard currently
  surfaces new claims via the live `fd_claims` listener directly.

## Demo data (Phase 11)

Seeded once, only if `fd_listings` has no published docs yet: Tomatoes,
Collard Greens, Basil, Peppers, Cucumbers — each tagged `isDemo: true` and
visibly labeled "DEMO" in the marketplace card, list row, and detail sheet.
`growerId: "demo"` so they're clearly not attributable to a real grower
and are skipped by the claim-notification logic.

## Explicitly not built (per Phase 12)

No Stripe/payments, no subscriptions, no AI predictions, no admin UI, no
large-scale notification fan-out.

## Before you deploy

1. Rules: see `firestore-rules-proposed.txt` — draft only, not deployed,
   waiting on your go-ahead per Phase 9.
2. Please verify the `appReviews` and `crops/food_listings/orders` blocks
   in that file actually match what's live in your Firestore console
   right now — I reconstructed them from the Food README and the
   FreshDetroit Setup.MD, not from a live read of your rules.
3. Once rules are published, open `index.html` locally
   (`python3 -m http.server 8000`) in two tabs to run the success-criteria
   walkthrough: become a grower in one tab, add a crop, mark it harvested,
   list it, then claim it from the other tab as a consumer, then confirm
   the claim shows up on the grower's dashboard.

## Files
- `index.html` — the wired app, served at the site root. (This used to be
  a separate `fresh-detroit.html`; that file has since been deleted and
  its fixes folded into `index.html`, which is now the only copy.)
- `firestore-rules-proposed.txt` — draft additive rules, for approval
- `CHANGES.md` — this file
