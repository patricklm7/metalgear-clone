const TILE_SIZE = 32;
const PHASE_TRANSITION = {
  NONE: "none",
  NEXT_PHASE_RIGHT: "next_phase_right",
  ESCAPE_BOTTOM: "escape_bottom"
};

let currentPhase = 0;
let map = [];

function createBaseMap(width, height) {
  const phaseMap = [];
  for (let y = 0; y < height; y++) {
    const row = [];
    for (let x = 0; x < width; x++) {
      const border = y === 0 || y === height - 1 || x === 0 || x === width - 1;
      row.push(border ? 1 : 0);
    }
    phaseMap.push(row);
  }
  return phaseMap;
}

function fillRect(phaseMap, x, y, w, h, tile) {
  for (let ry = y; ry < y + h; ry++) {
    for (let rx = x; rx < x + w; rx++) {
      if (ry >= 0 && ry < phaseMap.length && rx >= 0 && rx < phaseMap[0].length) {
        phaseMap[ry][rx] = tile;
      }
    }
  }
}

function phaseOneMap() {
  const phaseMap = createBaseMap(50, 23);

  fillRect(phaseMap, 5, 5, 8, 1, 1);
  fillRect(phaseMap, 20, 8, 1, 8, 1);
  fillRect(phaseMap, 30, 4, 10, 1, 1);
  fillRect(phaseMap, 34, 10, 1, 8, 1);

  const middleRow = Math.floor(phaseMap.length / 2);
  phaseMap[middleRow][phaseMap[0].length - 1] = 0;

  return phaseMap;
}

function phaseTwoMap() {
  const phaseMap = createBaseMap(26, 27);

  fillRect(phaseMap, 3, 6, 20, 1, 1);
  fillRect(phaseMap, 3, 13, 20, 1, 1);
  fillRect(phaseMap, 3, 20, 20, 1, 1);

  const middleColumn = Math.floor(phaseMap[0].length / 2);
  phaseMap[0][middleColumn] = 0;
  phaseMap[phaseMap.length - 1][middleColumn] = 0;

  return phaseMap;
}

const phases = [
  {
    id: 1,
    title: "FASE 1",
    objective: "Ache a saída no lado direito",
    transitionType: PHASE_TRANSITION.NEXT_PHASE_RIGHT,
    mapData: phaseOneMap,
    spawn: { x: 64, y: 64 }
  },
  {
    id: 2,
    title: "FASE 2",
    objective: "Corra para baixo e escape dos cães",
    transitionType: PHASE_TRANSITION.ESCAPE_BOTTOM,
    mapData: phaseTwoMap,
    spawn: { x: 12 * TILE_SIZE, y: 64 }
  }
];

function loadPhase(index, preserveHealth) {
  currentPhase = clamp(index, 0, phases.length - 1);
  map = phases[currentPhase].mapData();

  player.x = phases[currentPhase].spawn.x;
  player.y = phases[currentPhase].spawn.y;

  if (!preserveHealth) player.health = player.maxHealth;

  if (typeof setupEnemiesForPhase === "function") setupEnemiesForPhase(phases[currentPhase].id);
  if (typeof resetAlertSystem === "function") resetAlertSystem();
  if (typeof resetCameraToPlayer === "function") resetCameraToPlayer();
}

function getCurrentPhaseConfig() {
  return phases[currentPhase];
}

function getMapPixelWidth() {
  return map[0].length * TILE_SIZE;
}

function getMapPixelHeight() {
  return map.length * TILE_SIZE;
}

function drawMap() {
  const screenColumns = Math.ceil(getMapPixelWidth() / canvas.width);
  const screenRows = Math.ceil(getMapPixelHeight() / canvas.height);

  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      ctx.fillStyle = map[y][x] === 1 ? "#333" : "#111";
      ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }
  }

  ctx.strokeStyle = "rgba(0, 255, 136, 0.2)";
  for (let x = 1; x < screenColumns; x++) {
    const screenX = x * canvas.width;
    ctx.beginPath();
    ctx.moveTo(screenX, 0);
    ctx.lineTo(screenX, getMapPixelHeight());
    ctx.stroke();
  }

  for (let y = 1; y < screenRows; y++) {
    const screenY = y * canvas.height;
    ctx.beginPath();
    ctx.moveTo(0, screenY);
    ctx.lineTo(getMapPixelWidth(), screenY);
    ctx.stroke();
  }
}

function updatePhaseProgress() {
  const phase = getCurrentPhaseConfig();
  if (!phase) return;

  if (phase.transitionType === PHASE_TRANSITION.NEXT_PHASE_RIGHT) {
    if (player.x + player.size >= getMapPixelWidth() - 6) {
      loadPhase(1, true);
      if (typeof setScreenTransitionLabel === "function") setScreenTransitionLabel("FASE 2: CÃES");
    }
  }

  if (phase.transitionType === PHASE_TRANSITION.ESCAPE_BOTTOM) {
    if (player.y + player.size >= getMapPixelHeight() - 4) {
      if (typeof setScreenTransitionLabel === "function") setScreenTransitionLabel("MISSÃO CUMPRIDA");
      loadPhase(1, true);
    }
  }
}

function isWall(x, y) {
  const tileX = Math.floor(x / TILE_SIZE);
  const tileY = Math.floor(y / TILE_SIZE);
  if (tileY < 0 || tileY >= map.length) return true;
  if (tileX < 0 || tileX >= map[0].length) return true;
  return map[tileY][tileX] === 1;
}

function rectHitsWall(x, y, w, h) {
  const points = [
    { x: x, y: y },
    { x: x + w - 1, y: y },
    { x: x, y: y + h - 1 },
    { x: x + w - 1, y: y + h - 1 }
  ];

  for (let i = 0; i < points.length; i++) {
    if (isWall(points[i].x, points[i].y)) return true;
  }

  return false;
}

function initializePhaseState() {
  loadPhase(0, false);
}
