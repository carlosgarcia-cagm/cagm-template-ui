<script setup lang="ts">
import { computed } from 'vue'
import { toAreaPath, toLinePath } from './chart-utils'

const props = withDefaults(
  defineProps<{
    values: number[]
    /** Optional captions rendered under the chart (e.g. first/middle/last). */
    labels?: string[]
    width?: number
    height?: number
  }>(),
  {
    labels: () => [],
    width: 300,
    height: 120,
  },
)

const PADDING = 8

const linePath = computed(() => toLinePath(props.values, props.width, props.height, PADDING))
const areaPath = computed(() => toAreaPath(props.values, props.width, props.height, PADDING))
const gridLines = computed(() =>
  [0.25, 0.5, 0.75].map((ratio) => Number((props.height * ratio).toFixed(2))),
)
const ariaLabel = computed(() => {
  if (props.values.length === 0) return 'Serie sin datos'
  return `Serie de ${props.values.length} puntos, entre ${Math.min(...props.values)} y ${Math.max(...props.values)}`
})
</script>

<template>
  <div class="line-chart">
    <svg
      class="line-chart__svg"
      :viewBox="`0 0 ${width} ${height}`"
      :style="{ height: `${height}px` }"
      preserveAspectRatio="none"
      role="img"
      :aria-label="ariaLabel"
    >
      <line
        v-for="y in gridLines"
        :key="y"
        class="line-chart__grid"
        :x1="0"
        :x2="width"
        :y1="y"
        :y2="y"
        vector-effect="non-scaling-stroke"
      />
      <path v-if="areaPath" class="line-chart__area" :d="areaPath" />
      <path
        v-if="linePath"
        class="line-chart__line"
        :d="linePath"
        fill="none"
        stroke-linecap="round"
        stroke-linejoin="round"
        vector-effect="non-scaling-stroke"
      />
    </svg>
    <div v-if="labels.length" class="line-chart__axis" aria-hidden="true">
      <span v-for="(label, index) in labels" :key="index">{{ label }}</span>
    </div>
  </div>
</template>

<style scoped>
.line-chart {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.line-chart__svg {
  display: block;
  width: 100%;
}

.line-chart__grid {
  stroke: var(--color-border);
  stroke-width: 1;
  stroke-dasharray: 3 4;
}

.line-chart__area {
  fill: var(--color-accent);
  opacity: 0.12;
}

.line-chart__line {
  stroke: var(--color-accent);
  stroke-width: 2;
}

.line-chart__axis {
  display: flex;
  justify-content: space-between;
  font-family: var(--font-body);
  font-size: 0.75rem;
  color: var(--color-text-muted);
}
</style>
