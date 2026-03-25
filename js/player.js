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
  direction: "down",
  isMoving: false,
  animTimer: 0,
  animFrame: 0
};

const WALK_FRAMES = 5;
const WALK_FPS = 12;

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

  player.isMoving = inputX !== 0 || inputY !== 0;
  if (player.isMoving) {
    player.animTimer += delta;
    const frameAdvance = Math.floor(player.animTimer * WALK_FPS);
    player.animFrame = frameAdvance % WALK_FRAMES;
  } else {
    player.animTimer = 0;
    player.animFrame = 0;
  }

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

  drawPixelSoldier(player.x, player.y, player.direction, player.animFrame, player.isMoving);
}

function drawPixelSoldier(x, y, direction, frame, moving) {
  const bobOffsets = [0, 1, 0, -1, 0];
  const legOffsets = [-1, 0, 1, 0, -1];
  const armOffsets = [0, 1, 2, 1, 0];

  const bob = moving ? bobOffsets[frame] : 0;
  const legShift = moving ? legOffsets[frame] : 0;
  const armShift = moving ? armOffsets[frame] : 0;

  const px = Math.floor(x);
  const py = Math.floor(y + bob);

  ctx.save();
  ctx.translate(px + Math.floor(player.size / 2), py + Math.floor(player.size / 2));

  if (direction === "left") ctx.scale(-1, 1);

  const isSide = direction === "left" || direction === "right";
  const faceDown = direction === "down";
  const faceUp = direction === "up";

  ctx.translate(-Math.floor(player.size / 2), -Math.floor(player.size / 2));

  const skin = "#f1c27d";
  const suitDark = "#0d3d24";
  const suitMid = "#1f6e3f";
  const suitLight = "#2d9959";
  const band = "#2ad66b";
  const boot = "#2c3640";
  const gun = "#aab8c4";

  ctx.fillStyle = suitDark;
  ctx.fillRect(6, 2, 12, 3);
  ctx.fillStyle = "#68452a";
  ctx.fillRect(7, 0, 10, 3);
  ctx.fillStyle = band;
  ctx.fillRect(6, 4, 12, 2);

  if (faceUp) {
    ctx.fillStyle = suitMid;
    ctx.fillRect(8, 6, 8, 5);
  } else {
    ctx.fillStyle = skin;
    ctx.fillRect(8, 6, 8, 5);
  }

  ctx.fillStyle = suitMid;
  ctx.fillRect(7, 11, 10, 7);
  ctx.fillStyle = suitLight;
  ctx.fillRect(9, 12, 6, 5);

  if (isSide) {
    ctx.fillStyle = suitDark;
    ctx.fillRect(15, 11, 4, 6);
    ctx.fillStyle = gun;
    ctx.fillRect(18, 12 + armShift, 6, 2);
  } else {
    ctx.fillStyle = suitDark;
    ctx.fillRect(5, 11, 3, 5);
    ctx.fillRect(16, 11, 3, 5);
  }

  ctx.fillStyle = suitDark;
  ctx.fillRect(8, 17, 3, 5);
  ctx.fillRect(13, 17, 3, 5);

  ctx.fillStyle = boot;
  ctx.fillRect(7, 22 + legShift, 5, 2);
  ctx.fillRect(12, 22 - legShift, 5, 2);

  if (faceDown) {
    ctx.fillStyle = suitDark;
    ctx.fillRect(11, 14, 2, 2);
  }

  ctx.restore();
}
