function update(delta) {
  updatePlayer(delta);
  updateEnemies(delta);
  updateBullets(delta);
  updateAlertSystem(delta);
  updateCamera();
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
}

function updateHud() {
  const alertaEl = document.getElementById("alerta");
  if (!alertaEl) return;

  if (alertSystem.active) {
    alertaEl.classList.add("alertaAtivo");
  } else {
    alertaEl.classList.remove("alertaAtivo");
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
  dots.push(`<div style="position:absolute;left:${Math.floor(p.x * miniSize) - 3}px;top:${Math.floor(p.y * miniSize) - 3}px;width:6px;height:6px;background:#0f0;"></div>`);

  for (let i = 0; i < enemies.length; i++) {
    const e = enemies[i];
    const er = worldToRadar(e.x + e.size / 2, e.y + e.size / 2);
    const color = e.state === ALERT_STATE.ALERT ? "#f00" : "#ff0";
    dots.push(`<div style="position:absolute;left:${Math.floor(er.x * miniSize) - 2}px;top:${Math.floor(er.y * miniSize) - 2}px;width:4px;height:4px;background:${color};"></div>`);
  }

  const cameraX = Math.floor(camera.x * scaleX);
  const cameraY = Math.floor(camera.y * scaleY);
  const cameraW = Math.floor(camera.width * scaleX);
  const cameraH = Math.floor(camera.height * scaleY);
  dots.push(`<div style="position:absolute;left:${cameraX}px;top:${cameraY}px;width:${cameraW}px;height:${cameraH}px;border:1px solid #00ccff;"></div>`);

  radar.innerHTML = dots.join("");
}

startGame();
