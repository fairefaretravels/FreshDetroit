/* ============================================================
   firebase/farms.js
   Reusable Firestore service for the `farms` collection.
   Does NOT initialize Firebase — it reuses the `db` instance
   already created in the main app's inline script. This file
   must be included (via <script>) AFTER that script runs, so
   `db` and `firebaseReady` already exist in the shared global
   scope. (Classic <script> tags on the same page share one
   top-level lexical scope — no bundler/modules needed here.)
============================================================ */

const farmsRef = () => {
  if (!firebaseReady) throw new Error("Firebase is not connected");
  return db.collection("farms");
};

async function getFarms() {
  const snap = await farmsRef().orderBy("createdAt", "desc").get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

async function getFarm(id) {
  const doc = await farmsRef().doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
}

async function addFarm(farm) {
  const payload = {
    ...farm,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  };
  const ref = await farmsRef().add(payload);
  return ref.id;
}

async function updateFarm(id, updates) {
  await farmsRef().doc(id).update({
    ...updates,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  });
}

async function deleteFarm(id) {
  await farmsRef().doc(id).delete();
}

/* ------------------------------------------------------------
   Preset seeding — safe to run repeatedly. Checks by farm NAME
   before adding, so re-running never creates duplicates.
   NOTE (see security-rules note in the assistant's reply): under
   the proposed rules, creating a preset:true/source:'preset' doc
   requires an admin-role fd_users profile. Run this once, signed
   in as an account you've manually flagged as admin in the
   Firebase console — see the rules note for why.
------------------------------------------------------------ */
async function seedPresetFarms(presetList) {
  const list = presetList || (typeof PRESET_FARMS !== "undefined" ? PRESET_FARMS : []);
  const results = { added: [], skipped: [], failed: [] };
  for (const farm of list) {
    try {
      const existing = await farmsRef().where("name", "==", farm.name).limit(1).get();
      if (!existing.empty) {
        results.skipped.push(farm.name);
        continue;
      }
      await addFarm(farm);
      results.added.push(farm.name);
    } catch (e) {
      console.error("seedPresetFarms failed for", farm.name, e);
      results.failed.push({ name: farm.name, error: e.message });
    }
  }
  return results;
}
