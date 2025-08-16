// core/config.js
// Director knobs — all tunables live here.

export const config = {
  canvas: {
    bg: '#0c0b10'
  },

  player: {
    radius: 14,
    color: '#d5e2ff',
    speed: 220,
    outline: '#6aa0ff'
  },

  world: {
    chunkSize: 256,
    seed: Math.floor(Math.random() * 9999999), // random seed on each run
    streamRadius: 3,
    showChunkLabels: true
  },

  // Feature switches (flip systems on/off without code changes)
  flags: {
    enableDevHUD: true,
    enableRocks: true
  },

  // Rocks configuration
  rocks: {
    gridRes: 64,
    cellSize: 4,

    boulders: {
      spawnProb: 0.6,
      sizeMin: 20,
      sizeMax: 80
    },

    walls: {
      spawnProb: 0.2,
      sizeMin: 8000,
      sizeMax: 16000
    },

    fill: 'rgba(130,140,160,0.55)',
    stroke: 'rgba(220,230,255,0.25)'
  }
};
