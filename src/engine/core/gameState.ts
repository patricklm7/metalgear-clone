import { World } from './world';
import type { CameraState, Direction, EntityId, GameSnapshot, RadarDot, Vec2 } from '../types';
import { mapHeightPx, mapWidthPx, phases, rectHitsWall, TILE_SIZE } from '../services/tilemap';
import { SoundService } from '../services/sound';

interface Position extends Vec2 {}
interface Velocity extends Vec2 {}
interface Collider { w: number; h: number }
interface Health { value: number; max: number; invuln: number }
interface Weapon { cooldown: number; cooldownMax: number; speed: number }
interface Vision { range: number; width: number }
interface Patrol { points: Vec2[]; index: number }
interface Animation { frame: number; timer: number; fps: number; frames: number; moving: boolean }
interface Enemy { type: 'guard' | 'dog'; state: 'patrol' | 'alert'; alertColor: string; color: string; speed: number }
interface Bullet { owner: 'player' | 'enemy' }

export class GameState {
  readonly world = new World();
  readonly camera: CameraState = { x: 0, y: 0, width: 800, height: 600 };
  readonly sound = new SoundService();

  phaseIndex = 0;
  map = phases[0].map;

  player!: EntityId;
  entitiesToDestroy: EntityId[] = [];

  positions = new Map<EntityId, Position>();
  velocities = new Map<EntityId, Velocity>();
  colliders = new Map<EntityId, Collider>();
  health = new Map<EntityId, Health>();
  weapons = new Map<EntityId, Weapon>();
  directions = new Map<EntityId, Direction>();
  vision = new Map<EntityId, Vision>();
  patrol = new Map<EntityId, Patrol>();
  animation = new Map<EntityId, Animation>();
  enemy = new Map<EntityId, Enemy>();
  bullet = new Map<EntityId, Bullet>();

  playerTag = new Set<EntityId>();
  enemyTag = new Set<EntityId>();
  bulletTag = new Set<EntityId>();

  input = { up: false, down: false, left: false, right: false, shoot: false };

  missionState = 'Infiltração iniciada';
  alert = false;
  alertTimer = 0;
  alertDuration = 3;

  constructor() {
    this.loadPhase(0, false);
  }

  get phase() {
    return phases[this.phaseIndex];
  }

  get mapWidth() {
    return mapWidthPx(this.map);
  }

  get mapHeight() {
    return mapHeightPx(this.map);
  }

  createPlayer(spawn: Vec2): EntityId {
    const id = this.world.createEntity();
    this.player = id;
    this.playerTag.add(id);
    this.positions.set(id, { x: spawn.x, y: spawn.y });
    this.velocities.set(id, { x: 0, y: 0 });
    this.colliders.set(id, { w: 24, h: 24 });
    this.health.set(id, { value: 100, max: 100, invuln: 0 });
    this.weapons.set(id, { cooldown: 0, cooldownMax: 0.35, speed: 420 });
    this.directions.set(id, 'down');
    this.animation.set(id, { frame: 0, timer: 0, fps: 12, frames: 5, moving: false });
    return id;
  }

  createEnemy(config: {
    x: number;
    y: number;
    points: Vec2[];
    type: 'guard' | 'dog';
    speed: number;
    range: number;
    width: number;
    dir: Direction;
  }): EntityId {
    const id = this.world.createEntity();
    this.enemyTag.add(id);
    this.positions.set(id, { x: config.x, y: config.y });
    this.velocities.set(id, { x: 0, y: 0 });
    this.colliders.set(id, { w: 24, h: 24 });
    this.vision.set(id, { range: config.range, width: config.width });
    this.patrol.set(id, { points: config.points, index: 0 });
    this.directions.set(id, config.dir);
    this.enemy.set(id, {
      type: config.type,
      state: 'patrol',
      speed: config.speed,
      color: config.type === 'dog' ? '#ff9933' : '#f5df5d',
      alertColor: config.type === 'dog' ? '#ff5500' : '#ff2222'
    });
    if (config.type === 'guard') {
      this.weapons.set(id, { cooldown: 0, cooldownMax: 1.4, speed: 300 });
    }
    this.health.set(id, { value: 50, max: 50, invuln: 0 });
    return id;
  }

  createBullet(owner: 'player' | 'enemy', x: number, y: number, vx: number, vy: number): EntityId {
    const id = this.world.createEntity();
    this.bulletTag.add(id);
    this.positions.set(id, { x, y });
    this.velocities.set(id, { x: vx, y: vy });
    this.colliders.set(id, { w: 6, h: 6 });
    this.bullet.set(id, { owner });
    return id;
  }

  destroyEntity(id: EntityId): void {
    this.positions.delete(id);
    this.velocities.delete(id);
    this.colliders.delete(id);
    this.health.delete(id);
    this.weapons.delete(id);
    this.directions.delete(id);
    this.vision.delete(id);
    this.patrol.delete(id);
    this.animation.delete(id);
    this.enemy.delete(id);
    this.bullet.delete(id);
    this.playerTag.delete(id);
    this.enemyTag.delete(id);
    this.bulletTag.delete(id);
    this.world.destroyEntity(id);
  }

  flushDestroyed(): void {
    for (const id of this.entitiesToDestroy) this.destroyEntity(id);
    this.entitiesToDestroy.length = 0;
  }

  loadPhase(index: number, preserveHealth: boolean): void {
    this.phaseIndex = Math.max(0, Math.min(phases.length - 1, index));
    this.map = phases[this.phaseIndex].map;
    this.alert = false;
    this.alertTimer = 0;

    Array.from(this.world.entities).forEach((id) => this.destroyEntity(id));

    this.createPlayer(phases[this.phaseIndex].spawn);
    const hp = this.health.get(this.player);
    if (hp && !preserveHealth) hp.value = hp.max;

    if (this.phase.id === 1) {
      this.createEnemy({ x: 180, y: 140, points: [{ x: 180, y: 140 }, { x: 530, y: 140 }], type: 'guard', speed: 65, range: 170, width: 36, dir: 'right' });
      this.createEnemy({ x: 630, y: 380, points: [{ x: 630, y: 380 }, { x: 630, y: 620 }], type: 'guard', speed: 65, range: 170, width: 36, dir: 'down' });
      this.createEnemy({ x: 1180, y: 200, points: [{ x: 980, y: 200 }, { x: 1400, y: 200 }], type: 'guard', speed: 65, range: 170, width: 36, dir: 'right' });
      this.createEnemy({ x: 1420, y: 440, points: [{ x: 1420, y: 320 }, { x: 1420, y: 580 }], type: 'guard', speed: 65, range: 170, width: 36, dir: 'down' });
      this.missionState = 'Encontre a passagem para o canil';
      return;
    }

    this.createEnemy({ x: 250, y: 260, points: [{ x: 250, y: 260 }, { x: 540, y: 260 }], type: 'guard', speed: 65, range: 170, width: 36, dir: 'right' });
    this.createEnemy({ x: 360, y: 130, points: [{ x: 250, y: 130 }, { x: 560, y: 130 }], type: 'dog', speed: 190, range: 240, width: 60, dir: 'right' });
    this.createEnemy({ x: 470, y: 430, points: [{ x: 470, y: 430 }, { x: 470, y: 760 }], type: 'dog', speed: 190, range: 240, width: 60, dir: 'down' });
    this.missionState = 'Corra para baixo e fuja dos cães';
  }

  canMoveTo(pos: Position, col: Collider): boolean {
    return !rectHitsWall(this.map, pos.x, pos.y, col.w, col.h);
  }

  getPlayerPos(): Position {
    const p = this.positions.get(this.player);
    if (!p) throw new Error('Player position missing');
    return p;
  }

  getSnapshot(): GameSnapshot {
    const hp = this.health.get(this.player);
    const dots: RadarDot[] = [];

    const pp = this.getPlayerPos();
    dots.push({ x: pp.x / this.mapWidth, y: pp.y / this.mapHeight, color: '#00ff66', size: 6 });

    for (const id of this.enemyTag) {
      const ep = this.positions.get(id);
      const enemy = this.enemy.get(id);
      if (!ep || !enemy) continue;
      dots.push({ x: ep.x / this.mapWidth, y: ep.y / this.mapHeight, color: enemy.type === 'dog' ? '#ff7b00' : '#ffee00', size: enemy.type === 'dog' ? 5 : 4 });
    }

    return {
      health: hp?.value ?? 0,
      phaseTitle: this.phase.title,
      objective: this.phase.objective,
      alert: this.alert,
      missionState: this.missionState,
      radar: dots
    };
  }

  updateCamera(): void {
    const pp = this.getPlayerPos();
    this.camera.x = Math.max(0, Math.min(pp.x + 12 - this.camera.width / 2, this.mapWidth - this.camera.width));
    this.camera.y = Math.max(0, Math.min(pp.y + 12 - this.camera.height / 2, this.mapHeight - this.camera.height));
  }

  updateMissionProgress(): void {
    const p = this.getPlayerPos();
    if (this.phase.transition === 'right' && p.x + 24 >= this.mapWidth - 4) {
      this.loadPhase(1, true);
      this.sound.beep(880, 0.1, 0.07);
      return;
    }

    if (this.phase.transition === 'bottom' && p.y + 24 >= this.mapHeight - 4) {
      this.missionState = 'Escape concluído. Continue sobrevivendo.';
      this.sound.beep(1040, 0.2, 0.08);
      this.loadPhase(1, true);
    }
  }

  drawTilemap(ctx: CanvasRenderingContext2D): void {
    for (let y = 0; y < this.map.length; y++) {
      for (let x = 0; x < this.map[y].length; x++) {
        ctx.fillStyle = this.map[y][x] === 1 ? '#2f2f2f' : '#0d0d0d';
        ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      }
    }
  }
}
