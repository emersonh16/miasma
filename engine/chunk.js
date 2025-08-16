// engine/chunk.js
// Purpose: math helpers for chunked infinite world.
// Inputs: world coords (x,y), chunkSize.
// Outputs: chunk indices (cx,cy), keys, and local coords.
// Deterministic, stateless, safe to use anywhere.

export const chunkIndex = (v, size) => Math.floor(v / size);
export const chunkKey   = (cx, cy) => `${cx},${cy}`;

// World (x,y) -> (cx, cy) chunk indices
export function worldToChunk(x, y, size) {
  return {
    cx: chunkIndex(x, size),
    cy: chunkIndex(y, size)
  };
}

// World (x,y) -> local coords inside its chunk [0, size)
export function worldToLocal(x, y, size) {
  const cx = chunkIndex(x, size);
  const cy = chunkIndex(y, size);
  return {
    lx: x - cx * size,
    ly: y - cy * size,
    cx, cy
  };
}

// Top-left world origin of a chunk
export function chunkOrigin(cx, cy, size) {
  return { x: cx * size, y: cy * size };
}
