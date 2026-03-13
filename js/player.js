const player = {
  x: 64,
  y: 64,
  size: 24,
  speed: 150
};

function areaHasWall(x, y, w, h){
  const corners = [
    {x: x, y: y},
    {x: x + w - 1, y: y},
    {x: x, y: y + h - 1},
    {x: x + w - 1, y: y + h - 1}
  ];
  for (let c of corners){
    if (isWall(c.x, c.y)) return true;
  }
  return false;
}

function updatePlayer(delta) {
  let nx = player.x;
  let ny = player.y;

  if (keys["w"]) ny -= player.speed * delta;
  if (keys["s"]) ny += player.speed * delta;
  if (keys["a"]) nx -= player.speed * delta;
  if (keys["d"]) nx += player.speed * delta;

  if (!areaHasWall(nx, player.y, player.size, player.size)) player.x = nx;
  if (!areaHasWall(player.x, ny, player.size, player.size)) player.y = ny;
}

function drawPlayer() {
  ctx.fillStyle = "#0f0";
  ctx.fillRect(Math.floor(player.x), Math.floor(player.y), player.size, player.size);
}