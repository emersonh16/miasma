// ui/devhud.js — the director's little monitor (draws on canvas)
// Shows FPS, mounted chunk count, remembered diffs count (if diffstore present)

import { count as mountedCount } from '../engine/chunkreg.js';
import { size as diffstoreSize } from '../engine/diffstore.js';

export function init(state) {
  state.devhud = { fps: 0, _acc: 0, _frames: 0 };
}

export function update(state, dt) {
  const h = state.devhud;
  h._acc += dt; h._frames++;
  if (h._acc >= 0.5) { // update twice a second
    h.fps = Math.round(h._frames / h._acc);
    h._acc = 0; h._frames = 0;
  }
}

export function draw(ctx, state) {
  const mounted    = mountedCount(state);
  const remembered = diffstoreSize ? diffstoreSize(state) : 0;

  ctx.save();
  ctx.font = '12px monospace';
  ctx.fillStyle = 'rgba(240,245,255,0.9)';
  ctx.fillText(`FPS: ${state.devhud.fps}`, 10, 18);
  ctx.fillText(`Mounted: ${mounted}`, 10, 34);
  ctx.fillText(`Remembered: ${remembered}`, 10, 50);
  ctx.restore();
}
