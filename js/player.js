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

function updatePlayer(delta) {
  if (player.invuln > 0) player.invuln -= delta;
  if (player.shootCooldown > 0) player.shootCooldown -= delta;

  let inputX = 0;
  let inputY = 0;

  if (keys["w"] || keys["arrowup"]) { inputY -= 1; player.direction = "up"; }
  if (keys["s"] || keys["arrowdown"]) { inputY += 1; player.direction = "down"; }
  if (keys["a"] || keys["arrowleft"]) { inputX -= 1; player.direction = "left"; }
  if (keys["d"] || keys["arrowright"]) { inputX += 1; player.direction = "right"; }

  if (inputX !== 0 && inputY !== 0) {
    const invLen = 1 / Math.sqrt(2);
    inputX *= invLen;
    inputY *= invLen;
  }

  const nx = player.x + inputX * player.speed * delta;
  const ny = player.y + inputY * player.speed * delta;

  if (!rectHitsWall(nx, player.y, player.size, player.size)) player.x = nx;
  if (!rectHitsWall(player.x, ny, player.size, player.size)) player.y = ny;

  if ((keys[" "] || keys["j"]) && player.shootCooldown <= 0) {
    playerShoot();
    player.shootCooldown = 0.4;
  }

  const vidaEl = document.getElementById("vida");
  if (vidaEl) vidaEl.innerText = "VIDA: " + Math.max(0, Math.floor(player.health));
}

function playerShoot() {
  const ex = player.x + player.size / 2;
  const ey = player.y + player.size / 2;
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
  const visible = player.invuln <= 0 || Math.floor(player.invuln * 10) % 2 === 0;
  if (!visible) return;

  const centerX = Math.floor(player.x + player.size / 2);
  const centerY = Math.floor(player.y + player.size / 2);

  ctx.fillStyle = "#00ff66";
  ctx.beginPath();
  ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(0, 255, 102, 0.35)";
  ctx.beginPath();
  ctx.arc(centerX, centerY, 9, 0, Math.PI * 2);
  ctx.stroke();
}
