const camera = {
  x: 0,
  y: 0,
  width: canvas.width,
  height: canvas.height,
  screenX: 0,
  screenY: 0,
  transitionTimer: 0,
  transitionDuration: 0.45,
  transitionLabel: "TELA 1"
};

function updateCamera(delta) {
  const maxX = Math.max(0, getMapPixelWidth() - camera.width);
  const maxY = Math.max(0, getMapPixelHeight() - camera.height);
  const playerCenterX = player.x + player.size / 2;
  const playerCenterY = player.y + player.size / 2;

  const nextScreenX = clamp(Math.floor(playerCenterX / camera.width), 0, Math.max(0, Math.ceil(getMapPixelWidth() / camera.width) - 1));
  const nextScreenY = clamp(Math.floor(playerCenterY / camera.height), 0, Math.max(0, Math.ceil(getMapPixelHeight() / camera.height) - 1));

  if (nextScreenX !== camera.screenX || nextScreenY !== camera.screenY) {
    camera.screenX = nextScreenX;
    camera.screenY = nextScreenY;
    camera.transitionTimer = camera.transitionDuration;
    camera.transitionLabel = `TELA ${camera.screenY * Math.max(1, Math.ceil(getMapPixelWidth() / camera.width)) + camera.screenX + 1}`;
  }

  camera.x = clamp(camera.screenX * camera.width, 0, maxX);
  camera.y = clamp(camera.screenY * camera.height, 0, maxY);

  if (camera.transitionTimer > 0) {
    camera.transitionTimer = Math.max(0, camera.transitionTimer - delta);
  }
}

function beginCamera() {
  ctx.save();
  ctx.translate(-Math.floor(camera.x), -Math.floor(camera.y));
}

function endCamera() {
  ctx.restore();
}

function drawScreenTransition() {
  if (camera.transitionTimer <= 0) return;

  const progress = camera.transitionTimer / camera.transitionDuration;
  const alpha = progress * 0.9;

  ctx.save();
  ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = `rgba(0, 255, 136, ${Math.min(1, progress + 0.15)})`;
  ctx.font = "bold 28px monospace";
  ctx.textAlign = "center";
  ctx.fillText(camera.transitionLabel, canvas.width / 2, canvas.height / 2);
  ctx.restore();
}

function worldToRadar(wx, wy) {
  const rw = getMapPixelWidth();
  const rh = getMapPixelHeight();
  const rx = rw > 0 ? wx / rw : 0;
  const ry = rh > 0 ? wy / rh : 0;
  return { x: clamp(rx, 0, 1), y: clamp(ry, 0, 1) };
}
