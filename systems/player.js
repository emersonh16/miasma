// Player system — locked to screen center; WASD moves the world/camera.
//
// API:
//   init(state, config)   // resets player + camera
//   update(state, dt)     // moves camera from input
//   draw(ctx, state, view)// draws player at screen center

import { isDown } from '../engine/input.js';

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
  let dx = 0, dy = 0;

  if (isDown(state, 'w', 'arrowup'))    dy -= 1;
  if (isDown(state, 's', 'arrowdown'))  dy += 1;
  if (isDown(state, 'a', 'arrowleft'))  dx -= 1;
  if (isDown(state, 'd', 'arrowright')) dx += 1;

  if (dx || dy) {
    const len = Math.hypot(dx, dy) || 1;
    dx /= len; dy /= len;
    // Move the *world/camera*, not the player
    state.camera.x += dx * s * dt;
    state.camera.y += dy * s * dt;
  }
}

export function draw(ctx, state, view) {
  // Player stays locked at view center.
  const cx = view.w * 0.5;
  const cy = view.h * 0.5;

  ctx.beginPath();
  ctx.arc(cx, cy, state.player.r, 0, Math.PI * 2);
  ctx.fillStyle = state.player.color;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = state.player.outline;
  ctx.stroke();
}
