# FRESH ATL — Firebase foundation build notes

## Where this build comes from

This is Fresh ATL, an Atlanta adaptation of the Fresh Detroit codebase
(`fairefaretravels/FreshDetroit`) — same platform, same green/tan/cream
design, same screens and nav, rebranded and re-scoped to Atlanta, GA.
It shares the same Firebase project as Fresh Detroit but writes to its
own `fa_*` collections, so the two cities' data never collide. The
original `fd_*` collections (Fresh Detroit) and the legacy, unrelated
`crops` / `food_listings` / `orders` collections (an older, unauthenticated
prototype also on this project) are untouched by this build.

`fairefaretravels/Food` only uses Firestore in `WhiteLabel/index.html`,
writing to a single collection: `appReviews`. That's untouched too.

## What I built

A rewired copy of the Fresh Detroit app — now reading and writing the
`fa_*` collections
from your approval message, with real anonymous-auth identity behind it:

- **fa_users** — created automatically on first visit via
  `signInAnonymously()`. Browsing is never gated on this.
- **fa_growers / fa_gardens** — created together the moment someone taps
  "Become a Grower" in Garden Buddy (new onboarding card, only shown if
  this uid has no grower profile yet). A default "My Garden" is created
  alongside it.
- **fa_crops** — Add Crop now writes here, scoped to `growerId`.
- **fa_harvests** — new step: a ready crop gets a "Mark Harvested" button,
  which creates the harvest doc and flips the crop to `status: harvested`.
- **fa_listings** — "List My Harvest" now starts from a harvest (not
  directly from a crop), matching the workflow in your brief:
  *Garden Buddy → Harvest → List My Harvest → fa_listings → Marketplace*.
- **fa_claims** — Consumer "Claim" creates a claim doc only. It does
  **not** silently flip the listing's status, because per your rules
  request only the owning grower can update their own listing. Instead,
  the grower's Garden Dashboard shows incoming claims with a
  "Mark Fulfilled" button that updates both the claim and the listing.
- **fa_alerts** — auto-created whenever a harvest is published; feeds the
  Alerts tab and the home "Fresh Alerts" section.
- **fa_notifications** — created on claim, targeted at the grower
  (`toGrowerId`), schema is in place even though the dashboard currently
  surfaces new claims via the live `fa_claims` listener directly.

## Demo data (Phase 11)

Seeded once, only if `fa_listings` has no published docs yet: Tomatoes,
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
   Fresh Detroit build notes, not from a live read of your rules.
3. Once rules are published, open `index.html` locally
   (`python3 -m http.server 8000`) in two tabs to run the success-criteria
   walkthrough: become a grower in one tab, add a crop, mark it harvested,
   list it, then claim it from the other tab as a consumer, then confirm
   the claim shows up on the grower's dashboard.

## Files
- `index.html` — the wired app, served at the site root. (This used to be
  a separate `fresh-atl.html`; that file has since been deleted and
  its fixes folded into `index.html`, which is now the only copy.)
- `firestore-rules-proposed.txt` — draft additive rules, for approval
- `CHANGES.md` — this file
