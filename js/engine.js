const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 640;
canvas.height = 480;

let lastTime = 0;

function gameLoop(time) {
  const delta = (time - lastTime) / 1000;
  lastTime = time;

  update(delta);
  render();

  requestAnimationFrame(gameLoop);
}

function startGame() {
  requestAnimationFrame(gameLoop);
}