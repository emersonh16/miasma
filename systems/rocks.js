// systems/rocks.js
// Pixel-grid rocks (Noita-style), deterministic from global blob field.
// Each mounted chunk gets a 0/1 grid slice. Draws chunky rock pixels.
// Exposes isSolid(x,y) so the player can’t walk through rocks.

import { keys as mountedKeys } from '../engine/chunkreg.js';
import { generateRockGrid } from '../engine/gridgen.js';
import { worldToLocal, chunkIndex } from '../engine/chunk.js';

export function init(state, cfg) {
  state.rocks = {
    seed: cfg.world.seed,
    gridRes: cfg.rocks.gridRes,   // cells per chunk side (e.g., 64)
    fill:   cfg.rocks.fill,
    stroke: cfg.rocks.stroke,
    cfg:    cfg.rocks,            // full rocks config (with boulders/walls)
    byChunk: new Map()            // key "cx,cy" -> Uint8Array (gridRes*gridRes)
  };
}

export function update(/*state, dt*/) {
  // No simulation yet; carving & diffs come later.
}

export function draw(ctx, state, view) {
  const cs = state.world.chunkSize;
  const R  = state.rocks.gridRes;
  const cellW = cs / R; // world-units per grid cell

  const left = state.camera.x - view.w * 0.5;
  const top  = state.camera.y - view.h * 0.5;

  for (const k of mountedKeys(state)) {
    const [cx, cy] = k.split(',').map(Number);
    const grid = ensureGrid(state, cx, cy);

    ctx.fillStyle = state.rocks.fill;
    ctx.strokeStyle = state.rocks.stroke;
    ctx.lineWidth = 1;

    for (let gy = 0; gy < R; gy++) {
      for (let gx = 0; gx < R; gx++) {
        const idx = gy * R + gx;
        if (!grid[idx]) continue;

        // World coords of this cell
        const wx = cx * cs + gx * cellW;
        const wy = cy * cs + gy * cellW;

        // Screen coords
        const sx = wx - left;
        const sy = wy - top;

        ctx.fillRect(sx, sy, cellW, cellW);
        // optional stroke for sharper edges:
        // ctx.strokeRect(Math.floor(sx)+0.5, Math.floor(sy)+0.5, Math.ceil(cellW)-1, Math.ceil(cellW)-1);
      }
    }
  }
}

// Query: is this world position solid rock?
export function isSolid(state, x, y) {
  const cs = state.world.chunkSize;
  const R  = state.rocks.gridRes;
  const cx = chunkIndex(x, cs);
  const cy = chunkIndex(y, cs);

  const grid = ensureGrid(state, cx, cy);
  if (!grid) return false;

  const { lx, ly } = worldToLocal(x, y, cs);
  const cellW = cs / R;
  const gx = Math.floor(lx / cellW);
  const gy = Math.floor(ly / cellW);

  if (gx < 0 || gy < 0 || gx >= R || gy >= R) return false;
  const idx = gy * R + gx;
  return grid[idx] === 1;
}

// --- helpers ----------------------------------------------------

function ensureGrid(state, cx, cy) {
  const key = `${cx},${cy}`;
  let grid = state.rocks.byChunk.get(key);
  if (grid) return grid;

  grid = generateRockGrid({
    seed: state.rocks.seed,
    cx, cy,
    gridRes: state.rocks.gridRes,
    cfg: state.rocks.cfg   // <-- FIX: pass full rocks config (with boulders/walls)
  });

  state.rocks.byChunk.set(key, grid);
  return grid;
}
