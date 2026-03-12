const enemies = [
{
  x: 320,
  y: 96,
  size: 24,
  speed: 60,

  direction: "down",

  viewDistance: 160,

  patrolPoints: [
    {x:320, y:96},
    {x:320, y:200},
    {x:450, y:200},
    {x:450, y:96}
  ],

  patrolIndex: 0,

  state: "patrol",

  shootCooldown: 0
}
];

function updateEnemies(delta){

  enemies.forEach(enemy => {

    if(enemy.state === "patrol"){

      patrolEnemy(enemy, delta)

      if(canSeePlayer(enemy)){
        enemy.state = "alert"
      }

    }

    if(enemy.state === "alert"){

      attackPlayer(enemy, delta)

    }

  })

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

function patrolEnemy(enemy, delta){

  const target = enemy.patrolPoints[enemy.patrolIndex]

  const dx = target.x - enemy.x
  const dy = target.y - enemy.y

  const dist = Math.sqrt(dx*dx + dy*dy)

  if(dist < 2){
    enemy.patrolIndex++
    if(enemy.patrolIndex >= enemy.patrolPoints.length)
      enemy.patrolIndex = 0
  }

  enemy.x += (dx/dist) * enemy.speed * delta
  enemy.y += (dy/dist) * enemy.speed * delta

  if(Math.abs(dx) > Math.abs(dy)){
    enemy.direction = dx > 0 ? "right" : "left"
  } else {
    enemy.direction = dy > 0 ? "down" : "up"
  }

}

const bullets = [];

function attackPlayer(enemy, delta){

  enemy.shootCooldown -= delta

  const dx = player.x - enemy.x
  const dy = player.y - enemy.y

  const dist = Math.sqrt(dx*dx + dy*dy)

  enemy.x += (dx/dist) * enemy.speed * delta
  enemy.y += (dy/dist) * enemy.speed * delta

  if(enemy.shootCooldown <= 0){

    shoot(enemy)

    enemy.shootCooldown = 1.5
  }

}

function shoot(enemy){

  const px = player.x + player.size/2
  const py = player.y + player.size/2

  const ex = enemy.x + enemy.size/2
  const ey = enemy.y + enemy.size/2

  const dx = px - ex
  const dy = py - ey

  const dist = Math.sqrt(dx*dx + dy*dy)

  bullets.push({

    x: ex,
    y: ey,

    vx: dx/dist * 300,
    vy: dy/dist * 300,

    size: 6

  })

}

function updateBullets(delta){

  bullets.forEach(b => {

    b.x += b.vx * delta
    b.y += b.vy * delta

  })

}

function drawBullets(){

  ctx.fillStyle = "orange"

  bullets.forEach(b => {

    ctx.fillRect(b.x, b.y, b.size, b.size)

  })

}