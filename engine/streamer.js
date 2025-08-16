// engine/streamer.js
// Mount enough chunks to fully cover the screen rectangle (+ a tiny pad).

import { chunkIndex, chunkKey } from './chunk.js';
import { emit } from './eventbus.js';

export function init(state, cfg) {
  state.streamer = {
    mounted: new Set(),
    radius:    cfg.world.streamRadius, // extra rings beyond exact coverage
    chunkSize: cfg.world.chunkSize,
    pad: 1 // chunk padding around the view to avoid edge pop-in
  };
}

export function update(state) {
  const cs = state.streamer.chunkSize;
  const pad = state.streamer.pad;
  const extra = state.streamer.radius;

  // Camera-centered chunk
  const ccx = chunkIndex(state.camera.x, cs);
  const ccy = chunkIndex(state.camera.y, cs);

  // How many chunks do we need to cover the view in each axis?
  const halfChunksX = Math.ceil((state.view.w * 0.5) / cs) + pad + extra;
  const halfChunksY = Math.ceil((state.view.h * 0.5) / cs) + pad + extra;

  // Desired rectangular range
  const startX = ccx - halfChunksX;
  const endX   = ccx + halfChunksX;
  const startY = ccy - halfChunksY;
  const endY   = ccy + halfChunksY;

  const desired = new Set();
  for (let cy = startY; cy <= endY; cy++) {
    for (let cx = startX; cx <= endX; cx++) {
      desired.add(chunkKey(cx, cy));
    }
  }

  // Mount new
  for (const k of desired) {
    if (!state.streamer.mounted.has(k)) {
      state.streamer.mounted.add(k);
      const [cx, cy] = k.split(',').map(Number);
      emit(state, 'chunk:mount', { cx, cy, key: k });
    }
  }

  // Unmount old
  for (const k of [...state.streamer.mounted]) {
    if (!desired.has(k)) {
      state.streamer.mounted.delete(k);
      const [cx, cy] = k.split(',').map(Number);
      emit(state, 'chunk:unmount', { cx, cy, key: k });
    }
  }
}
