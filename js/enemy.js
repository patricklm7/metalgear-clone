const enemies = [
  {
    x: 320,
    y: 96,
    size: 24,
    direction: "down",
    viewDistance: 160,
    alerted: false
  }
];

function updateEnemies() {
  enemies.forEach(enemy => {
    enemy.alerted = canSeePlayer(enemy);
  });
}

function drawEnemies() {
  enemies.forEach(enemy => {
    // Inimigo
    ctx.fillStyle = enemy.alerted ? "red" : "yellow";
    ctx.fillRect(enemy.x, enemy.y, enemy.size, enemy.size);

    drawVisionCone(enemy);
  });
}

function canSeePlayer(enemy) {
  const px = player.x + player.size / 2;
  const py = player.y + player.size / 2;

  const ex = enemy.x + enemy.size / 2;
  const ey = enemy.y + enemy.size / 2;

  let inCone = false;

  if (enemy.direction === "up") {
    inCone =
      px > ex - 32 &&
      px < ex + 32 &&
      py < ey &&
      ey - py < enemy.viewDistance;
  }

  if (enemy.direction === "down") {
    inCone =
      px > ex - 32 &&
      px < ex + 32 &&
      py > ey &&
      py - ey < enemy.viewDistance;
  }

  if (enemy.direction === "left") {
    inCone =
      py > ey - 32 &&
      py < ey + 32 &&
      px < ex &&
      ex - px < enemy.viewDistance;
  }

  if (enemy.direction === "right") {
    inCone =
      py > ey - 32 &&
      py < ey + 32 &&
      px > ex &&
      px - ex < enemy.viewDistance;
  }

  return inCone;
}

function drawVisionCone(enemy) {
  ctx.fillStyle = enemy.alerted
    ? "rgba(255,0,0,0.3)"
    : "rgba(255,255,0,0.2)";

  let x = enemy.x;
  let y = enemy.y;
  let w = 0;
  let h = 0;

  if (enemy.direction === "up") {
    x -= 32;
    y -= enemy.viewDistance;
    w = enemy.size + 64;
    h = enemy.viewDistance;
  }

  if (enemy.direction === "down") {
    x -= 32;
    y += enemy.size;
    w = enemy.size + 64;
    h = enemy.viewDistance;
  }

  if (enemy.direction === "left") {
    x -= enemy.viewDistance;
    y -= 32;
    w = enemy.viewDistance;
    h = enemy.size + 64;
  }

  if (enemy.direction === "right") {
    x += enemy.size;
    y -= 32;
    w = enemy.viewDistance;
    h = enemy.size + 64;
  }

  ctx.fillRect(x, y, w, h);
}