/* ============================================================
   components/farm-card.js
   Plain rendering functions (this project has no React/JSX —
   see the assistant's note on project stack). These play the
   same role FarmCard.jsx / FarmDetails.jsx would: given a farm
   object, return HTML. They don't fetch data themselves.
============================================================ */

const FARM_TYPE_EMOJI = {
  urban: "🏙️", community: "🤝", school: "🏫", backyard: "🏡", demonstration: "🔬"
};

// Graceful placeholder when imageUrl is empty — branded, not an error state.
function farmImageHTML(farm) {
  if (farm.imageUrl) {
    return `<img src="${farm.imageUrl}" alt="${farm.name}" style="width:100%; height:100%; object-fit:cover;" onerror="this.parentElement.innerHTML=farmPlaceholderHTML('${(farm.type||'').replace(/'/g,"")}');">`;
  }
  return farmPlaceholderHTML(farm.type);
}
function farmPlaceholderHTML(type) {
  return `<div style="width:100%; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:4px; background:linear-gradient(160deg, var(--card-2), var(--forest-2));">
    <div style="font-size:30px;">${FARM_TYPE_EMOJI[type] || "🌱"}</div>
    <div style="font-family:var(--font-mono); font-size:9px; letter-spacing:1px; color:var(--muted); text-transform:uppercase;">Fresh ATL</div>
  </div>`;
}

function farmCardHTML(farm) {
  return `<div class="card listing-row" onclick="openFarmDetails('${farm.id}')" style="align-items:stretch;">
    <div class="listing-thumb" style="overflow:hidden;">${farmImageHTML(farm)}</div>
    <div class="listing-info">
      <div class="listing-title">${farm.name}${farm.preset ? ` <span class="tag tag-sell" style="vertical-align:middle;">Preset</span>` : ""}</div>
      <div class="listing-sub">${(FARM_TYPE_EMOJI[farm.type]||"🌱")} ${cap(farm.type)} · ${farm.address||"Atlanta, GA"}</div>
      <div class="listing-sub">${farm.farmSize||"—"} · ${(farm.crops||[]).slice(0,3).join(", ")}${(farm.crops||[]).length>3?"…":""}</div>
    </div>
    <span class="status-pill ${farm.status==='active'?'status-growing':'status-seedling'}" style="align-self:flex-start; margin-top:4px;">${cap(farm.status||'unknown')}</span>
  </div>`;
}

function farmDetailsHTML(farm) {
  return `
    <div class="listing-hero" style="overflow:hidden; padding:0;">${farmImageHTML(farm)}</div>
    <div class="detail-title">${farm.name}</div>
    <div style="color:var(--muted); font-size:13px; margin-bottom:10px;">${(FARM_TYPE_EMOJI[farm.type]||"🌱")} ${cap(farm.type)} farm${farm.preset?" · Preset / demo record":""}</div>
    <div class="detail-row"><span>Status</span><span>${cap(farm.status||"—")}</span></div>
    <div class="detail-row"><span>Location</span><span>${farm.address||"Atlanta, GA"}</span></div>
    <div class="detail-row"><span>Coordinates</span><span class="mono">${farm.latitude!=null?farm.latitude.toFixed(4):"—"}, ${farm.longitude!=null?farm.longitude.toFixed(4):"—"}</span></div>
    <div class="detail-row"><span>Farm size</span><span>${farm.farmSize||"—"}</span></div>
    <div class="detail-row"><span>Growing season</span><span>${farm.seasonStart||"—"} – ${farm.seasonEnd||"—"}</span></div>
    <div class="detail-row"><span>Crops</span><span style="text-align:right; max-width:60%;">${(farm.crops||[]).join(", ")||"—"}</span></div>
    <div class="detail-row"><span>Services</span><span style="text-align:right; max-width:60%;">${(farm.services||[]).join(", ")||"—"}</span></div>
  `;
}

function cap(s){ return s ? s.charAt(0).toUpperCase()+s.slice(1) : s; }
