// engine/rockfield.js
// Nucleus-based rock blobs (boulders, walls) with caching.
// Optimized: each blob nucleus is generated once, then reused across chunks.

import { rand01 } from './rng.js';

function rng(seed, x, y, salt = 0) {
  return rand01(seed, x, y, salt);
}

// Global blob cache: key = `${seed}:${cx},${cy}`, value = { id, type, cells }
const blobCache = new Map();

/**
 * Get blobs that overlap a single chunk.
 * @param {number} seed - world seed
 * @param {object} cfg  - config.rocks section
 * @param {object} chunkAABB - {minX, minY, maxX, maxY} for this chunk
 */
export function blobsForChunk(seed, cfg, chunkAABB) {
  const results = [];
  const ORIGIN_STEP = 64; // spacing between nuclei

  const { minX, minY, maxX, maxY } = chunkAABB;

  // Figure out which origin cells might influence this chunk
  const cx0 = Math.floor(minX / ORIGIN_STEP);
  const cy0 = Math.floor(minY / ORIGIN_STEP);
  const cx1 = Math.floor(maxX / ORIGIN_STEP);
  const cy1 = Math.floor(maxY / ORIGIN_STEP);

  for (let cy = cy0 - 1; cy <= cy1 + 1; cy++) {
    for (let cx = cx0 - 1; cx <= cx1 + 1; cx++) {
      const cacheKey = `${seed}:${cx},${cy}`;
      let blob = blobCache.get(cacheKey);

      if (!blob) {
        // Roll if this nucleus spawns a blob
        const roll = rng(seed, cx, cy, 100);

        let typeKey = null;
        if (roll < cfg.boulders.spawnProb) typeKey = 'boulders';
        else if (roll < cfg.boulders.spawnProb + cfg.walls.spawnProb) typeKey = 'walls';
        if (!typeKey) continue; // no blob here

        // Blob origin jittered inside ORIGIN_STEP cell
        const originX = cx * ORIGIN_STEP + Math.floor(rng(seed, cx, cy, 200) * ORIGIN_STEP);
        const originY = cy * ORIGIN_STEP + Math.floor(rng(seed, cx, cy, 201) * ORIGIN_STEP);

        // Size range
        const sizeMin = cfg[typeKey].sizeMin;
        const sizeMax = cfg[typeKey].sizeMax;
        const target = sizeMin + Math.floor(rng(seed, cx, cy, 300) * (sizeMax - sizeMin));

        const params = nucleusParamsFor(typeKey, seed, cx, cy);
        const cells = growNucleus(seed, originX, originY, target, params);

        blob = { id: `${typeKey}@${cx},${cy}`, type: typeKey, cells };
        blobCache.set(cacheKey, blob);
      }

      // Only return this blob if it overlaps our chunk AABB
      if (overlaps(blob.cells, chunkAABB)) {
        results.push(blob);
      }
    }
  }

  return results;
}

// ---------------- nucleus growth ----------------

const DIR4 = [[1,0],[-1,0],[0,1],[0,-1]];
const DIAG4 = [[1,1],[1,-1],[-1,1],[-1,-1]];

function growNucleus(seed, ox, oy, targetCount, p) {
  const cells = new Set();
  const frontier = [];

  cells.add(key(ox, oy));
  frontier.push([ox, oy]);

  let t = 0;
  while (cells.size < targetCount && frontier.length) {
    const pick = Math.floor(rng(seed, ox + t, oy - t, t) * frontier.length);
    const [x, y] = frontier[pick];

    const includeDiag = rng(seed, x, y, 1000 + t) < p.diagProb;
    const dirs = includeDiag ? DIR4.concat(DIAG4) : DIR4;

    const dirsSorted = dirs
      .map((d, i) => ({ d, r: rng(seed, x + d[0], y + d[1], 2000 + i + t) }))
      .sort((a, b) => a.r - b.r)
      .map(o => o.d);

    for (const [dx, dy] of dirsSorted) {
      if (cells.size >= targetCount) break;

      const nx = x + dx, ny = y + dy;
      const k = key(nx, ny);
      if (cells.has(k)) continue;

      const neighborFilled = countFilledNeighbors(cells, nx, ny);
      const base = p.fillProb;
      const bias = 1 - Math.pow(1 - p.roundnessBias, neighborFilled);
      const jitter = rng(seed, nx, ny, 3000 + t) * p.noiseJitter;

      const chance = clamp01(base + bias * p.biasWeight + jitter - p.hollowPenalty);
      if (rng(seed, nx, ny, 4000 + t) < chance) {
        cells.add(k);
        frontier.push([nx, ny]);
      }
    }

    if (rng(seed, x, y, 5000 + t) < p.popProb) {
      frontier.splice(pick, 1);
    }

    t++;
    if (t > targetCount * 8) break;
  }

  return cells;
}

function countFilledNeighbors(cells, x, y) {
  let n = 0;
  for (const [dx, dy] of DIR4) {
    if (cells.has(key(x + dx, y + dy))) n++;
  }
  return n;
}

function key(x, y) { return `${x},${y}`; }
function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

function overlaps(cells, aabb) {
  for (const k of cells) {
    const [x, y] = k.split(',').map(Number);
    if (x >= aabb.minX && x <= aabb.maxX &&
        y >= aabb.minY && y <= aabb.maxY) {
      return true;
    }
  }
  return false;
}

// Params per type
function nucleusParamsFor(typeKey, seed, cx, cy) {
  let p = {
    fillProb: 0.18,
    roundnessBias: 0.55,
    biasWeight: 0.55,
    diagProb: 0.25,
    noiseJitter: 0.12,
    hollowPenalty: 0.0,
    popProb: 0.12
  };

  if (typeKey === 'walls') {
    p.fillProb = 0.22;
    p.roundnessBias = 0.65;
    p.biasWeight = 0.6;
    p.diagProb = 0.2;
    p.noiseJitter = 0.1;
    p.hollowPenalty = 0.02;
    p.popProb = 0.1;
  } else if (typeKey === 'boulders') {
    p.fillProb = 0.17;
    p.roundnessBias = 0.6;
    p.biasWeight = 0.5;
    p.diagProb = 0.35;
    p.noiseJitter = 0.14;
    p.hollowPenalty = 0.0;
    p.popProb = 0.14;
  }
  return p;
}
