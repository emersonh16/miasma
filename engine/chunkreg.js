// engine/chunkreg.js
import { on } from './eventbus.js';

export function init(state) {
  state.chunkreg = { mounted: new Set() };

  on(state, 'chunk:mount', ({ key }) => {
    state.chunkreg.mounted.add(key);
  });

  on(state, 'chunk:unmount', ({ key }) => {
    state.chunkreg.mounted.delete(key);
  });
}

export const keys  = (state) => state.chunkreg.mounted;
export const has   = (state, key) => state.chunkreg.mounted.has(key);
export const count = (state) => state.chunkreg.mounted.size;
