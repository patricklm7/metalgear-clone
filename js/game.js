function update(delta) {
  updatePlayer(delta);
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawMap();
  drawPlayer();
}

startGame();