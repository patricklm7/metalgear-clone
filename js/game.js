function update(delta) {
  updatePlayer(delta);
  updatePhaseProgress();
  updateEnemies(delta);
  updateBullets(delta);
  updateAlertSystem(delta);
  updateCamera(delta);
  updateHud();
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  beginCamera();
  drawMap();
  drawEnemies();
  drawBullets();
  drawPlayer();
  endCamera();

  drawRadar();
  drawScreenTransition();
}

function updateHud() {
  const alertaEl = document.getElementById("alerta");
  const missaoEl = document.getElementById("missao");
  const phase = getCurrentPhaseConfig();

  if (alertaEl) {
    if (alertSystem.active) {
      alertaEl.classList.add("alertaAtivo");
    } else {
      alertaEl.classList.remove("alertaAtivo");
    }
  }

  if (missaoEl && phase) {
    const dogsAlive = enemies.filter(enemy => enemy.type === ENEMY_TYPE.DOG).length;
    missaoEl.innerText = `${phase.title}: ${phase.objective} | CÃES ${dogsAlive}`;
  }
}

function drawRadar() {
  const radar = document.getElementById("radar");
  if (!radar) return;

  const miniSize = 120;
  const scaleX = miniSize / getMapPixelWidth();
  const scaleY = miniSize / getMapPixelHeight();

  const dots = [];

  const p = worldToRadar(player.x + player.size / 2, player.y + player.size / 2);
  dots.push(`<div style="position:absolute;left:${Math.floor(p.x * miniSize) - 3}px;top:${Math.floor(p.y * miniSize) - 3}px;width:6px;height:6px;border-radius:50%;background:#0f0;"></div>`);

  for (let i = 0; i < enemies.length; i++) {
    const e = enemies[i];
    const er = worldToRadar(e.x + e.size / 2, e.y + e.size / 2);
    const color = e.type === ENEMY_TYPE.DOG ? "#ff7b00" : (e.state === ALERT_STATE.ALERT ? "#f00" : "#ff0");
    const size = e.type === ENEMY_TYPE.DOG ? 6 : 4;
    dots.push(`<div style="position:absolute;left:${Math.floor(er.x * miniSize) - Math.floor(size / 2)}px;top:${Math.floor(er.y * miniSize) - Math.floor(size / 2)}px;width:${size}px;height:${size}px;border-radius:50%;background:${color};"></div>`);
  }

  const cameraX = Math.floor(camera.x * scaleX);
  const cameraY = Math.floor(camera.y * scaleY);
  const cameraW = Math.floor(camera.width * scaleX);
  const cameraH = Math.floor(camera.height * scaleY);
  dots.push(`<div style="position:absolute;left:${cameraX}px;top:${cameraY}px;width:${cameraW}px;height:${cameraH}px;border:1px solid #00ccff;"></div>`);

  radar.innerHTML = dots.join("");
}

initializePhaseState();
startGame();
