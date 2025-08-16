// engine/rockfield.js
// Global blob growth field — blobs are seeded in world space
// and can spill across multiple chunks naturally.

import { rand01 } from './rng.js';

// Helper for stable randoms
function rng(seed, x, y, salt = 0) {
  return rand01(seed, x, y, salt);
}

// Main: get all blobs overlapping (or near) an AABB in WORLD CELL coordinates
export function blobsInAABB(seed, cfg, aabb) {
  const { minX, minY, maxX, maxY } = aabb;
  const results = [];

  // Spacing between potential blob origins (world cells).
  // Smaller = more origins (denser), larger = fewer (sparser).
  const ORIGIN_STEP = 64;

  // Compute origin-cell bounds that cover the AABB, with a small margin
  const cx0 = Math.floor(minX / ORIGIN_STEP);
  const cy0 = Math.floor(minY / ORIGIN_STEP);
  const cx1 = Math.floor(maxX / ORIGIN_STEP);
  const cy1 = Math.floor(maxY / ORIGIN_STEP);

  // IMPORTANT: iterate cy over [cy0..cy1], cx over [cx0..cx1]
  for (let cy = cy0 - 2; cy <= cy1 + 2; cy++) {
    for (let cx = cx0 - 2; cx <= cx1 + 2; cx++) {
      // Deterministic roll for whether to spawn here
      const roll = rng(seed, cx, cy, 100);

      let typeKey = null; // matches config keys exactly ("boulders" / "walls")
      if (roll < cfg.boulders.spawnProb) typeKey = 'boulders';
      else if (roll < cfg.boulders.spawnProb + cfg.walls.spawnProb) typeKey = 'walls';
      if (!typeKey) continue;

      // Blob origin in world-cell coordinates (jitter inside the origin cell)
      const originX = cx * ORIGIN_STEP + Math.floor(rng(seed, cx, cy, 200) * ORIGIN_STEP);
      const originY = cy * ORIGIN_STEP + Math.floor(rng(seed, cx, cy, 201) * ORIGIN_STEP);

      // Random size (steps) from config
      const sizeMin = cfg[typeKey].sizeMin;
      const sizeMax = cfg[typeKey].sizeMax;
      const steps = sizeMin + Math.floor(rng(seed, cx, cy, 300) * Math.max(0, sizeMax - sizeMin));

      // Grow blob and collect its cells
      const cells = growBlob(seed, originX, originY, steps);

      results.push({ id: `${typeKey}@${cx},${cy}`, type: typeKey, cells });
    }
  }

  return results;
}

// Random-walk growth of a blob from (ox, oy)
function growBlob(seed, ox, oy, steps) {
  const cells = new Set();
  let frontier = [[ox, oy]];
  cells.add(key(ox, oy));

  for (let i = 0; i < steps; i++) {
    if (frontier.length === 0) break;

    // Pick a frontier cell deterministically
    const pick = Math.floor(rng(seed, ox + i, oy - i, i) * frontier.length);
    const [x, y] = frontier[pick];

    // 4-neighbor growth
    const dirs = [[1,0], [-1,0], [0,1], [0,-1]];
    const dpick = Math.floor(rng(seed, x, y, i + 1000) * dirs.length);
    const [dx, dy] = dirs[dpick];
    const nx = x + dx, ny = y + dy;

    const k = key(nx, ny);
    if (!cells.has(k)) {
      cells.add(k);
      frontier.push([nx, ny]);
    }
  }

  return cells;
}

function key(x, y) {
  return `${x},${y}`;
}
