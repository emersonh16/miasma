// engine/diffstore.js
// Purpose: tiny, generic per-chunk memory store for persistent changes.
// Works for *anything* (rocks broken, loot opened, notes, etc.).
// API is intentionally small and open-ended.

export function init(state, opts = {}) {
  state.diffstore = {
    max: opts.max ?? 200,      // soft cap on remembered chunks
    map: new Map(),            // key -> { lastSeen:number, data:object }
  };
}

// Get (and create if missing) the data object for a chunk key (e.g., "cx,cy")
export function ensure(state, key) {
  const ds = state.diffstore;
  let rec = ds.map.get(key);
  if (!rec) {
    rec = { lastSeen: 0, data: {} };
    ds.map.set(key, rec);
    pruneIfNeeded(state);
  }
  rec.lastSeen = (state.time || 0);
  return rec.data;
}

// Peek without creating
export function get(state, key) {
  const rec = state.diffstore.map.get(key);
  return rec ? rec.data : undefined;
}

// Replace entire data object for a key (rare)
export function set(state, key, data) {
  state.diffstore.map.set(key, { lastSeen: (state.time || 0), data });
  pruneIfNeeded(state);
  return data;
}

// Delete a key entirely
export function del(state, key) {
  state.diffstore.map.delete(key);
}

// Clear everything
export function clearAll(state) {
  state.diffstore.map.clear();
}

// Utilities to help keep values tidy -----------------------------

// Set a field (e.g., setField(key, 'removedRockIds', []))
export function setField(state, key, field, value) {
  const d = ensure(state, key);
  d[field] = value;
  return d[field];
}

// Add string id to a Set-like array field (stored as array for JSON-friendliness)
export function addToList(state, key, field, id) {
  const d = ensure(state, key);
  if (!Array.isArray(d[field])) d[field] = [];
  if (!d[field].includes(id)) d[field].push(id);
  return d[field];
}

// Remove string id from list field
export function removeFromList(state, key, field, id) {
  const d = ensure(state, key);
  if (!Array.isArray(d[field])) return d[field] = [];
  d[field] = d[field].filter(x => x !== id);
  return d[field];
}

// Toggle boolean field
export function toggle(state, key, field) {
  const d = ensure(state, key);
  d[field] = !d[field];
  return d[field];
}

// Intentionally simple LRU-style prune by farthest/oldest
function pruneIfNeeded(state) {
  const ds = state.diffstore;
  if (ds.map.size <= ds.max) return;

  // Sort keys by lastSeen ascending (oldest first)
  const arr = Array.from(ds.map.entries());
  arr.sort((a, b) => a[1].lastSeen - b[1].lastSeen);

  // Remove oldest until within cap
  const toRemove = ds.map.size - ds.max;
  for (let i = 0; i < toRemove; i++) {
    ds.map.delete(arr[i][0]);
  }
}

// For DevHUD/debug
export function size(state) {
  return state.diffstore.map.size;
}
