<script setup lang="ts">
import { computed, ref } from "vue";
import { useTheme } from "@/theme/useTheme";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";
export type ButtonAs = string | object;

export interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  /**
   * Element or component to render as (e.g. `'button'`, `'a'`, `RouterLink`).
   * Defaults to a native `<button>`; when a different element is provided the
   * button keeps its classes, ripple and click behaviour but drops the
   * native-only `type`/`disabled` attributes in favour of `aria-disabled`.
   */
  as?: ButtonAs;
}

// `size` is accepted for backward compatibility with existing call sites but
// is intentionally ignored: button size is a single global theme axis
// (`buttonSize` from useTheme()), not a per-instance override, so every
// <Button> stays in sync when the user changes "Button size" in the Theme
// Settings drawer.
const props = withDefaults(defineProps<ButtonProps>(), {
  variant: "primary",
  disabled: false,
  loading: false,
  as: "button",
});

const { buttonSize } = useTheme();

const effectiveSize = computed<ButtonSize>(() => buttonSize.value);

// Only a real <button> accepts `type`/`disabled` natively. When rendering as
// any other element (anchor, RouterLink, custom component) those attributes are
// dropped and `aria-disabled` + an event guard carry the disabled semantics.
const isNativeButton = computed(() => props.as === "button");
const isDisabled = computed(() => props.disabled || props.loading);

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

interface Ripple {
  id: number;
  x: number;
  y: number;
  size: number;
}

const ripples = ref<Ripple[]>([]);
let nextRippleId = 0;

function onClick(event: MouseEvent) {
  // Non-native elements (links/components) still fire click while "disabled",
  // so guard before emitting — mirrors the native `disabled` behaviour.
  if (isDisabled.value) {
    event.preventDefault();
    return;
  }
  emit("click", event);
}

function onPointerDown(event: PointerEvent) {
  if (event.button !== 0 || isDisabled.value) return;
  const target = event.currentTarget as HTMLElement | null;
  if (!target) return;
  const rect = target.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const dx = Math.max(x, rect.width - x);
  const dy = Math.max(y, rect.height - y);
  const radius = Math.hypot(dx, dy);
  ripples.value.push({
    id: nextRippleId++,
    x: x - radius,
    y: y - radius,
    size: radius * 2,
  });
}

function removeRipple(id: number) {
  const idx = ripples.value.findIndex((r) => r.id === id);
  if (idx >= 0) ripples.value.splice(idx, 1);
}
</script>

<template>
  <component
    :is="as"
    class="cagm-button flex items-center justify-center gap-2"
    :class="[`cagm-button--${variant}`, `cagm-button--${effectiveSize}`]"
    :type="isNativeButton ? 'button' : undefined"
    :disabled="isNativeButton ? isDisabled : undefined"
    :aria-busy="loading"
    :aria-disabled="!isNativeButton && isDisabled ? 'true' : undefined"
    @click="onClick"
    @pointerdown="onPointerDown"
  >
    <span v-if="loading" class="cagm-button__spinner" aria-hidden="true" />
    <span v-if="$slots.leading" class="cagm-button__leading">
      <slot name="leading" />
    </span>
    <slot />
    <span v-if="$slots.trailing" class="cagm-button__trailing">
      <slot name="trailing" />
    </span>
    <span class="cagm-button__ripple-host" aria-hidden="true">
      <span
        v-for="ripple in ripples"
        :key="ripple.id"
        class="cagm-button__ripple"
        :style="{
          left: ripple.x + 'px',
          top: ripple.y + 'px',
          width: ripple.size + 'px',
          height: ripple.size + 'px',
        }"
        @animationend="removeRipple(ripple.id)"
      />
    </span>
  </component>
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

/* Icon slots — keep icon content on the shared flex baseline and prevent it
 * from shrinking when the label wraps. */
.cagm-button__leading,
.cagm-button__trailing {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
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
  background: var(--color-primary);
  color: var(--color-on-primary);
  box-shadow: var(--shadow-button-primary);
}

.cagm-button--primary:hover:not(:disabled) {
  background: var(--color-primary-hover);
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
  background: var(--color-primary-active);
}

.cagm-button--primary:active:not(:disabled)::before {
  background: var(--state-layer-pressed);
}

/* Secondary / tonal — driven by the per-category button surface axis so
 * [data-surface-button] (or the global [data-surface] fallback) chooses
 * between outlined (1px border, flat bg) and filled (no border, accent
 * tint) — Material's real tonal-button taxonomy.
 *
 * The Secondary brand color is a first-class consumer here: the label uses
 * the WCAG-AA-safe `--color-secondary-text` shade and the border uses
 * `--color-secondary-600` from the new 9-step secondary scale, so changing
 * the Secondary picker is unmistakable (not just a faint tonal tint). The
 * resting background still comes from the surface axis, so the
 * outlined/flat/filled taxonomy is preserved. */
.cagm-button--secondary {
  background: var(--surface-tonal-bg-button);
  color: var(--color-secondary-text);
  border-color: var(--color-secondary-600);
  border-width: var(--surface-border-width-button);
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

/* Ripple (Material ink). The host clips ripple overflow to the rounded
 * corners while the button itself stays `overflow: visible` so the
 * focus-ring box-shadow can render outside the border. */
.cagm-button__ripple-host {
  position: absolute;
  inset: 0;
  overflow: hidden;
  border-radius: inherit;
  pointer-events: none;
}

.cagm-button__ripple {
  position: absolute;
  border-radius: 50%;
  background: var(--ripple-color);
  transform: scale(0);
  animation: cagm-button-ripple var(--ripple-duration) var(--ripple-easing)
    forwards;
}

@keyframes cagm-button-ripple {
  to {
    transform: scale(1);
    opacity: 0;
  }
}

/* Motion-sensitivity guard: neutralise the ripple and the looping spinner,
 * matching the reduced-motion pattern used by DashboardLayout/ThemeMatrixDialog. */
@media (prefers-reduced-motion: reduce) {
  .cagm-button {
    --ripple-duration: 0ms;
    transition: none;
  }

  .cagm-button__spinner {
    animation: none;
  }
}
</style>