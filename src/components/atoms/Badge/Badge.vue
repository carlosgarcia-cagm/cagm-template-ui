<script setup lang="ts">
export type BadgeVariant = 'neutral' | 'positive' | 'negative' | 'warning' | 'info'
export type BadgeAppearance = 'filled' | 'outline'
export type BadgeSize = 'sm' | 'md' | 'lg'

withDefaults(
  defineProps<{
    variant?: BadgeVariant
    appearance?: BadgeAppearance
    size?: BadgeSize
  }>(),
  {
    variant: 'neutral',
    appearance: 'filled',
    size: 'md',
  },
)
</script>

<template>
  <span
    class="badge inline-flex items-center gap-1"
    :class="[`badge--${variant}`, `badge--${appearance}`, `badge--size-${size}`]"
  >
    <span v-if="$slots.leading" class="badge__leading">
      <slot name="leading" />
    </span>
    <slot />
  </span>
</template>

<style scoped>
.badge {
  border-radius: var(--radius-badge);
  /* All variants share the same border geometry, driven by the global
   * surface axis: 0px in "flat", 1px in "outlined". Variant rules below
   * only set border-color, never a hardcoded width. */
  border-style: solid;
  border-width: var(--surface-border-width);
  border-color: transparent;
  font-family: var(--font-body);
  font-weight: 600;
  line-height: 1.4;
  white-space: nowrap;
}

/* Sizes (md matches the historical default padding/type scale). */
.badge--size-sm {
  padding: 1px 6px;
  font-size: 0.6875rem;
}

.badge--size-md {
  padding: 2px 8px;
  font-size: 0.75rem;
}

.badge--size-lg {
  padding: 3px 10px;
  font-size: 0.8125rem;
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

/* Appearance: outline — explicit visible border on a transparent surface,
 * independent of the filled tonal background (and of the surface axis). */
.badge--outline {
  background: transparent;
  border-width: 1px;
}

.badge__leading {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
</style>
