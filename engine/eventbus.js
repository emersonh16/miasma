// Tiny event bus (future-proofing, not used heavily yet)
export function initBus(state) { state.bus = { subs: {} }; }

export function on(state, type, fn) {
  (state.bus.subs[type] ??= []).push(fn);
}

export function emit(state, type, payload={}) {
  for (const fn of state.bus.subs[type] ?? []) fn(payload, state);
}
