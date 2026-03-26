import { GameState } from '../core/gameState';

const drawVision = (ctx: CanvasRenderingContext2D, state: GameState, id: number): void => {
  const enemy = state.enemy.get(id);
  const pos = state.positions.get(id);
  const dir = state.directions.get(id);
  const vision = state.vision.get(id);
  if (!enemy || !pos || !dir || !vision) return;

  const pad = vision.width - 4;
  let x = pos.x;
  let y = pos.y;
  let w = 0;
  let h = 0;

  if (dir === 'up') {
    x -= pad;
    y -= vision.range;
    w = 24 + pad * 2;
    h = vision.range;
  } else if (dir === 'down') {
    x -= pad;
    y += 24;
    w = 24 + pad * 2;
    h = vision.range;
  } else if (dir === 'left') {
    x -= vision.range;
    y -= pad;
    w = vision.range;
    h = 24 + pad * 2;
  } else {
    x += 24;
    y -= pad;
    w = vision.range;
    h = 24 + pad * 2;
  }

  ctx.fillStyle = enemy.state === 'alert' ? 'rgba(255,0,0,0.30)' : 'rgba(255,255,0,0.18)';
  ctx.fillRect(x, y, w, h);
};

const drawPlayer = (ctx: CanvasRenderingContext2D, state: GameState): void => {
  const id = state.player;
  const pos = state.positions.get(id);
  const dir = state.directions.get(id);
  const anim = state.animation.get(id);
  const hp = state.health.get(id);
  if (!pos || !dir || !anim || !hp) return;

  const visible = hp.invuln <= 0 || Math.floor(hp.invuln * 12) % 2 === 0;
  if (!visible) return;

  const bob = anim.moving ? [0, 1, 0, -1, 0][anim.frame] : 0;
  const legShift = anim.moving ? [-1, 0, 1, 0, -1][anim.frame] : 0;
  const armShift = anim.moving ? [0, 1, 2, 1, 0][anim.frame] : 0;

  ctx.save();
  ctx.translate(pos.x + 12, pos.y + 12 + bob);
  if (dir === 'left') ctx.scale(-1, 1);
  ctx.translate(-12, -12);

  const side = dir === 'left' || dir === 'right';

  ctx.fillStyle = '#0d3d24';
  ctx.fillRect(6, 2, 12, 3);
  ctx.fillStyle = '#68452a';
  ctx.fillRect(7, 0, 10, 3);
  ctx.fillStyle = '#2ad66b';
  ctx.fillRect(6, 4, 12, 2);

  ctx.fillStyle = dir === 'up' ? '#1f6e3f' : '#f1c27d';
  ctx.fillRect(8, 6, 8, 5);

  ctx.fillStyle = '#1f6e3f';
  ctx.fillRect(7, 11, 10, 7);
  ctx.fillStyle = '#2d9959';
  ctx.fillRect(9, 12, 6, 5);

  if (side) {
    ctx.fillStyle = '#0d3d24';
    ctx.fillRect(15, 11, 4, 6);
    ctx.fillStyle = '#aab8c4';
    ctx.fillRect(18, 12 + armShift, 6, 2);
  } else {
    ctx.fillStyle = '#0d3d24';
    ctx.fillRect(5, 11, 3, 5);
    ctx.fillRect(16, 11, 3, 5);
  }

  ctx.fillStyle = '#0d3d24';
  ctx.fillRect(8, 17, 3, 5);
  ctx.fillRect(13, 17, 3, 5);

  ctx.fillStyle = '#2c3640';
  ctx.fillRect(7, 22 + legShift, 5, 2);
  ctx.fillRect(12, 22 - legShift, 5, 2);

  ctx.restore();
};

const drawEnemy = (ctx: CanvasRenderingContext2D, state: GameState, id: number): void => {
  const pos = state.positions.get(id);
  const enemy = state.enemy.get(id);
  if (!pos || !enemy) return;

  drawVision(ctx, state, id);

  if (enemy.type === 'dog') {
    ctx.fillStyle = enemy.state === 'alert' ? enemy.alertColor : enemy.color;
    ctx.fillRect(pos.x, pos.y + 7, 24, 12);
    ctx.fillRect(pos.x + 18, pos.y + 9, 6, 5);
    ctx.fillRect(pos.x + 2, pos.y + 17, 3, 7);
    ctx.fillRect(pos.x + 8, pos.y + 17, 3, 7);
    ctx.fillRect(pos.x + 15, pos.y + 17, 3, 7);
    ctx.fillRect(pos.x + 20, pos.y + 17, 3, 7);
    return;
  }

  ctx.fillStyle = enemy.state === 'alert' ? enemy.alertColor : enemy.color;
  ctx.fillRect(pos.x, pos.y, 24, 24);
};

export const renderSystem = (ctx: CanvasRenderingContext2D, state: GameState): void => {
  ctx.clearRect(0, 0, state.camera.width, state.camera.height);

  ctx.save();
  ctx.translate(-Math.floor(state.camera.x), -Math.floor(state.camera.y));

  state.drawTilemap(ctx);

  for (const id of state.enemyTag) drawEnemy(ctx, state, id);

  for (const id of state.bulletTag) {
    const pos = state.positions.get(id);
    const bullet = state.bullet.get(id);
    if (!pos || !bullet) continue;
    ctx.fillStyle = bullet.owner === 'enemy' ? 'orange' : 'cyan';
    ctx.fillRect(pos.x, pos.y, 6, 6);
  }

  drawPlayer(ctx, state);
  ctx.restore();
};
