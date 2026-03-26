import { GameState } from './core/gameState';
import { aiSystem } from './systems/aiSystem';
import { animationSystem } from './systems/animationSystem';
import { combatSystem } from './systems/combatSystem';
import { inputSystem } from './systems/inputSystem';
import { movementSystem } from './systems/movementSystem';
import { renderSystem } from './systems/renderSystem';
import type { GameSnapshot } from './types';

export class GameEngine {
  private readonly state = new GameState();
  private readonly ctx: CanvasRenderingContext2D;
  private running = false;
  private lastTime = 0;
  private listeners = new Set<(snapshot: GameSnapshot) => void>();

  constructor(private readonly canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context unavailable');
    this.ctx = ctx;
    this.bindInput();
  }

  subscribe(listener: (snapshot: GameSnapshot) => void): () => void {
    this.listeners.add(listener);
    listener(this.state.getSnapshot());
    return () => this.listeners.delete(listener);
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    requestAnimationFrame(this.loop);
  }

  stop(): void {
    this.running = false;
  }

  private emit(): void {
    const snapshot = this.state.getSnapshot();
    this.listeners.forEach((listener) => listener(snapshot));
  }

  private loop = (time: number): void => {
    if (!this.running) return;

    const dt = Math.min(0.05, (time - this.lastTime) / 1000);
    this.lastTime = time;

    inputSystem(this.state);
    aiSystem(this.state, dt);
    movementSystem(this.state, dt);
    combatSystem(this.state, dt);
    animationSystem(this.state, dt);

    this.state.flushDestroyed();
    this.state.updateMissionProgress();
    this.state.updateCamera();

    renderSystem(this.ctx, this.state);
    this.emit();

    requestAnimationFrame(this.loop);
  };

  private bindInput(): void {
    const set = (code: string, value: boolean): void => {
      if (code === 'KeyW' || code === 'ArrowUp') this.state.input.up = value;
      if (code === 'KeyS' || code === 'ArrowDown') this.state.input.down = value;
      if (code === 'KeyA' || code === 'ArrowLeft') this.state.input.left = value;
      if (code === 'KeyD' || code === 'ArrowRight') this.state.input.right = value;
      if (code === 'KeyJ' || code === 'Space') this.state.input.shoot = value;
    };

    window.addEventListener('keydown', (event) => set(event.code, true));
    window.addEventListener('keyup', (event) => set(event.code, false));
  }
}
