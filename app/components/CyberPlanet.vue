<template>
  <div class="app-wrapper">
    <div ref="canvasContainer" class="canvas-container"></div>
    <div class="tech-overlay">
      <div class="panel">
        <h3>CYBER_PLANET // CRISP</h3>
        <p>Terrain: <span class="highlight">Ridged multifractal</span></p>
        <p>Style: <span class="highlight">Topo bands + atmo shell</span></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useCyberPlanet } from '../composables/useCyberPlanet'

const canvasContainer = ref(null)
useCyberPlanet(canvasContainer)
</script>

<style scoped>
.app-wrapper { position: relative; width: 100vw; height: 100vh; overflow: hidden; background: #020208; }
.canvas-container { position: absolute; inset: 0; z-index: 1; }
.tech-overlay { position: absolute; top: 2rem; left: 2rem; z-index: 2; pointer-events: none; user-select: none; }
.panel { background: rgba(5, 5, 15, 0.75); border: 1px solid rgba(0, 200, 255, 0.25); box-shadow: 0 0 40px rgba(0, 200, 255, 0.1); backdrop-filter: blur(12px); padding: 1.2rem 1.5rem; border-radius: 8px; color: #fff; font-family: monospace; }
h3 { margin: 0 0 0.8rem 0; font-size: 0.9rem; letter-spacing: 2px; color: #00e1ff; text-transform: uppercase; border-bottom: 1px solid rgba(0, 225, 255, 0.15); padding-bottom: 0.7rem; }
p { margin: 0.4rem 0; font-size: 0.78rem; color: #7a8a9a; }
.highlight { color: #00ff88; }
</style>