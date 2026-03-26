import { GameState } from '../core/gameState';
import type { EntityId } from '../types';

const canSeePlayer = (state: GameState, id: EntityId): boolean => {
  const p = state.positions.get(state.player);
  const e = state.positions.get(id);
  const vision = state.vision.get(id);
  const dir = state.directions.get(id);
  if (!p || !e || !vision || !dir) return false;

  const px = p.x + 12;
  const py = p.y + 12;
  const ex = e.x + 12;
  const ey = e.y + 12;

  if (dir === 'up') return px > ex - vision.width && px < ex + vision.width && py < ey && ey - py < vision.range;
  if (dir === 'down') return px > ex - vision.width && px < ex + vision.width && py > ey && py - ey < vision.range;
  if (dir === 'left') return py > ey - vision.width && py < ey + vision.width && px < ex && ex - px < vision.range;
  return py > ey - vision.width && py < ey + vision.width && px > ex && px - ex < vision.range;
};

export const aiSystem = (state: GameState, dt: number): void => {
  const playerPos = state.getPlayerPos();

  for (const id of state.enemyTag) {
    const enemy = state.enemy.get(id);
    const pos = state.positions.get(id);
    const vel = state.velocities.get(id);
    const patrol = state.patrol.get(id);
    if (!enemy || !pos || !vel || !patrol) continue;

    if (canSeePlayer(state, id)) {
      state.alert = true;
      state.alertTimer = state.alertDuration;
      for (const eid of state.enemyTag) {
        const e = state.enemy.get(eid);
        if (e) e.state = 'alert';
      }
    }

    if (enemy.state === 'alert') {
      const dx = playerPos.x - pos.x;
      const dy = playerPos.y - pos.y;
      const dist = Math.hypot(dx, dy) || 1;
      vel.x = (dx / dist) * enemy.speed;
      vel.y = (dy / dist) * enemy.speed;

      state.directions.set(id, Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
      continue;
    }

    const target = patrol.points[patrol.index];
    const dx = target.x - pos.x;
    const dy = target.y - pos.y;
    const dist = Math.hypot(dx, dy);

    if (dist < 4) {
      patrol.index = (patrol.index + 1) % patrol.points.length;
      vel.x = 0;
      vel.y = 0;
      continue;
    }

    vel.x = (dx / dist) * enemy.speed;
    vel.y = (dy / dist) * enemy.speed;
    state.directions.set(id, Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
  }

  if (state.alert) {
    state.alertTimer -= dt;
    if (state.alertTimer <= 0) {
      state.alert = false;
      for (const id of state.enemyTag) {
        const enemy = state.enemy.get(id);
        const vel = state.velocities.get(id);
        if (!enemy || !vel) continue;
        enemy.state = 'patrol';
        vel.x = 0;
        vel.y = 0;
      }
    }
  }
};
