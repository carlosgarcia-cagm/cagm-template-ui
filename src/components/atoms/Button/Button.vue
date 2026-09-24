<script setup lang="ts">
export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

withDefaults(
  defineProps<{
    variant?: ButtonVariant;
    size?: ButtonSize;
    disabled?: boolean;
    loading?: boolean;
  }>(),
  {
    variant: "primary",
    size: "md",
    disabled: false,
    loading: false,
  },
);

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

function onClick(event: MouseEvent) {
  emit("click", event);
}
</script>

<template>
  <button
    class="cagm-button flex items-center justify-center gap-2"
    :class="[`cagm-button--${variant}`, `cagm-button--${size}`]"
    :disabled="disabled || loading"
    :aria-busy="loading"
    type="button"
    @click="onClick"
  >
    <span v-if="loading" class="cagm-button__spinner" aria-hidden="true" />
    <slot />
  </button>
</template>

<style scoped>
.cagm-button {
  position: relative;
  font-family: var(--font-body);
  font-weight: 600;
  line-height: 1;
  border-radius: var(--radius-button);
  border: 1.5px solid transparent;
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease,
    box-shadow 0.15s ease,
    opacity 0.15s ease;
  isolation: isolate;
}

.cagm-button::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: transparent;
  pointer-events: none;
  z-index: -1;
  transition: background-color 0.15s ease;
}

.cagm-button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

/* Sizes */
.cagm-button--sm {
  font-size: 0.8125rem;
  padding: 0.375rem 0.75rem;
}

.cagm-button--md {
  font-size: 0.9375rem;
  padding: 0.5rem 1rem;
}

.cagm-button--lg {
  font-size: 1.0625rem;
  padding: 0.75rem 1.5rem;
}

/* Primary / filled */
.cagm-button--primary {
  background: var(--color-accent);
  color: var(--color-on-accent);
  box-shadow: var(--shadow-button-primary);
}

.cagm-button--primary:hover:not(:disabled) {
  background: var(--color-accent-hover);
}

.cagm-button--primary:hover:not(:disabled)::before {
  background: var(--state-layer-hover);
}

.cagm-button--primary:focus-visible {
  outline: none;
  box-shadow:
    var(--shadow-button-primary),
    var(--focus-ring);
}

.cagm-button--primary:focus-visible::before {
  background: var(--state-layer-focus);
}

.cagm-button--primary:active:not(:disabled) {
  background: var(--color-accent-active);
}

.cagm-button--primary:active:not(:disabled)::before {
  background: var(--state-layer-pressed);
}

/* Secondary / outlined */
.cagm-button--secondary {
  background: transparent;
  color: var(--color-text);
  border-color: var(--color-border);
}

.cagm-button--secondary:hover:not(:disabled)::before {
  background: var(--state-layer-hover);
}

.cagm-button--secondary:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}

.cagm-button--secondary:focus-visible::before {
  background: var(--state-layer-focus);
}

.cagm-button--secondary:active:not(:disabled)::before {
  background: var(--state-layer-pressed);
}

/* Ghost / text */
.cagm-button--ghost {
  background: transparent;
  color: var(--color-text);
  border-color: transparent;
}

.cagm-button--ghost:hover:not(:disabled)::before {
  background: var(--state-layer-hover);
}

.cagm-button--ghost:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}

.cagm-button--ghost:focus-visible::before {
  background: var(--state-layer-focus);
}

.cagm-button--ghost:active:not(:disabled)::before {
  background: var(--state-layer-pressed);
}

/* Loading spinner */
.cagm-button__spinner {
  display: inline-block;
  width: 0.9em;
  height: 0.9em;
  border-radius: 50%;
  border: 2px solid currentColor;
  border-top-color: transparent;
  opacity: 0.85;
  animation: cagm-button-spin 0.6s linear infinite;
}

@keyframes cagm-button-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
