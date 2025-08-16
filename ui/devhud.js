// ui/devhud.js — top-right HUD with FPS, mounted, visited, remembered
import { count as mountedCount, unique as visitedCount } from '../engine/chunkreg.js';
import { size as diffstoreSize } from '../engine/diffstore.js';

export function init(state) {
  state.devhud = { fps: 0, _acc: 0, _frames: 0 };
}

export function update(state, dt) {
  const h = state.devhud;
  h._acc += dt; h._frames++;
  if (h._acc >= 0.5) {
    h.fps = Math.round(h._frames / h._acc);
    h._acc = 0; h._frames = 0;
  }
}

export function draw(ctx, state) {
  const mounted    = mountedCount(state);
  const visited    = visitedCount(state);
  const remembered = diffstoreSize ? diffstoreSize(state) : 0;

  const x = state.view.w - 10; // top-right
  let y = 10;

  ctx.save();
  ctx.font = '12px monospace';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'top';
  ctx.fillStyle = 'rgba(240,245,255,0.9)';
  ctx.fillText(`FPS: ${state.devhud.fps}`, x, y); y += 16;
  ctx.fillText(`Mounted: ${mounted}`,       x, y); y += 16;
  ctx.fillText(`Visited: ${visited}`,       x, y); y += 16;
  ctx.fillText(`Remembered: ${remembered}`, x, y);
  ctx.restore();
}
