import { GameState } from '../core/gameState';

export const animationSystem = (state: GameState, dt: number): void => {
  for (const [id, anim] of state.animation.entries()) {
    const vel = state.velocities.get(id);
    if (!vel) continue;

    const moving = Math.abs(vel.x) > 0.1 || Math.abs(vel.y) > 0.1;
    anim.moving = moving;

    if (!moving) {
      anim.frame = 0;
      anim.timer = 0;
      continue;
    }

    anim.timer += dt;
    const frame = Math.floor(anim.timer * anim.fps) % anim.frames;
    anim.frame = frame;
  }
};
