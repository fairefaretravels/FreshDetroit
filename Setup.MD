# Wiring FRESH DETROIT to Firebase

The prototype now reads and writes real data — no more localStorage for
crops, listings, or orders. Every browser/device pointed at the same
Firebase project sees the same marketplace live: a Grower publishes a
harvest, a Consumer sees it appear without refreshing, claims it, and
the Grower's dashboard updates.

## 1. Create a Firebase project

1. Go to https://console.firebase.google.com → **Add project**.
2. Name it anything (e.g. `fresh-detroit`) and finish the wizard.
3. Left sidebar → **Build > Firestore Database > Create database**.
   - **Start in production mode**.
   - Pick a region close to Detroit (e.g. `us-central`).

## 2. Set Firestore security rules

Firestore → **Rules** tab → replace the contents with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /crops/{cropId} {
      allow read: if true;
      allow create: if request.resource.data.name is string
                    && request.resource.data.name.size() < 60
                    && request.resource.data.expectedLbs is number;
      allow update: if request.resource.data.name == resource.data.name; // no renaming
      allow delete: if false;
    }

    match /food_listings/{listingId} {
      allow read: if true;
      allow create: if request.resource.data.crop is string
                    && request.resource.data.crop.size() < 60
                    && request.resource.data.price is number;
      allow update: if false;
      allow delete: if true; // claiming a listing removes it from the active marketplace
    }

    match /orders/{orderId} {
      allow read: if true;
      allow create: if request.resource.data.crop is string
                    && request.resource.data.price is number;
      allow update, delete: if false;
    }
  }
}
```

This is intentionally open (no auth yet — that's Stage 7 in the build
plan) but still validates shape and blocks edits/deletes where they
shouldn't happen. Tighten `allow create` to `if request.auth != null`
once real accounts exist. Click **Publish**.

## 3. Get your web app config

1. Firebase → **Project settings** (gear icon) → **General**.
2. Under "Your apps," click **`</>`** to register a web app. Any nickname
   is fine — no Firebase Hosting needed.
3. Copy the `firebaseConfig` object it shows you.
4. In `fresh-detroit.html`, find this block near the top of the
   `<script>` tag and paste your values in:

```js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

The app detects a real config automatically (it checks that `apiKey`
isn't still the placeholder) and seeds the three starter crops and
four starter listings into Firestore the first time it connects. After
that, it stops seeding and just reads/writes live.

## 4. Test locally

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000/fresh-detroit.html` in two browser tabs
(or two devices). Switch one to **Grower**, publish a harvest, and
watch it appear live in the other tab's **Consumer** marketplace.
Claim it there and watch the Grower's order count and revenue update.

## 5. Deploy

It's a static file — same as `Food`. Push to GitHub, import into
Vercel, no build command needed.

## What's wired vs. what's still local

| Data | Where it lives |
|---|---|
| Crops, listings, orders | **Firestore** — shared, real-time, source of truth |
| Saved listings, "what's in my kitchen" (Food Finder) | Still `localStorage`, per-device — there's no user account yet to attach them to |
| Grower/Consumer role toggle | Still `localStorage` — it's a demo view switch, not an authenticated identity |

Auth (real grower accounts vs. consumer accounts) is Stage 7 in the
original build plan — once that's in, `saved` and role should move
into Firestore too, scoped to the signed-in user.
