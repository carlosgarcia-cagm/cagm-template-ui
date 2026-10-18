<script setup lang="ts">
import { computed } from 'vue'
import Badge, { type BadgeVariant } from '@/components/atoms/Badge'
import { toLinePath } from './chart-utils'

export type StatCardLayout =
  | 'trend-inline'
  | 'trend-top'
  | 'icon-left'
  | 'hero-chart'
  | 'compact-row'
  | 'outline-card'

const props = withDefaults(
  defineProps<{
    label: string
    value: string
    trend: string
    trendVariant: Extract<BadgeVariant, 'positive' | 'negative'>
    /** Mock series rendered as an inline sparkline (viewBox `0 0 100 28`). */
    points: number[]
    /** Arrangement of the same label/value/trend/sparkline data. */
    layout?: StatCardLayout
    /** Text or emoji shown in the circular icon badge (overridable via the `icon` slot). */
    icon?: string
  }>(),
  {
    layout: 'trend-inline',
    icon: '$',
  },
)

const SPARK_WIDTH = 100
const SPARK_HEIGHT = 28

const sparkPath = computed(() => toLinePath(props.points, SPARK_WIDTH, SPARK_HEIGHT, 2))
</script>

<template>
  <article class="stat-card" :class="`stat-card--${layout}`">
    <div class="stat-card__icon" aria-hidden="true">
      <slot name="icon">{{ icon }}</slot>
    </div>

    <span class="stat-card__label">{{ label }}</span>

    <div class="stat-card__trend">
      <span
        v-if="layout === 'outline-card'"
        class="stat-card__trend-outline"
        :class="`stat-card__trend-outline--${trendVariant}`"
        >{{ trend }}</span
      >
      <Badge v-else :variant="trendVariant">{{ trend }}</Badge>
    </div>

    <span class="stat-card__value">{{ value }}</span>

    <svg
      class="stat-card__spark"
      :class="`stat-card__spark--${trendVariant}`"
      :viewBox="`0 0 ${SPARK_WIDTH} ${SPARK_HEIGHT}`"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        :d="sparkPath"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        vector-effect="non-scaling-stroke"
      />
    </svg>
  </article>
</template>

<style scoped>
.stat-card {
  display: grid;
  gap: 0.5rem;
  padding: 1.25rem;
  background: var(--color-card-elevated);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-sm);
  font-family: var(--font-body);
  color: var(--color-text);
}

/* Every layout shares these five grid items. */
.stat-card__icon {
  grid-area: icon;
}

.stat-card__label {
  grid-area: label;
}

.stat-card__trend {
  grid-area: trend;
  display: inline-flex;
  align-items: center;
}

.stat-card__value {
  grid-area: value;
  font-family: var(--font-display, var(--font-body));
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1.1;
  color: var(--color-text);
}

.stat-card__spark {
  grid-area: spark;
  display: block;
  width: 100%;
  height: 28px;
}

.stat-card__spark--positive {
  color: var(--color-positive);
}

.stat-card__spark--negative {
  color: var(--color-negative);
}

/* Circular icon badge, used by icon-left / hero-chart / compact-row. */
.stat-card__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--color-accent) 12%, transparent);
  color: var(--color-accent);
  font-size: 1.125rem;
  font-weight: 600;
  line-height: 1;
  flex-shrink: 0;
}

.stat-card__label {
  font-size: 0.8125rem;
  color: var(--color-text-muted);
}

/* 1. trend-inline — label top; value + trend on one line, sparkline right, centered. */
.stat-card--trend-inline {
  grid-template-columns: auto auto 1fr;
  grid-template-areas:
    'label label label'
    'value trend spark';
  align-items: center;
}

.stat-card--trend-inline .stat-card__icon {
  display: none;
}

.stat-card--trend-inline .stat-card__spark {
  align-self: center;
  margin-left: 0.25rem;
}

/* 2. trend-top — trend badge top-right, value on its own line, full-width sparkline. */
.stat-card--trend-top {
  grid-template-columns: 1fr auto;
  grid-template-areas:
    'label trend'
    'value value'
    'spark spark';
  align-items: center;
}

.stat-card--trend-top .stat-card__icon {
  display: none;
}

.stat-card--trend-top .stat-card__spark {
  margin-top: 0.25rem;
}

/* 3. icon-left — circular icon on the left, content stacked to its right. */
.stat-card--icon-left {
  grid-template-columns: auto 1fr;
  grid-template-areas:
    'icon label'
    'icon value'
    'icon trend'
    'icon spark';
  align-items: start;
  column-gap: 0.75rem;
}

.stat-card--icon-left .stat-card__icon {
  align-self: center;
}

.stat-card--icon-left .stat-card__trend {
  justify-self: start;
}

.stat-card--icon-left .stat-card__spark {
  margin-top: 0.125rem;
}

/* 4. hero-chart — icon + trend top-right, prominent value, tall full-width sparkline. */
.stat-card--hero-chart {
  grid-template-columns: 1fr auto auto;
  grid-template-areas:
    'label icon trend'
    'value value value'
    'spark spark spark';
  align-items: center;
}

.stat-card--hero-chart .stat-card__icon {
  width: 2rem;
  height: 2rem;
  font-size: 1rem;
  justify-self: end;
}

.stat-card--hero-chart .stat-card__trend {
  justify-self: end;
}

.stat-card--hero-chart .stat-card__value {
  font-size: 2.25rem;
}

.stat-card--hero-chart .stat-card__spark {
  height: 64px;
  margin-top: 0.5rem;
}

/* 5. compact-row — everything on a single horizontal line for dense grids. */
.stat-card--compact-row {
  grid-template-columns: auto auto auto auto 1fr;
  grid-template-areas: 'icon label value trend spark';
  align-items: center;
  gap: 0.625rem;
  padding: 0.875rem 1rem;
}

.stat-card--compact-row .stat-card__icon {
  width: 2rem;
  height: 2rem;
  font-size: 1rem;
}

.stat-card--compact-row .stat-card__label {
  font-size: 0.75rem;
}

.stat-card--compact-row .stat-card__value {
  font-size: 1.125rem;
}

.stat-card--compact-row .stat-card__spark {
  align-self: center;
}

/* 6. outline-card — label top-left, outline (ring) icon top-right, value below,
   outline trend pill bottom-left, large accent sparkline bottom-right. */
.stat-card--outline-card {
  grid-template-columns: auto 1fr;
  grid-template-areas:
    'label icon'
    'value value'
    'trend spark';
  align-items: center;
  column-gap: 0.75rem;
}

.stat-card--outline-card .stat-card__label {
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-muted);
}

/* Ring icon badge: transparent fill, accent border + icon (overrides the
   shared filled circular badge used by icon-left / hero-chart / compact-row). */
.stat-card--outline-card .stat-card__icon {
  justify-self: end;
  width: 2.25rem;
  height: 2.25rem;
  font-size: 1rem;
  background: transparent;
  border: 1.5px solid var(--color-accent);
  color: var(--color-accent);
}

.stat-card--outline-card .stat-card__trend {
  justify-self: start;
}

/* Local outline pill for this layout only. Deliberately NOT the shared Badge
   atom (which is filled); keeps every other Badge usage in the app untouched. */
.stat-card__trend-outline {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: var(--radius-badge);
  border: 1.5px solid currentColor;
  background: transparent;
  font-family: var(--font-body);
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1.4;
  white-space: nowrap;
}

.stat-card__trend-outline--positive {
  color: var(--color-positive);
}

.stat-card__trend-outline--negative {
  color: var(--color-negative);
}

/* Sparkline stays accent here regardless of trend direction — trend is
   communicated by the outline pill's color, not the line color. */
.stat-card--outline-card .stat-card__spark {
  height: 44px;
  align-self: end;
  color: var(--color-accent);
}
</style>
