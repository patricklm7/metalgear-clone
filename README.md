# Operação Infiltração (TypeScript + Vite + Vue)

Refatoração arquitetural completa com foco em **modularidade**, **performance** e **legibilidade**.

## Stack

- TypeScript
- Vite
- Vue 3
- ECS-inspired game architecture

## Scripts

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Arquitetura

- `src/engine/core`: estado global e loop do jogo
- `src/engine/systems`: sistemas ECS (input, IA, movimento, combate, animação e render)
- `src/engine/services`: tilemap/collision e sound
- `src/ui/components`: HUD e radar em Vue
- `src/App.vue`: composição da UI + canvas

## Features

- Engine desacoplada da UI
- IA de stealth com visão cônica, patrulha e perseguição
- Sistema de armas e projéteis (player e guardas)
- Cães mais rápidos (sem tiro), para pressão de fuga
- Radar em tempo real
- Tilemap com colisão
- Sprite animation procedural estilo stealth soldier
- Fluxo em duas fases com transição jogável
