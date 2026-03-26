<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref } from 'vue';
import { GameEngine } from './engine/gameEngine';
import type { GameSnapshot } from './engine/types';
import HudPanel from './ui/components/HudPanel.vue';
import RadarPanel from './ui/components/RadarPanel.vue';

const canvasRef = ref<HTMLCanvasElement | null>(null);
const snapshot = reactive<GameSnapshot>({
  health: 100,
  phaseTitle: 'FASE 1',
  objective: 'Iniciando',
  alert: false,
  missionState: 'Aguardando engine',
  radar: []
});

let engine: GameEngine | null = null;
let unsubscribe: (() => void) | null = null;

onMounted(() => {
  if (!canvasRef.value) return;

  engine = new GameEngine(canvasRef.value);
  unsubscribe = engine.subscribe((data) => Object.assign(snapshot, data));
  engine.start();
});

onUnmounted(() => {
  unsubscribe?.();
  engine?.stop();
});
</script>

<template>
  <div class="page">
    <div class="game-shell">
      <HudPanel :snapshot="snapshot" />
      <canvas ref="canvasRef" width="800" height="600" />
      <RadarPanel :snapshot="snapshot" />
    </div>
  </div>
</template>

<style scoped>
.page {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0a0a0a;
}

.game-shell {
  position: relative;
  border: 4px solid #00ff88;
  box-shadow: 0 0 10px #00ff88, inset 0 0 10px #003322;
}

canvas {
  background: #111;
  display: block;
  image-rendering: pixelated;
}
</style>
