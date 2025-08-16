// systems/player.js
// Player — locked to screen center; WASD moves the world/camera.
// Adds collision against rocks using systems/rocks.isSolid.
//
// API:
//   init(state, config)    // resets player + camera
//   update(state, dt)      // moves camera from input, blocks on rocks
//   draw(ctx, state, view) // draws player at screen center

import { isDown } from '../engine/input.js';
import { isSolid } from './rocks.js';

export function init(state, cfg) {
  state.player = {
    r: cfg.player.radius,
    color: cfg.player.color,
    outline: cfg.player.outline,
    speed: cfg.player.speed
  };

  // Camera/world origin — this moves with input.
  state.camera = { x: 0, y: 0 };
}

export function update(state, dt) {
  const s = state.player.speed;
  const r = state.player.r;

  // Gather input
  let dx = 0, dy = 0;
  if (isDown(state, 'w', 'arrowup'))    dy -= 1;
  if (isDown(state, 's', 'arrowdown'))  dy += 1;
  if (isDown(state, 'a', 'arrowleft'))  dx -= 1;
  if (isDown(state, 'd', 'arrowright')) dx += 1;

  // Normalize diagonals
  if (dx || dy) {
    const len = Math.hypot(dx, dy) || 1;
    dx = (dx / len) * s * dt;
    dy = (dy / len) * s * dt;
  }

  const px = state.camera.x;
  const py = state.camera.y;

  // Axis-separated collision
  if (dx !== 0) {
    if (!hitsRock(state, px + dx, py, r)) {
      state.camera.x += dx;
    }
  }
  if (dy !== 0) {
    if (!hitsRock(state, px, py + dy, r)) {
      state.camera.y += dy;
    }
  }
}

export function draw(ctx, state, view) {
  // Player stays locked at view center.
  const cx = Math.floor(view.w * 0.5) + 0.5;
  const cy = Math.floor(view.h * 0.5) + 0.5;

  ctx.beginPath();
  ctx.arc(cx, cy, state.player.r, 0, Math.PI * 2);
  ctx.fillStyle = state.player.color;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = state.player.outline;
  ctx.stroke();
}

// --- helpers ----------------------------------------------------

// Cheap/sturdy collision check: sample 8 points on the player ring,
// plus a few inner points to prevent corner sneaks.
function hitsRock(state, wx, wy, r) {
  const samples = 8;
  for (let i = 0; i < samples; i++) {
    const a = (i / samples) * Math.PI * 2;
    const sx = wx + Math.cos(a) * r;
    const sy = wy + Math.sin(a) * r;
    if (isSolid(state, sx, sy)) return true;
  }

  // inner checks
  const inner = r * 0.6;
  if (isSolid(state, wx, wy)) return true;
  if (isSolid(state, wx + inner, wy)) return true;
  if (isSolid(state, wx - inner, wy)) return true;
  if (isSolid(state, wx, wy + inner)) return true;
  if (isSolid(state, wx, wy - inner)) return true;

  return false;
}
