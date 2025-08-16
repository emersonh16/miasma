// core/config.js
// Director knobs — all tunables live here.

export const config = {
  canvas: { bg: '#0c0b10' },

  player: {
    radius: 14,
    color: '#d5e2ff',
    speed: 220,
    outline: '#6aa0ff'
  },

  world: {
    // Infinite world chunks
    chunkSize: 256,
    seed: 1337,

    // Streaming radius (how many chunk rings we keep mounted)
    streamRadius: 3,

    // Debug visuals
    showChunkLabels: true
  },

  flags: {
    enableDevHUD: true,
  }
};
