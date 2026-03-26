<script setup lang="ts">
import type { GameSnapshot } from '../../engine/types';

defineProps<{ snapshot: GameSnapshot }>();
</script>

<template>
  <div class="hud">
    <div class="line">VIDA: {{ snapshot.health }}</div>
    <div class="line">{{ snapshot.phaseTitle }} — {{ snapshot.objective }}</div>
    <div class="line" :class="{ alert: snapshot.alert }">{{ snapshot.alert ? '!!! ALERTA !!!' : snapshot.missionState }}</div>
  </div>
</template>

<style scoped>
.hud {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding: 6px;
  background: rgba(0, 0, 0, 0.6);
  color: #00ff88;
  font-size: 12px;
  display: grid;
  gap: 2px;
}

.line.alert {
  color: #ff3b3b;
  animation: blink 0.45s infinite;
}

@keyframes blink {
  0%,
  100% { opacity: 1; }
  50% { opacity: 0.35; }
}
</style>
