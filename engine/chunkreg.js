// engine/chunkreg.js
import { on } from './eventbus.js';

export function init(state) {
  state.chunkreg = {
    mounted: new Set(),
    visited: new Set() // tracks every chunk we've ever mounted
  };

  on(state, 'chunk:mount', ({ key }) => {
    state.chunkreg.mounted.add(key);
    state.chunkreg.visited.add(key); // mark as seen once
  });

  on(state, 'chunk:unmount', ({ key }) => {
    state.chunkreg.mounted.delete(key);
  });
}

// Helpers
export const keys   = (state) => state.chunkreg.mounted;
export const has    = (state, key) => state.chunkreg.mounted.has(key);
export const count  = (state) => state.chunkreg.mounted.size;
export const unique = (state) => state.chunkreg.visited.size; // <-- this is the missing export
