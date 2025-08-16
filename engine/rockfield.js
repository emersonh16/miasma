// engine/rockfield.js
// Global blob growth field — returns set of blobs covering a given world area.

import { rand01 } from './rng.js';

// Deterministic helper: roll dice the same way every run
function rng(seed, x, y, salt=0) {
  return rand01(seed, x, y, salt);
}

// Each origin cell can spawn a blob (boulder or wall)
export function blobsInAABB(seed, cfg, aabb) {
  const { minX, minY, maxX, maxY } = aabb;
  const results = [];

  // World-space step: every N cells we check for possible blob origin
  const ORIGIN_STEP = 32; // tune: controls spacing of possible blob starts
  const cx0 = Math.floor(minX / ORIGIN_STEP);
  const cy0 = Math.floor(minY / ORIGIN_STEP);
  const cx1 = Math.floor(maxX / ORIGIN_STEP);
  const cy1 = Math.floor(maxY / ORIGIN_STEP);

  for (let cy = cy0; cy <= cy1; cy++) {
    for (let cx = cx0; cx <= cx1; cx++) {
      const roll = rng(seed, cx, cy, 100);
      let type = null;
      if (roll < cfg.boulders.spawnProb) type = 'boulder';
      else if (roll < cfg.boulders.spawnProb + cfg.walls.spawnProb) type = 'wall';
      if (!type) continue;

      const originX = cx * ORIGIN_STEP + Math.floor(rng(seed, cx, cy, 200) * ORIGIN_STEP);
      const originY = cy * ORIGIN_STEP + Math.floor(rng(seed, cx, cy, 201) * ORIGIN_STEP);

      const sizeMin = cfg[type].sizeMin;
      const sizeMax = cfg[type].sizeMax;
      const steps = sizeMin + Math.floor(rng(seed, cx, cy, 300) * (sizeMax - sizeMin));

      // Grow the blob
      const cells = growBlob(seed, originX, originY, steps);

      results.push({ id: `${type}@${cx},${cy}`, type, cells });
    }
  }
  return results;
}

// Random walk growth
function growBlob(seed, ox, oy, steps) {
  const cells = new Set();
  let frontier = [[ox, oy]];
  cells.add(key(ox, oy));

  for (let i = 0; i < steps; i++) {
    if (frontier.length === 0) break;
    const [x, y] = frontier[Math.floor(rand01(seed, ox+i, oy-i, i) * frontier.length)];

    // pick random neighbor
    const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
    const [dx, dy] = dirs[Math.floor(rand01(seed, x, y, i+1000) * dirs.length)];
    const nx = x + dx, ny = y + dy;
    const k = key(nx, ny);
    if (!cells.has(k)) {
      cells.add(k);
      frontier.push([nx, ny]);
    }
  }

  return cells;
}

function key(x,y) { return `${x},${y}`; }
