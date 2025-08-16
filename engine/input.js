// engine/input.js
// Minimal input with edge detection (wasPressed).

export function initInput(state) {
  state.input = {
    keysDown: new Set(),
    pressed: new Set(),
    prevDown: new Set()
  };

  addEventListener('keydown', e => state.input.keysDown.add(e.key.toLowerCase()));
  addEventListener('keyup',   e => state.input.keysDown.delete(e.key.toLowerCase()));
}

// Call once per frame to compute "pressed" edges.
export function updateInput(state) {
  const now = state.input.keysDown;
  const prev = state.input.prevDown;
  const pressed = new Set();

  for (const k of now) if (!prev.has(k)) pressed.add(k);

  state.input.pressed = pressed;
  state.input.prevDown = new Set(now);
}

export function isDown(state, ...aliases) {
  return aliases.some(k => state.input.keysDown.has(k));
}

export function wasPressed(state, ...aliases) {
  return aliases.some(k => state.input.pressed.has(k));
}
