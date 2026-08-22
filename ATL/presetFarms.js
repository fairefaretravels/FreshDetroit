/* ============================================================
   data/presetFarms.js
   Starter/demo farm records for FRESH ATL.
   This is SEED DATA ONLY — Firestore is the source of truth once
   seeded (see firebase/farms.js → seedPresetFarms()). Edit this
   array to add/replace/expand what gets offered for seeding; it
   does not get read directly by any page.
   Loaded as a plain global (no bundler in this project — see the
   note in the assistant's reply about the actual project stack).
============================================================ */
const PRESET_FARMS = [
  {
    name: "Westside Community Farm",
    type: "community",
    status: "active",
    source: "preset",
    preset: true,
    address: "Atlanta, GA",
    latitude: 33.755,
    longitude: -84.42,
    farmSize: "0.5 acres",
    crops: ["Tomatoes", "Collard Greens", "Peppers", "Lettuce"],
    services: ["Food Distribution", "Community Garden", "Produce Sales"],
    seasonStart: "April",
    seasonEnd: "October",
    imageUrl: ""
  },
  {
    name: "Fresh ATL Urban Farm",
    type: "urban",
    status: "active",
    source: "preset",
    preset: true,
    address: "Atlanta, GA",
    latitude: 33.748,
    longitude: -84.391,
    farmSize: "1 acre",
    crops: ["Greens", "Herbs", "Peppers"],
    services: ["Produce Sales", "Food Distribution"],
    seasonStart: "April",
    seasonEnd: "November",
    imageUrl: ""
  },
  {
    name: "Atlanta School Garden",
    type: "school",
    status: "active",
    source: "preset",
    preset: true,
    address: "Atlanta, GA",
    latitude: 33.765,
    longitude: -84.37,
    farmSize: "0.25 acres",
    crops: ["Carrots", "Lettuce", "Tomatoes"],
    services: ["Education", "Community Garden", "Food Distribution"],
    seasonStart: "April",
    seasonEnd: "October",
    imageUrl: ""
  }
];

// Supported farm types today — kept as a plain array so the Add Farm
// form and any future filter UI read from one place. Add more later
// (e.g. "backyard", "demonstration") without touching component code.
const FARM_TYPES = ["urban", "community", "school", "backyard", "demonstration"];
