const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let lastTime = performance.now();

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function gameLoop(time) {
  const rawDelta = (time - lastTime) / 1000;
  const delta = clamp(rawDelta, 0, 0.05);
  lastTime = time;

  if (typeof update === "function") update(delta);
  if (typeof render === "function") render();

  requestAnimationFrame(gameLoop);
}

function startGame() {
  lastTime = performance.now();
  requestAnimationFrame(gameLoop);
}
