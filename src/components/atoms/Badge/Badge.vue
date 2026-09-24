<script setup lang="ts">
export type BadgeVariant = 'neutral' | 'positive' | 'negative' | 'warning' | 'info'

withDefaults(
  defineProps<{
    variant?: BadgeVariant
  }>(),
  {
    variant: 'neutral',
  },
)
</script>

<template>
  <span class="badge inline-flex items-center gap-1" :class="`badge--${variant}`">
    <slot />
  </span>
</template>

<style scoped>
.badge {
  border-radius: var(--radius-badge);
  border: 1px solid transparent;
  padding: 2px 8px;
  font-family: var(--font-body);
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1.4;
  white-space: nowrap;
}

.badge--neutral {
  background: var(--color-surface-raised);
  color: var(--color-text-muted);
  border-color: var(--color-border);
}

.badge--positive {
  background: var(--color-positive-bg);
  color: var(--color-positive);
  border-color: var(--color-positive);
}

.badge--negative {
  background: var(--color-negative-bg);
  color: var(--color-negative);
  border-color: var(--color-negative);
}

.badge--warning {
  background: var(--color-warning-bg);
  color: var(--color-warning);
  border-color: var(--color-warning);
}

.badge--info {
  background: var(--color-info-bg);
  color: var(--color-info);
  border-color: var(--color-info);
}
</style>
