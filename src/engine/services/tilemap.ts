import type { Vec2 } from '../types';

export const TILE_SIZE = 32;

export interface PhaseConfig {
  id: number;
  title: string;
  objective: string;
  map: number[][];
  spawn: Vec2;
  transition: 'right' | 'bottom';
}

const buildMap = (width: number, height: number): number[][] => {
  const map: number[][] = [];
  for (let y = 0; y < height; y++) {
    const row: number[] = [];
    for (let x = 0; x < width; x++) {
      row.push(x === 0 || y === 0 || x === width - 1 || y === height - 1 ? 1 : 0);
    }
    map.push(row);
  }
  return map;
};

const wall = (map: number[][], x: number, y: number, w: number, h: number): void => {
  for (let ry = y; ry < y + h; ry++) {
    for (let rx = x; rx < x + w; rx++) map[ry][rx] = 1;
  }
};

const map1 = (() => {
  const m = buildMap(50, 24);
  wall(m, 6, 5, 9, 1);
  wall(m, 19, 8, 1, 8);
  wall(m, 26, 4, 12, 1);
  wall(m, 33, 10, 1, 9);
  m[Math.floor(m.length / 2)][m[0].length - 1] = 0;
  return m;
})();

const map2 = (() => {
  const m = buildMap(26, 28);
  wall(m, 3, 6, 20, 1);
  wall(m, 3, 13, 20, 1);
  wall(m, 3, 20, 20, 1);
  const center = Math.floor(m[0].length / 2);
  m[0][center] = 0;
  m[m.length - 1][center] = 0;
  return m;
})();

export const phases: PhaseConfig[] = [
  {
    id: 1,
    title: 'FASE 1',
    objective: 'Encontre a saída no lado direito',
    map: map1,
    spawn: { x: 64, y: 64 },
    transition: 'right'
  },
  {
    id: 2,
    title: 'FASE 2',
    objective: 'Desça e escape dos cães',
    map: map2,
    spawn: { x: 12 * TILE_SIZE, y: 64 },
    transition: 'bottom'
  }
];

export const mapWidthPx = (map: number[][]): number => map[0].length * TILE_SIZE;
export const mapHeightPx = (map: number[][]): number => map.length * TILE_SIZE;

export const isWallAt = (map: number[][], x: number, y: number): boolean => {
  const tx = Math.floor(x / TILE_SIZE);
  const ty = Math.floor(y / TILE_SIZE);
  if (ty < 0 || ty >= map.length || tx < 0 || tx >= map[0].length) return true;
  return map[ty][tx] === 1;
};

export const rectHitsWall = (map: number[][], x: number, y: number, w: number, h: number): boolean => {
  const points = [
    { x, y },
    { x: x + w - 1, y },
    { x, y: y + h - 1 },
    { x: x + w - 1, y: y + h - 1 }
  ];

  return points.some((p) => isWallAt(map, p.x, p.y));
};
