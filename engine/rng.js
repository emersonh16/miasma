// engine/rng.js — deterministic helpers (seed + coords -> numbers)
function xorshift32(n) {
  n ^= n << 13; n ^= n >>> 17; n ^= n << 5;
  return n >>> 0;
}
export function rand01(seed, cx, cy, salt = 0) {
  let h = (seed|0) ^ ((cx*374761393)|0) ^ ((cy*668265263)|0) ^ ((salt*2246822519)|0);
  return xorshift32(h) / 0x100000000; // [0,1)
}
