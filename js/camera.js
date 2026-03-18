const camera = {
  x: 0,
  y: 0,
  width: canvas.width,
  height: canvas.height
};

function updateCamera() {
  const targetX = player.x + player.size / 2 - camera.width / 2;
  const targetY = player.y + player.size / 2 - camera.height / 2;

  const maxX = Math.max(0, getMapPixelWidth() - camera.width);
  const maxY = Math.max(0, getMapPixelHeight() - camera.height);

  camera.x = clamp(targetX, 0, maxX);
  camera.y = clamp(targetY, 0, maxY);
}

function beginCamera() {
  ctx.save();
  ctx.translate(-Math.floor(camera.x), -Math.floor(camera.y));
}

function endCamera() {
  ctx.restore();
}

function worldToRadar(wx, wy) {
  const rw = getMapPixelWidth();
  const rh = getMapPixelHeight();
  const rx = rw > 0 ? wx / rw : 0;
  const ry = rh > 0 ? wy / rh : 0;
  return { x: clamp(rx, 0, 1), y: clamp(ry, 0, 1) };
}
