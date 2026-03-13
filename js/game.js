function update(delta){
  updatePlayer(delta);
  updateEnemies(delta);
  updateBullets(delta);
}

function render(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  drawMap();
  drawEnemies();
  drawBullets();
  drawPlayer();
}

startGame();