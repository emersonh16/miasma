// engine/gridgen.js
// Generate a per-chunk binary rock grid by sampling blobs from rockfield.

import { blobsForChunk } from './rockfield.js';

// Generate grid for one chunk
export function generateRockGrid({ seed, cx, cy, gridRes, cfg }) {
  const grid = new Uint8Array(gridRes * gridRes);

  // Build this chunk’s bounding box in world-cell coords
  const minX = cx * gridRes;
  const minY = cy * gridRes;
  const maxX = minX + gridRes - 1;
  const maxY = minY + gridRes - 1;
  const aabb = { minX, minY, maxX, maxY };

  // Get blobs that overlap this chunk
  const blobs = blobsForChunk(seed, cfg, aabb);

  for (const blob of blobs) {
    for (const k of blob.cells) {
      const [wx, wy] = k.split(',').map(Number);

      // Convert world-cell coords to local grid coords
      const gx = wx - minX;
      const gy = wy - minY;

      if (gx >= 0 && gx < gridRes && gy >= 0 && gy < gridRes) {
        grid[gy * gridRes + gx] = 1;
      }
    }
  }

  return grid;
}
