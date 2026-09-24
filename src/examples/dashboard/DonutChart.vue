<script setup lang="ts">
import { computed } from 'vue'

export interface DonutSegment {
  label: string
  value: number
  /** Any CSS color, e.g. `var(--color-positive)`. */
  color: string
}

const props = defineProps<{
  segments: DonutSegment[]
  centerValue?: string
  centerLabel?: string
}>()

const RADIUS = 40
// Each arc is drawn with pathLength="100", so dash lengths are percentages
// of the ring; GAP leaves a small breather between neighbouring segments.
const GAP = 1.5

const total = computed(() => props.segments.reduce((sum, segment) => sum + segment.value, 0))

const arcs = computed(() => {
  let cursor = 0
  return props.segments.map((segment) => {
    const share = total.value > 0 ? (segment.value / total.value) * 100 : 0
    const length = Math.max(share - GAP, 0.5)
    const arc = {
      ...segment,
      dashArray: `${length.toFixed(2)} ${(100 - length).toFixed(2)}`,
      dashOffset: (-cursor).toFixed(2),
    }
    cursor += share
    return arc
  })
})

const ariaLabel = computed(
  () => `Distribución por estado: ${props.segments.map((s) => `${s.label} ${s.value}`).join(', ')}`,
)
</script>

<template>
  <div class="donut">
    <div class="donut__ring">
      <svg class="donut__svg" viewBox="0 0 100 100" role="img" :aria-label="ariaLabel">
        <circle class="donut__track" cx="50" cy="50" :r="RADIUS" />
        <circle
          v-for="arc in arcs"
          :key="arc.label"
          class="donut__arc"
          cx="50"
          cy="50"
          :r="RADIUS"
          pathLength="100"
          :stroke-dasharray="arc.dashArray"
          :stroke-dashoffset="arc.dashOffset"
          :style="{ stroke: arc.color }"
          transform="rotate(-90 50 50)"
        />
      </svg>
      <div class="donut__center">
        <span class="donut__center-value">{{ centerValue }}</span>
        <span class="donut__center-label">{{ centerLabel }}</span>
      </div>
    </div>
    <ul class="donut__legend">
      <li v-for="segment in segments" :key="segment.label" class="donut__legend-item">
        <span class="donut__dot" :style="{ background: segment.color }" />
        <span class="donut__legend-label">{{ segment.label }}</span>
        <span class="donut__legend-value">{{ segment.value }}</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.donut {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
}

.donut__ring {
  position: relative;
  width: 160px;
  height: 160px;
}

.donut__svg {
  display: block;
  width: 100%;
  height: 100%;
}

.donut__track {
  fill: none;
  stroke: var(--color-border);
  stroke-width: 14;
  opacity: 0.6;
}

.donut__arc {
  fill: none;
  stroke-width: 14;
}

.donut__center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.125rem;
  pointer-events: none;
}

.donut__center-value {
  font-family: var(--font-display, var(--font-body));
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text);
}

.donut__center-label {
  font-family: var(--font-body);
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.donut__legend {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
  margin: 0;
  padding: 0;
  list-style: none;
}

.donut__legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--font-body);
  font-size: 0.8125rem;
}

.donut__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.donut__legend-label {
  color: var(--color-text);
}

.donut__legend-value {
  margin-left: auto;
  font-weight: 600;
  color: var(--color-text);
}
</style>
