const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d", { alpha: false });

const state = {
  time: 0,
  dt: 0,
  camera: { x: 0, y: 0 },
};

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

function update(dt) {
  state.time += dt;
}

function draw() {
  ctx.fillStyle = "#0c0b10";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "lime";
  ctx.font = "24px sans-serif";
  ctx.fillText("Miasma prototype running!", 50, 50);
}

let last = performance.now();
function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  state.dt = dt;

  update(dt);
  draw();

  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
