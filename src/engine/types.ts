export type EntityId = number;

export type Direction = 'up' | 'down' | 'left' | 'right';

export interface Vec2 {
  x: number;
  y: number;
}

export interface GameSnapshot {
  health: number;
  phaseTitle: string;
  objective: string;
  alert: boolean;
  missionState: string;
  radar: RadarDot[];
}

export interface RadarDot {
  x: number;
  y: number;
  color: string;
  size: number;
}

export interface CameraState {
  x: number;
  y: number;
  width: number;
  height: number;
}
