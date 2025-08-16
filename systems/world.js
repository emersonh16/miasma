// systems/world.js
// Paint crew: draws mounted chunks (checkerboard + labels).
// Holds lightweight per-chunk memory map for future diffs.

import { chunkKey } from '../engine/chunk.js';
import { rand01 } from '../engine/rng.js';

export function init(state, cfg) {
  state.world = {
    chunkSize:  cfg.world.chunkSize,
    seed:       cfg.world.seed,
    showChunkLabels: cfg.world.showChunkLabels,
    // Memory index for future diffs (e.g., fog cleared, rocks removed, etc.)
    chunks: new Map(), // key -> { visited: bool }
  };
}

export function update(/*state, dt*/) {
  // World itself doesn’t decide mounts; streamer does.
}

export function draw(ctx, state, view) {
  const cs = state.world.chunkSize;
  const left = state.camera.x - view.w * 0.5;
  const top  = state.camera.y - view.h * 0.5;

  // Draw exactly what the streamer mounted (single source of truth)
  for (const k of state.streamer.mounted) {
    const [cx, cy] = k.split(',').map(Number);
    const x = cx * cs - left;
    const y = cy * cs - top;

    // ensure memory record exists
    let rec = state.world.chunks.get(k);
    if (!rec) { rec = { visited: false }; state.world.chunks.set(k, rec); }

    // Checkerboard tint
    const dark = ((cx + cy) & 1) === 0;
    ctx.fillStyle = rec.visited
      ? (dark ? 'rgba(140, 180, 220, 0.10)' : 'rgba(160, 200, 240, 0.08)')
      : (dark ? 'rgba(90, 110, 150, 0.12)'  : 'rgba(180, 200, 240, 0.08)');
    ctx.fillRect(x, y, cs, cs);

    // Border
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, y + 0.5, cs - 1, cs - 1);

    // Optional label
    if (state.world.showChunkLabels) {
      ctx.fillStyle = 'rgba(230,240,255,0.8)';
      ctx.font = '12px monospace';
      ctx.fillText(`(${cx}, ${cy})`, x + 6, y + 16);
    }

    rec.visited = true;
  }
}
