const enemies = [
  {
    x: 200,
    y: 200,
    size: 24,
    speed: 60,
    direction: "down",
    viewDistance: 120,
    patrolPoints:[
      {x:200,y:200},
      {x:400,y:200}
    ],
    patrolIndex:0,
    state:"patrol",
    shootCooldown:0,
    alerted:false
  }
];

const bullets = [];

function updateEnemies(delta){
  enemies.forEach(enemy => {
    if(enemy.state === "patrol"){
      patrolEnemy(enemy, delta);
      if(canSeePlayer(enemy)){
        enemy.state = "alert";
        enemy.alerted = true;
      }
    } else if(enemy.state === "alert"){
      attackPlayer(enemy, delta);
    }
  });
}

function drawEnemies(){
  enemies.forEach(enemy => {
    ctx.fillStyle = enemy.state === "alert" ? "red" : "yellow";
    ctx.fillRect(Math.floor(enemy.x), Math.floor(enemy.y), enemy.size, enemy.size);
    drawVisionCone(enemy);
  });
}

function patrolEnemy(enemy, delta){
  const target = enemy.patrolPoints[enemy.patrolIndex];
  const dx = target.x - enemy.x;
  const dy = target.y - enemy.y;
  const dist = Math.sqrt(dx*dx + dy*dy);
  if(dist < 2){
    enemy.patrolIndex++;
    if(enemy.patrolIndex >= enemy.patrolPoints.length) enemy.patrolIndex = 0;
    return;
  }
  enemy.x += (dx/dist) * enemy.speed * delta;
  enemy.y += (dy/dist) * enemy.speed * delta;
  if(Math.abs(dx) > Math.abs(dy)){
    enemy.direction = dx > 0 ? "right" : "left";
  } else {
    enemy.direction = dy > 0 ? "down" : "up";
  }
}

function canSeePlayer(enemy){
  const px = player.x + player.size/2;
  const py = player.y + player.size/2;
  const ex = enemy.x + enemy.size/2;
  const ey = enemy.y + enemy.size/2;

  if(enemy.direction === "up"){
    return px > ex-32 && px < ex+32 && py < ey && (ey - py) < enemy.viewDistance;
  }
  if(enemy.direction === "down"){
    return px > ex-32 && px < ex+32 && py > ey && (py - ey) < enemy.viewDistance;
  }
  if(enemy.direction === "left"){
    return py > ey-32 && py < ey+32 && px < ex && (ex - px) < enemy.viewDistance;
  }
  if(enemy.direction === "right"){
    return py > ey-32 && py < ey+32 && px > ex && (px - ex) < enemy.viewDistance;
  }
  return false;
}

function drawVisionCone(enemy){
  ctx.fillStyle = enemy.alerted ? "rgba(255,0,0,0.3)" : "rgba(255,255,0,0.2)";
  let x = enemy.x;
  let y = enemy.y;
  let w = 0;
  let h = 0;
  if(enemy.direction === "up"){
    x -= 32;
    y -= enemy.viewDistance;
    w = enemy.size + 64;
    h = enemy.viewDistance;
  } else if(enemy.direction === "down"){
    x -= 32;
    y += enemy.size;
    w = enemy.size + 64;
    h = enemy.viewDistance;
  } else if(enemy.direction === "left"){
    x -= enemy.viewDistance;
    y -= 32;
    w = enemy.viewDistance;
    h = enemy.size + 64;
  } else if(enemy.direction === "right"){
    x += enemy.size;
    y -= 32;
    w = enemy.viewDistance;
    h = enemy.size + 64;
  }
  ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h));
}

function attackPlayer(enemy, delta){
  enemy.shootCooldown -= delta;
  const dx = player.x - enemy.x;
  const dy = player.y - enemy.y;
  const dist = Math.sqrt(dx*dx + dy*dy);
  if(dist > 0){
    enemy.x += (dx/dist) * enemy.speed * delta;
    enemy.y += (dy/dist) * enemy.speed * delta;
  }
  if(enemy.shootCooldown <= 0){
    shoot(enemy);
    enemy.shootCooldown = 1.5;
  }
}

function shoot(enemy){
  const px = player.x + player.size/2;
  const py = player.y + player.size/2;
  const ex = enemy.x + enemy.size/2;
  const ey = enemy.y + enemy.size/2;
  const dx = px - ex;
  const dy = py - ey;
  const dist = Math.sqrt(dx*dx + dy*dy);
  if(dist === 0) return;
  bullets.push({
    x: ex,
    y: ey,
    vx: dx/dist * 300,
    vy: dy/dist * 300,
    size: 6
  });
}

function updateBullets(delta){
  for (let i = bullets.length - 1; i >= 0; i--){
    const b = bullets[i];
    b.x += b.vx * delta;
    b.y += b.vy * delta;
    if (b.x < -50 || b.x > canvas.width + 50 || b.y < -50 || b.y > canvas.height + 50){
      bullets.splice(i,1);
    }
  }
}

function drawBullets(){
  ctx.fillStyle = "orange";
  bullets.forEach(b => {
    ctx.fillRect(Math.floor(b.x), Math.floor(b.y), b.size, b.size);
  });
}