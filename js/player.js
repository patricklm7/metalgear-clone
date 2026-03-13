const player = {
  x: 64,
  y: 64,
  size: 24,
  speed: 150,
  health: 100,
  maxHealth: 100,
  invuln: 0,
  invulnDuration: 1,
  shootCooldown: 0,
  bulletSpeed: 400,
  direction: "down"
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
  if (player.invuln > 0) player.invuln -= delta;
  if (player.shootCooldown > 0) player.shootCooldown -= delta;

  let nx = player.x;
  let ny = player.y;

  const moving =
    (keys["w"] || keys["arrowup"]) ||
    (keys["s"] || keys["arrowdown"]) ||
    (keys["a"] || keys["arrowleft"]) ||
    (keys["d"] || keys["arrowright"]);

  if (keys["w"] || keys["arrowup"]) { ny -= player.speed * delta; player.direction = "up"; }
  if (keys["s"] || keys["arrowdown"]) { ny += player.speed * delta; player.direction = "down"; }
  if (keys["a"] || keys["arrowleft"]) { nx -= player.speed * delta; player.direction = "left"; }
  if (keys["d"] || keys["arrowright"]) { nx += player.speed * delta; player.direction = "right"; }

  if (!areaHasWall(nx, player.y, player.size, player.size)) player.x = nx;
  if (!areaHasWall(player.x, ny, player.size, player.size)) player.y = ny;

  if ((keys[" "] || keys["j"]) && player.shootCooldown <= 0) {
    playerShoot();
    player.shootCooldown = 0.4;
  }

  const vidaEl = document.getElementById("vida");
  if (vidaEl) vidaEl.innerText = "VIDA: " + Math.max(0, Math.floor(player.health));
}

function playerShoot(){
  const ex = player.x + player.size/2;
  const ey = player.y + player.size/2;
  let vx = 0;
  let vy = 0;
  if (player.direction === "up") vy = -1;
  if (player.direction === "down") vy = 1;
  if (player.direction === "left") vx = -1;
  if (player.direction === "right") vx = 1;
  if (vx === 0 && vy === 0) vy = -1;
  bullets.push({
    x: ex,
    y: ey,
    vx: vx * player.bulletSpeed,
    vy: vy * player.bulletSpeed,
    size: 6,
    owner: "player"
  });
}

function drawPlayer() {
  if (player.invuln > 0) {
    const flash = Math.floor(player.invuln * 10) % 2 === 0;
    if (!flash) {
      ctx.fillStyle = "#0f0";
      ctx.fillRect(Math.floor(player.x), Math.floor(player.y), player.size, player.size);
    }
  } else {
    ctx.fillStyle = "#0f0";
    ctx.fillRect(Math.floor(player.x), Math.floor(player.y), player.size, player.size);
  }
}