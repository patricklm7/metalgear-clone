import { GameState } from '../core/gameState';

export const movementSystem = (state: GameState, dt: number): void => {
  for (const id of state.world.entities) {
    const pos = state.positions.get(id);
    const vel = state.velocities.get(id);
    const col = state.colliders.get(id);
    if (!pos || !vel || !col) continue;

    const nx = pos.x + vel.x * dt;
    const ny = pos.y + vel.y * dt;

    if (state.canMoveTo({ x: nx, y: pos.y }, col)) pos.x = nx;
    if (state.canMoveTo({ x: pos.x, y: ny }, col)) pos.y = ny;
  }
};
