// engine/hash.js
// Tiny deterministic hash → [0,1) noise from (seed, cx, cy)
function xorshift32(n) {
  n ^= n << 13;
  n ^= n >>> 17;
  n ^= n << 5;
  return n >>> 0;
}
export function rand01(seed, cx, cy, salt = 0) {
  // Pack into a 32-bit value in a stable way
  let h = (seed | 0) ^ ((cx * 374761393) | 0) ^ ((cy * 668265263) | 0) ^ ((salt * 2246822519) | 0);
  return xorshift32(h) / 0x100000000; // [0,1)
}
