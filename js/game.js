function update(delta) {
  updatePlayer(delta);
  updateEnemies();
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawMap();
  drawEnemies();
  drawPlayer();
}

startGame();