/* ============================================================
   farms-firebase.js
   Firestore service layer for the `farms` collection (the public
   Farms directory). This is the file the rest of the Farms
   feature was already written assuming existed — pages/farms.js
   calls getFarms() / getFarm() / addFarm(), and the rules doc
   references seedPresetFarms() living here. It didn't exist in
   the project as delivered; this fills that gap.

   Loaded as a plain global, after presetFarms.js (needs
   PRESET_FARMS) and before farm-card.js / pages/farms.js (which
   call the functions below). See the <script> order at the
   bottom of fresh-atl.html.

   Security note: this file does NOT gate seedPresetFarms() on any
   client-side "am I admin" check. The Firestore rules are the
   actual boundary — a non-admin calling this will simply get a
   permission-denied on the write, caught and logged below. A
   client-side isAdmin flag is not a security control and isn't
   used as one here.
============================================================ */

const fa_farmsRef = firebaseReady ? db.collection("farms") : null;

async function getFarms() {
  if (!firebaseReady) return [];
  const snap = await fa_farmsRef.orderBy("name").get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

async function getFarm(id) {
  if (!firebaseReady) return null;
  const snap = await fa_farmsRef.doc(id).get();
  return snap.exists ? { id: snap.id, ...snap.data() } : null;
}

async function addFarm(farm) {
  if (!firebaseReady) throw new Error("Firebase not configured");
  return fa_farmsRef.add({
    ...farm,
    createdAt: Date.now(),
    updatedAt: Date.now()
  });
}

/* ---------------- ADMIN: seed the three preset farms ----------------
   Idempotent: checks for an existing preset doc with the same name
   before writing, so running this more than once (or against a
   Firestore that already has the presets) never creates duplicates.

   Requires an authenticated session whose fa_users/{uid} doc has
   role: "admin" — enforced by the farms.create rule, not by this
   function. Run from the browser console:

     seedPresetFarms().then(r => console.log(r));

   Returns { created: [...names], skipped: [...names], errors: [...] }.
============================================================ */
async function seedPresetFarms() {
  if (!firebaseReady) throw new Error("Firebase not configured");
  const result = { created: [], skipped: [], errors: [] };

  for (const preset of PRESET_FARMS) {
    try {
      const existing = await fa_farmsRef
        .where("preset", "==", true)
        .where("name", "==", preset.name)
        .limit(1)
        .get();
      if (!existing.empty) {
        result.skipped.push(preset.name);
        continue;
      }
      await fa_farmsRef.add({
        ...preset,
        source: "preset",
        preset: true,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
      result.created.push(preset.name);
    } catch (e) {
      console.error(`seedPresetFarms: failed on "${preset.name}":`, e.code || e.message);
      result.errors.push({ name: preset.name, code: e.code || e.message });
    }
  }

  if (result.errors.length && result.created.length === 0 && result.skipped.length === 0) {
    console.warn("seedPresetFarms: every write failed — most likely this session's fa_users doc isn't role:'admin', or the rules haven't been published yet.");
  }
  return result;
}

// Exposed explicitly for console use — there's no in-app admin button
// per your instruction not to trust a client-side isAdmin check.
window.seedPresetFarms = seedPresetFarms;
