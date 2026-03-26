<script setup lang="ts">
import type { GameSnapshot } from '../../engine/types';

defineProps<{ snapshot: GameSnapshot }>();
</script>

<template>
  <div class="radar">
    <div
      v-for="(dot, index) in snapshot.radar"
      :key="index"
      class="dot"
      :style="{
        left: `${Math.max(0, Math.min(1, dot.x)) * 100}%`,
        top: `${Math.max(0, Math.min(1, dot.y)) * 100}%`,
        background: dot.color,
        width: `${dot.size}px`,
        height: `${dot.size}px`
      }"
    />
  </div>
</template>

<style scoped>
.radar {
  position: absolute;
  right: 10px;
  bottom: 10px;
  width: 120px;
  height: 120px;
  border: 2px solid #00ff88;
  background: #001a10;
  overflow: hidden;
}

.dot {
  position: absolute;
  transform: translate(-50%, -50%);
  border-radius: 999px;
}
</style>
