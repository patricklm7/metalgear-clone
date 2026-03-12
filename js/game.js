const canvas = document.getElementById("game")
const ctx = canvas.getContext("2d")

let lastTime = 0

function gameLoop(timestamp){

  const delta = (timestamp - lastTime) / 1000
  lastTime = timestamp

  update(delta)

  render()

  requestAnimationFrame(gameLoop)

}

function update(delta){

  updatePlayer(delta)

  updateEnemies(delta)

  updateBullets(delta)

}

function render(){

  ctx.clearRect(0,0,canvas.width,canvas.height)

  drawMap()

  drawEnemies()

  drawBullets()

  drawPlayer()

}

function startGame(){

  requestAnimationFrame(gameLoop)

}

startGame()