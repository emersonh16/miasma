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
    // Infinite world chunks
    chunkSize: 256,
    seed: 1337,

    // Streaming coverage
    streamRadius: 3,

    // Debug
    showChunkLabels: true
  },

  // Feature switches (flip systems on/off without code changes)
  flags: {
    enableDevHUD: true,
    enableRocks:  true
  },

  // Rocks configuration
  rocks: {
    gridRes: 64,        // cells per chunk side
    cellSize: 4,        // world units per cell (gridRes * cellSize ≈ chunkSize)

    // --- Boulder blobs (small, round-ish) ---
    boulders: {
      spawnProb: 0.04,   // chance per origin cell to spawn a boulder blob
      sizeMin: 20,       // min growth steps
      sizeMax: 60        // max growth steps
    },

    // --- Wall blobs (large, sprawling formations) ---
    walls: {
      spawnProb: 0.01,   // chance per origin cell to spawn a wall/cavern
      sizeMin: 200,      // min growth steps
      sizeMax: 500       // max growth steps
    },

    // Visuals (debug look for now)
    fill:   'rgba(130,140,160,0.55)',
    stroke: 'rgba(220,230,255,0.25)'
  }
};
