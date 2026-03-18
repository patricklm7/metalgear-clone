const ALERT_STATE = {
  PATROL: "patrol",
  ALERT: "alert"
};

const enemies = [
  createEnemy(200, 200, [{ x: 200, y: 200 }, { x: 500, y: 200 }]),
  createEnemy(700, 320, [{ x: 700, y: 320 }, { x: 700, y: 460 }]),
  createEnemy(420, 500, [{ x: 420, y: 500 }, { x: 620, y: 500 }])
];

const bullets = [];
const alertSystem = {
  active: false,
  timer: 0,
  duration: 3
};

function createEnemy(x, y, patrolPoints) {
  return {
    x: x,
    y: y,
    size: 24,
    speed: 60,
    direction: "down",
    viewDistance: 150,
    patrolPoints: patrolPoints,
    patrolIndex: 0,
    state: ALERT_STATE.PATROL,
    shootCooldown: 0,
    alerted: false,
    health: 50
  };
}

function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

function updateEnemies(delta) {
  for (let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i];

    if (enemy.state === ALERT_STATE.PATROL) {
      patrolEnemy(enemy, delta);
    } else {
      attackPlayer(enemy, delta);
    }

    if (canSeePlayer(enemy)) {
      setGlobalAlert();
    }
  }
}

function drawEnemies() {
  enemies.forEach(enemy => {
    ctx.fillStyle = enemy.state === ALERT_STATE.ALERT ? "red" : "yellow";
    ctx.fillRect(Math.floor(enemy.x), Math.floor(enemy.y), enemy.size, enemy.size);
    drawVisionCone(enemy);
  });
}

function patrolEnemy(enemy, delta) {
  const target = enemy.patrolPoints[enemy.patrolIndex];
  const dx = target.x - enemy.x;
  const dy = target.y - enemy.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist < 2) {
    enemy.patrolIndex = (enemy.patrolIndex + 1) % enemy.patrolPoints.length;
    return;
  }

  moveEntityWithWalls(enemy, (dx / dist) * enemy.speed * delta, (dy / dist) * enemy.speed * delta);
  updateEnemyDirection(enemy, dx, dy);
}

function canSeePlayer(enemy) {
  const px = player.x + player.size / 2;
  const py = player.y + player.size / 2;
  const ex = enemy.x + enemy.size / 2;
  const ey = enemy.y + enemy.size / 2;

  if (enemy.direction === "up") {
    return px > ex - 36 && px < ex + 36 && py < ey && (ey - py) < enemy.viewDistance;
  }
  if (enemy.direction === "down") {
    return px > ex - 36 && px < ex + 36 && py > ey && (py - ey) < enemy.viewDistance;
  }
  if (enemy.direction === "left") {
    return py > ey - 36 && py < ey + 36 && px < ex && (ex - px) < enemy.viewDistance;
  }
  if (enemy.direction === "right") {
    return py > ey - 36 && py < ey + 36 && px > ex && (px - ex) < enemy.viewDistance;
  }

  return false;
}

function drawVisionCone(enemy) {
  ctx.fillStyle = enemy.alerted ? "rgba(255,0,0,0.3)" : "rgba(255,255,0,0.2)";

  let x = enemy.x;
  let y = enemy.y;
  let w = 0;
  let h = 0;

  if (enemy.direction === "up") {
    x -= 32;
    y -= enemy.viewDistance;
    w = enemy.size + 64;
    h = enemy.viewDistance;
  } else if (enemy.direction === "down") {
    x -= 32;
    y += enemy.size;
    w = enemy.size + 64;
    h = enemy.viewDistance;
  } else if (enemy.direction === "left") {
    x -= enemy.viewDistance;
    y -= 32;
    w = enemy.viewDistance;
    h = enemy.size + 64;
  } else if (enemy.direction === "right") {
    x += enemy.size;
    y -= 32;
    w = enemy.viewDistance;
    h = enemy.size + 64;
  }

  ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h));
}

function updateEnemyDirection(enemy, dx, dy) {
  if (Math.abs(dx) > Math.abs(dy)) {
    enemy.direction = dx > 0 ? "right" : "left";
  } else {
    enemy.direction = dy > 0 ? "down" : "up";
  }
}

function attackPlayer(enemy, delta) {
  enemy.shootCooldown -= delta;

  const dx = player.x - enemy.x;
  const dy = player.y - enemy.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist > 0) {
    updateEnemyDirection(enemy, dx, dy);
    moveEntityWithWalls(enemy, (dx / dist) * enemy.speed * delta, (dy / dist) * enemy.speed * delta);
  }

  if (enemy.shootCooldown <= 0) {
    shoot(enemy);
    enemy.shootCooldown = 1.5;
  }
}

function moveEntityWithWalls(entity, dx, dy) {
  const nx = entity.x + dx;
  const ny = entity.y + dy;

  if (!rectHitsWall(nx, entity.y, entity.size, entity.size)) entity.x = nx;
  if (!rectHitsWall(entity.x, ny, entity.size, entity.size)) entity.y = ny;
}

function shoot(enemy) {
  const px = player.x + player.size / 2;
  const py = player.y + player.size / 2;
  const ex = enemy.x + enemy.size / 2;
  const ey = enemy.y + enemy.size / 2;

  const dx = px - ex;
  const dy = py - ey;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist === 0) return;

  bullets.push({
    x: ex,
    y: ey,
    vx: (dx / dist) * 300,
    vy: (dy / dist) * 300,
    size: 6,
    owner: "enemy"
  });
}

function updateBullets(delta) {
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];

    b.x += b.vx * delta;
    b.y += b.vy * delta;

    if (rectHitsWall(b.x, b.y, b.size, b.size)) {
      bullets.splice(i, 1);
      continue;
    }

    if (b.owner === "enemy") {
      if (player.invuln <= 0 && rectsOverlap(b.x, b.y, b.size, b.size, player.x, player.y, player.size, player.size)) {
        player.health -= 15;
        player.invuln = player.invulnDuration;
        bullets.splice(i, 1);
        if (player.health <= 0) player.health = 0;
        continue;
      }
    } else {
      for (let j = enemies.length - 1; j >= 0; j--) {
        const en = enemies[j];
        if (rectsOverlap(b.x, b.y, b.size, b.size, en.x, en.y, en.size, en.size)) {
          en.health -= 25;
          bullets.splice(i, 1);
          if (en.health <= 0) enemies.splice(j, 1);
          break;
        }
      }
      if (!bullets[i]) continue;
    }

    if (b.x < 0 || b.x > getMapPixelWidth() || b.y < 0 || b.y > getMapPixelHeight()) {
      bullets.splice(i, 1);
    }
  }
}

function drawBullets() {
  bullets.forEach(b => {
    ctx.fillStyle = b.owner === "enemy" ? "orange" : "cyan";
    ctx.fillRect(Math.floor(b.x), Math.floor(b.y), b.size, b.size);
  });
}

function setGlobalAlert() {
  alertSystem.active = true;
  alertSystem.timer = alertSystem.duration;

  enemies.forEach(enemy => {
    enemy.state = ALERT_STATE.ALERT;
    enemy.alerted = true;
  });
}

function updateAlertSystem(delta) {
  if (!alertSystem.active) return;

  alertSystem.timer -= delta;
  if (alertSystem.timer > 0) return;

  alertSystem.active = false;
  enemies.forEach(enemy => {
    enemy.state = ALERT_STATE.PATROL;
    enemy.alerted = false;
  });
}
