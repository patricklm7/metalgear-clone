const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let lastTime = performance.now();

function gameLoop(time){
  const delta = (time - lastTime) / 1000;
  lastTime = time;
  if (typeof update === "function") update(delta);
  if (typeof render === "function") render();
  requestAnimationFrame(gameLoop);
}

function startGame(){
  lastTime = performance.now();
  requestAnimationFrame(gameLoop);
}