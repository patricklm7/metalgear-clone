const player = {
  x: 64,
  y: 64,
  size: 24,
  speed: 150
};

function updatePlayer(delta) {
  let nx = player.x;
  let ny = player.y;

  if (keys["w"]) ny -= player.speed * delta;
  if (keys["s"]) ny += player.speed * delta;
  if (keys["a"]) nx -= player.speed * delta;
  if (keys["d"]) nx += player.speed * delta;

  if (!isWall(nx, player.y)) player.x = nx;
  if (!isWall(player.x, ny)) player.y = ny;
}

function drawPlayer() {
  ctx.fillStyle = "#0f0";
  ctx.fillRect(
    player.x,
    player.y,
    player.size,
    player.size
  );
}