// systems/rocks.js
// Pixel-grid rocks (Noita-style), deterministic from global blob field.
// Each mounted chunk gets a 0/1 grid slice. Draws chunky rock pixels.
// Exposes isSolid(x,y) so the player can’t walk through rocks.
// Respects state.safezones so the player (and others) always have clear space.

import { keys as mountedKeys } from '../engine/chunkreg.js';
import { generateRockGrid } from '../engine/gridgen.js';
import { worldToLocal, chunkIndex } from '../engine/chunk.js';

export function init(state, cfg) {
  state.rocks = {
    seed: cfg.world.seed,
    gridRes: cfg.rocks.gridRes,   // cells per chunk side (e.g., 64)
    fill:   cfg.rocks.fill ?? '#4b3a57',
    stroke: cfg.rocks.stroke ?? '#7a5f90',
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
    if (!grid) continue;

    ctx.fillStyle = state.rocks.fill;

    for (let gy = 0; gy < R; gy++) {
      const wy = cy * cs + gy * cellW;
      const sy = wy - top;
      for (let gx = 0; gx < R; gx++) {
        const idx = gy * R + gx;
        if (!grid[idx]) continue;

        const wx = cx * cs + gx * cellW;
        const sx = wx - left;

        ctx.fillRect(sx, sy, cellW, cellW);
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
  if (!grid) {
    grid = generateRockGrid({
      seed: state.rocks.seed,
      cx, cy,
      gridRes: state.rocks.gridRes,
      cfg: state.rocks.cfg
    });
    state.rocks.byChunk.set(key, grid);
  }

  // Always apply safezones, even if the grid already existed
  if (state.safezones && state.safezones.length) {
    applySafezones(state, grid, cx, cy);
  }

  return grid;
}

function applySafezones(state, grid, cx, cy) {
  const cs = state.world.chunkSize;
  const R  = state.rocks.gridRes;
  const cellW = cs / R;

  const left   = cx * cs;
  const top    = cy * cs;
  const right  = left + cs;
  const bottom = top + cs;


  for (const zone of state.safezones) {
    const { x: zx, y: zy, r } = zone;
      // Skip if the zone does not intersect this chunk at all
    if (zx + r <= left || zx - r >= right || zy + r <= top || zy - r >= bottom) {
      continue;
    }

    // Zone center relative to this chunk
    const lx = zx - left;
    const ly = zy - top;
    const gxC = Math.floor(lx / cellW);
    const gyC = Math.floor(ly / cellW);
    const cellsR = Math.ceil(r / cellW);

    for (let gy = gyC - cellsR; gy <= gyC + cellsR; gy++) {
      for (let gx = gxC - cellsR; gx <= gxC + cellsR; gx++) {
        if (gx < 0 || gy < 0 || gx >= R || gy >= R) continue;
        const dx = (gx - gxC) * cellW;
        const dy = (gy - gyC) * cellW;
        if (dx * dx + dy * dy <= r * r) {
          grid[gy * R + gx] = 0; // carve open
        }
      }
    }
  }
}
