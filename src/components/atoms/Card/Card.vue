<script setup lang="ts">
export type CardVariant = 'raised' | 'flat'
export type CardPadding = 'none' | 'sm' | 'md' | 'lg'

withDefaults(
  defineProps<{
    variant?: CardVariant
    padding?: CardPadding
  }>(),
  {
    variant: 'raised',
    padding: 'md',
  },
)
</script>

<template>
  <div
    class="cagm-card"
    :class="[`cagm-card--${variant}`, `cagm-card--padding-${padding}`]"
  >
    <header
      v-if="$slots.header || $slots.title || $slots.subtitle || $slots.actions"
      class="cagm-card__header"
    >
      <slot name="header">
        <div class="cagm-card__header-main">
          <div v-if="$slots.title" class="cagm-card__title">
            <slot name="title" />
          </div>
          <div v-if="$slots.subtitle" class="cagm-card__subtitle">
            <slot name="subtitle" />
          </div>
        </div>
        <div v-if="$slots.actions" class="cagm-card__actions">
          <slot name="actions" />
        </div>
      </slot>
    </header>

    <div class="cagm-card__body">
      <slot />
    </div>

    <footer v-if="$slots.footer" class="cagm-card__footer">
      <slot name="footer" />
    </footer>
  </div>
</template>

<style scoped>
/*
 * Card surface. Follows the shared per-category surface-token pattern used
 * by Button/Input: the border reads --surface-border-width-card /
 * --surface-border-color-card, so [data-surface-card] (or the global
 * [data-surface] fallback) can tune the card independently — without a
 * parallel token system. The variant only chooses the base elevation fill:
 *   - raised: the "elevated hero/KPI card" surface (--color-card-elevated)
 *     plus --shadow-md.
 *   - flat:   the general raised surface (--color-surface-raised), no shadow.
 */
.cagm-card {
  --cagm-card-pad: var(--card-padding, 1.5rem);
  position: relative;
  display: block;
  width: 100%;
  box-sizing: border-box;
  border-radius: var(--radius-card);
  border-style: solid;
  border-width: var(--surface-border-width-card, 0px);
  border-color: var(--surface-border-color-card, transparent);
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.cagm-card--raised {
  background: var(--color-card-elevated);
  box-shadow: var(--shadow-md);
}

.cagm-card--flat {
  background: var(--color-surface-raised);
  box-shadow: none;
}

/* Density-aware padding. Consumes --card-padding[-sm|-lg] when a density
 * axis defines them; otherwise falls back to sane rem defaults. */
.cagm-card--padding-none {
  --cagm-card-pad: 0;
}

.cagm-card--padding-sm {
  --cagm-card-pad: var(--card-padding-sm, 1rem);
}

.cagm-card--padding-md {
  --cagm-card-pad: var(--card-padding, 1.5rem);
}

.cagm-card--padding-lg {
  --cagm-card-pad: var(--card-padding-lg, 2rem);
}

.cagm-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: var(--cagm-card-pad) var(--cagm-card-pad) 0;
}

.cagm-card__header-main {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.cagm-card__title {
  font-family: var(--font-display);
  font-size: 1.125rem;
  font-weight: 600;
  line-height: 1.3;
  color: var(--color-text);
}

.cagm-card__subtitle {
  font-size: 0.875rem;
  line-height: 1.4;
  color: var(--color-text-muted);
}

.cagm-card__actions {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.cagm-card__body {
  padding: var(--cagm-card-pad);
}

.cagm-card__footer {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0 var(--cagm-card-pad) var(--cagm-card-pad);
}
</style>
