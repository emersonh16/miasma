// core/game.js — main loop wiring (adds Rocks system to init/update/draw)
import { config } from './config.js';
import { initInput, updateInput } from '../engine/input.js';
import { initBus } from '../engine/eventbus.js';

import * as Streamer from '../engine/streamer.js';
import * as World from '../systems/world.js';
import * as Player from '../systems/player.js';
import * as Rocks from '../systems/rocks.js';        // <-- NEW
import * as DevHUD from '../ui/devhud.js';
import * as DiffStore from '../engine/diffstore.js';
import * as ChunkReg from '../engine/chunkreg.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d', { alpha: false });

const state = {
  time: 0,
  dt: 0,
  camera: { x: 0, y: 0 },
  view: { w: 0, h: 0 }
};

function resize() {
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  canvas.width  = Math.floor(canvas.clientWidth  * dpr);
  canvas.height = Math.floor(canvas.clientHeight * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  state.view.w = canvas.clientWidth;
  state.view.h = canvas.clientHeight;
}
addEventListener('resize', resize);

function clear() {
  ctx.fillStyle = config.canvas.bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

export function reset() {
  state.time = 0;
  state.dt = 0;
  state.camera.x = 0;
  state.camera.y = 0;
  state.view.w = canvas.clientWidth;
  state.view.h = canvas.clientHeight;

  initBus(state);
  initInput(state);

  // Persistent diffs ready for later (carving, etc.)
  DiffStore.init(state, { max: 200 });

  // Track mounted chunks via events
  ChunkReg.init(state);

  // Systems
  World.init(state, config);
  Streamer.init(state, config);
  if (config.flags.enableRocks) Rocks.init(state, config);   // <-- NEW (guarded by flag)
  Player.init(state, config);
  if (config.flags.enableDevHUD) DevHUD.init(state);
}

function init() {
  resize();
  reset();
  requestAnimationFrame(loop);
}

let last = performance.now();
function loop(now) {
  state.dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  state.time += state.dt;

  state.view.w = canvas.clientWidth;
  state.view.h = canvas.clientHeight;

  updateInput(state);

  // Stagehands decide which chunks exist
  Streamer.update(state);

  // Systems tick
  World.update(state, state.dt);
  if (config.flags.enableRocks) Rocks.update(state, state.dt);  // <-- NEW
  Player.update(state, state.dt);
  if (config.flags.enableDevHUD) DevHUD.update(state, state.dt);

  // Draw order: world → rocks → player → HUD
  clear();
  World.draw(ctx, state, state.view);
  if (config.flags.enableRocks) Rocks.draw(ctx, state, state.view); // <-- NEW
  Player.draw(ctx, state, state.view);
  if (config.flags.enableDevHUD) DevHUD.draw(ctx, state);

  requestAnimationFrame(loop);
}

init();
