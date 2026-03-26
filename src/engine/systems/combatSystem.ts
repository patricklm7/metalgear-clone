import { GameState } from '../core/gameState';
import { rectHitsWall } from '../services/tilemap';

const shoot = (state: GameState, owner: 'player' | 'enemy', x: number, y: number, dirX: number, dirY: number, speed: number): void => {
  const dist = Math.hypot(dirX, dirY) || 1;
  state.createBullet(owner, x, y, (dirX / dist) * speed, (dirY / dist) * speed);
  state.sound.beep(owner === 'player' ? 660 : 330, 0.04, 0.05);
};

export const combatSystem = (state: GameState, dt: number): void => {
  const playerPos = state.getPlayerPos();

  for (const [id, weapon] of state.weapons.entries()) {
    weapon.cooldown = Math.max(0, weapon.cooldown - dt);

    if (id === state.player && state.input.shoot && weapon.cooldown <= 0) {
      const dir = state.directions.get(id) ?? 'up';
      const dirs = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] } as const;
      const vec = dirs[dir];
      shoot(state, 'player', playerPos.x + 12, playerPos.y + 12, vec[0], vec[1], weapon.speed);
      weapon.cooldown = weapon.cooldownMax;
      continue;
    }

    if (!state.enemyTag.has(id)) continue;
    const enemy = state.enemy.get(id);
    const pos = state.positions.get(id);
    if (!enemy || !pos || enemy.type === 'dog') continue;
    if (enemy.state === 'alert' && weapon.cooldown <= 0) {
      shoot(state, 'enemy', pos.x + 12, pos.y + 12, playerPos.x - pos.x, playerPos.y - pos.y, weapon.speed);
      weapon.cooldown = weapon.cooldownMax;
    }
  }

  for (const id of state.bulletTag) {
    const pos = state.positions.get(id);
    const vel = state.velocities.get(id);
    const bullet = state.bullet.get(id);
    const col = state.colliders.get(id);
    if (!pos || !vel || !bullet || !col) continue;

    pos.x += vel.x * dt;
    pos.y += vel.y * dt;

    if (rectHitsWall(state.map, pos.x, pos.y, col.w, col.h)) {
      state.entitiesToDestroy.push(id);
      continue;
    }

    if (bullet.owner === 'enemy') {
      const p = state.positions.get(state.player);
      const pc = state.colliders.get(state.player);
      const hp = state.health.get(state.player);
      if (!p || !pc || !hp) continue;

      const hit = pos.x < p.x + pc.w && pos.x + col.w > p.x && pos.y < p.y + pc.h && pos.y + col.h > p.y;
      if (hit && hp.invuln <= 0) {
        hp.value = Math.max(0, hp.value - 15);
        hp.invuln = 0.9;
        state.entitiesToDestroy.push(id);
        state.sound.beep(120, 0.08, 0.07);
      }
      continue;
    }

    for (const eid of state.enemyTag) {
      const ep = state.positions.get(eid);
      const ec = state.colliders.get(eid);
      const hp = state.health.get(eid);
      if (!ep || !ec || !hp) continue;

      const hit = pos.x < ep.x + ec.w && pos.x + col.w > ep.x && pos.y < ep.y + ec.h && pos.y + col.h > ep.y;
      if (!hit) continue;

      hp.value -= 25;
      state.entitiesToDestroy.push(id);
      if (hp.value <= 0) state.entitiesToDestroy.push(eid);
      break;
    }
  }

  const hp = state.health.get(state.player);
  if (hp) hp.invuln = Math.max(0, hp.invuln - dt);
};
