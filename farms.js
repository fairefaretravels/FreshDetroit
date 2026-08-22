/* ============================================================
   pages/farms.js
   Page-level wiring for the Farms section: loading/empty/error
   states, list rendering, details sheet, and the add-farm form.
   Plays the role Farms.jsx / FarmDetails.jsx / AddFarm.jsx would
   in a React build — see the assistant's stack note.
============================================================ */

let farmsState = { list: [], loading: true, error: null };

async function renderFarmsPage() {
  const el = document.getElementById("farmsList");
  if (!el) return;

  if (!firebaseReady) {
    el.innerHTML = emptyState("🌾", "Connect Firebase to load farms.");
    return;
  }

  farmsState.loading = true; farmsState.error = null;
  el.innerHTML = `<div class="empty-state"><div class="e-emoji">🌾</div><div>Loading farms…</div></div>`;

  try {
    farmsState.list = await getFarms();
    farmsState.loading = false;
  } catch (e) {
    console.error("renderFarmsPage failed:", e);
    farmsState.loading = false;
    farmsState.error = e.message;
    el.innerHTML = emptyState("⚠️", "Couldn't load farms — check your connection or Firestore rules.");
    return;
  }

  if (!farmsState.list.length) {
    el.innerHTML = emptyState("🌾", "No farms yet. Seed the presets or add your own.");
    return;
  }
  el.innerHTML = farmsState.list.map(farmCardHTML).join("");
}

async function openFarmDetails(id) {
  const cached = farmsState.list.find(f => f.id === id);
  document.getElementById("listingSheetBody").innerHTML = cached
    ? farmDetailsHTML(cached)
    : `<div class="empty-state"><div class="e-emoji">🌾</div><div>Loading…</div></div>`;
  openSheet("listingSheet");
  if (!cached) {
    try {
      const farm = await getFarm(id);
      if (farm) document.getElementById("listingSheetBody").innerHTML = farmDetailsHTML(farm);
    } catch (e) {
      console.error("openFarmDetails failed:", e);
      document.getElementById("listingSheetBody").innerHTML = emptyState("⚠️", "Couldn't load this farm.");
    }
  }
}

/* ---------------- ADD FARM (foundation form) ---------------- */
function openAddFarm() {
  const typeOptions = FARM_TYPES.map(t => `<option value="${t}">${cap(t)}</option>`).join("");
  document.getElementById("postSheetBody").innerHTML = `
    <div style="font-family:var(--font-display); font-size:19px; font-weight:600; margin-bottom:4px;">Add a farm</div>
    <div style="font-size:12.5px; color:var(--muted); margin-bottom:18px;">Foundation form — every farm submitted here is stored as source: "user".</div>
    <div class="field"><label>Farm name</label><input id="af_name" placeholder="e.g. Maple Street Urban Garden"></div>
    <div class="field"><label>Farm type</label><select id="af_type">${typeOptions}</select></div>
    <div class="field"><label>Address</label><input id="af_address" placeholder="Detroit, MI"></div>
    <div class="field"><label>Latitude</label><input id="af_lat" type="number" step="0.0001" placeholder="42.35"></div>
    <div class="field"><label>Longitude</label><input id="af_lng" type="number" step="0.0001" placeholder="-83.05"></div>
    <div class="field"><label>Farm size</label><input id="af_size" placeholder="e.g. 0.5 acres"></div>
    <div class="field"><label>Crops (comma separated)</label><input id="af_crops" placeholder="Tomatoes, Peppers, Basil"></div>
    <div class="field"><label>Services (comma separated)</label><input id="af_services" placeholder="Produce Sales, Food Distribution"></div>
    <div class="field"><label>Season start</label><input id="af_seasonStart" placeholder="April"></div>
    <div class="field"><label>Season end</label><input id="af_seasonEnd" placeholder="October"></div>
    <div class="field"><label>Image URL (optional)</label><input id="af_imageUrl" placeholder="https://…"></div>
    <button class="btn btn-primary btn-block" onclick="submitAddFarm()">Add Farm</button>
  `;
  openSheet("postSheet");
}

async function submitAddFarm() {
  const name = document.getElementById("af_name").value.trim();
  if (!name) { showToast("Give the farm a name"); return; }
  if (!firebaseReady) { showToast("Connect Firebase to add a farm"); return; }
  if (!state.uid) { showToast("Still connecting — try again in a moment"); return; }

  const farm = {
    name,
    type: document.getElementById("af_type").value,
    status: "active",
    source: "user",
    preset: false,
    createdByUid: state.uid,
    address: document.getElementById("af_address").value.trim() || "Detroit, MI",
    latitude: parseFloat(document.getElementById("af_lat").value) || null,
    longitude: parseFloat(document.getElementById("af_lng").value) || null,
    farmSize: document.getElementById("af_size").value.trim(),
    crops: document.getElementById("af_crops").value.split(",").map(s=>s.trim()).filter(Boolean),
    services: document.getElementById("af_services").value.split(",").map(s=>s.trim()).filter(Boolean),
    seasonStart: document.getElementById("af_seasonStart").value.trim(),
    seasonEnd: document.getElementById("af_seasonEnd").value.trim(),
    imageUrl: document.getElementById("af_imageUrl").value.trim()
  };

  try {
    await addFarm(farm);
    closeSheet("postSheet");
    showToast(`${name} added ✓`);
    renderFarmsPage();
  } catch (e) {
    console.error("submitAddFarm failed:", e);
    showToast("Couldn't add that farm — try again");
  }
}
