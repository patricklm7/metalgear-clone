import { GameState } from '../core/gameState';

export const inputSystem = (state: GameState): void => {
  const v = state.velocities.get(state.player);
  const dir = state.directions.get(state.player);
  if (!v || !dir) return;

  let x = 0;
  let y = 0;

  if (state.input.up) y -= 1;
  if (state.input.down) y += 1;
  if (state.input.left) x -= 1;
  if (state.input.right) x += 1;

  if (x !== 0 && y !== 0) {
    const inv = 1 / Math.sqrt(2);
    x *= inv;
    y *= inv;
  }

  v.x = x * 150;
  v.y = y * 150;

  if (x > 0) state.directions.set(state.player, 'right');
  if (x < 0) state.directions.set(state.player, 'left');
  if (y > 0) state.directions.set(state.player, 'down');
  if (y < 0) state.directions.set(state.player, 'up');
};
