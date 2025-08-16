// engine/gridgen.js
// Instead of noise threshold, fill chunk grid by replaying blobs from rockfield.

import { blobsInAABB } from './rockfield.js';

export function generateRockGrid({ seed, cx, cy, gridRes, cfg }) {
  const grid = new Uint8Array(gridRes * gridRes);

  // Chunk world-space AABB in cell coords
  const minX = cx * gridRes;
  const minY = cy * gridRes;
  const maxX = minX + gridRes - 1;
  const maxY = minY + gridRes - 1;

  const blobs = blobsInAABB(seed, cfg, { minX, minY, maxX, maxY });

  for (const blob of blobs) {
    for (const cell of blob.cells) {
      const [wx, wy] = cell.split(',').map(Number);
      if (wx < minX || wy < minY || wx > maxX || wy > maxY) continue;

      const gx = wx - minX;
      const gy = wy - minY;
      grid[gy*gridRes + gx] = 1;
    }
  }

  return grid;
}
