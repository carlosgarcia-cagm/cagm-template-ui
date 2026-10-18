<script setup lang="ts">
import { computed, ref, useSlots } from 'vue'

/**
 * Standard HTML input types accepted by the Input atom.
 * Exported so composite components (e.g. FormField) and future form
 * consumers can share a single source of truth instead of redeclaring
 * the union inline.
 */
export type InputType =
  | 'text'
  | 'email'
  | 'password'
  | 'tel'
  | 'url'
  | 'number'
  | 'search'

// `inheritAttrs: false` + the `v-bind="$attrs"` on the inner <input> below
// forward non-prop HTML attributes (name, autocomplete, required, min,
// max, pattern, inputmode, form, list, …) directly to the native input
// element. Without this, the template's single root
// (<div class="cagm-input-wrapper">) would silently swallow those attrs,
// breaking form submission, autofill, and native validation. Pure ARIA /
// data attributes also flow through this path.
defineOptions({ inheritAttrs: false })

withDefaults(
  defineProps<{
    id?: string
    placeholder?: string
    disabled?: boolean
    error?: boolean
    type?: InputType
  }>(),
  {
    id: undefined,
    placeholder: '',
    disabled: false,
    error: false,
    type: 'text',
  },
)

const modelValue = defineModel<string>({ default: '' })

const slots = useSlots()
const hasLeading = computed(() => !!slots.leading)
const hasTrailing = computed(() => !!slots.trailing)

interface Ripple {
  id: number
  x: number
  y: number
  size: number
}

const wrapperRef = ref<HTMLDivElement | null>(null)
const ripples = ref<Ripple[]>([])
let rippleIdCounter = 0

function onPointerDown(event: PointerEvent) {
  // Only respond to primary button / single touch / pen contact.
  if (event.button !== 0) return
  const el = wrapperRef.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  // Ripple diameter = distance from the click point to the farthest wrapper
  // corner, doubled so the expanding circle fully covers the field from any
  // click position.
  const dx = Math.max(x, rect.width - x)
  const dy = Math.max(y, rect.height - y)
  const size = Math.hypot(dx, dy) * 2
  ripples.value.push({
    id: ++rippleIdCounter,
    x,
    y,
    size,
  })
}

function onRippleEnd(event: AnimationEvent) {
  const target = event.target as HTMLElement
  const id = Number(target.dataset.rippleId)
  if (!Number.isNaN(id)) {
    ripples.value = ripples.value.filter((r) => r.id !== id)
  }
}
</script>

<template>
  <div
    ref="wrapperRef"
    class="cagm-input-wrapper"
    :class="{ 'is-error': error }"
    @pointerdown="onPointerDown"
  >
    <span v-if="hasLeading" class="cagm-input__leading">
      <slot name="leading" />
    </span>
    <input
      v-bind="$attrs"
      v-model="modelValue"
      :id="id"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :aria-invalid="error || undefined"
      class="cagm-input"
      :class="{
        'is-error': error,
        'has-leading': hasLeading,
        'has-trailing': hasTrailing,
      }"
    />
    <span v-if="hasTrailing" class="cagm-input__trailing">
      <slot name="trailing" />
    </span>
    <span
      v-for="ripple in ripples"
      :key="ripple.id"
      class="cagm-input__ripple"
      :data-ripple-id="ripple.id"
      :style="{
        left: `${ripple.x}px`,
        top: `${ripple.y}px`,
        width: `${ripple.size}px`,
        height: `${ripple.size}px`,
      }"
      @animationend="onRippleEnd"
    />
  </div>
</template>

<style scoped>
/*
 * Wrapper exists to (a) host absolutely-positioned icon slots + ripple
 * elements, (b) clip the ripple to the rounded corners, and (c) draw the
 * focus ring via :focus-within so it isn't clipped by overflow:hidden
 * (which would happen if the box-shadow stayed on the inner <input>).
 */
.cagm-input-wrapper {
  position: relative;
  display: block;
  /*
   * min-width: 0 overrides the flex/grid item default of `min-width: auto`,
   * which would otherwise refuse to shrink this wrapper below its content's
   * intrinsic size. Without it, a long placeholder/value (e.g. an email
   * like "you@example.com") inside a flex/grid parent — FormField, SearchBox,
   * Playground, login forms — forces the parent to overflow at narrow
   * viewports instead of the input gracefully clipping.
   * max-width: 100% is its belt-and-braces partner: even in a non-flex
   * context the wrapper should never grow wider than whatever contains it.
   */
  min-width: 0;
  max-width: 100%;
  border-radius: var(--radius-input);
  overflow: hidden;
  transition: box-shadow 120ms ease;
}

.cagm-input-wrapper:focus-within {
  box-shadow: var(--focus-ring);
}

.cagm-input-wrapper.is-error:focus-within {
  box-shadow: var(--focus-ring);
}

.cagm-input {
  width: 100%;
  /*
   * See .cagm-input-wrapper above for the overflow story. The wrapper
   * already gets min-width:0 from its parent context, but the <input>
   * itself also defaults to min-width: auto and can still push past its
   * container if its intrinsic content (long value, long placeholder) is
   * wider than the wrapper. max-width:100% caps it to the wrapper, so a
   * long email like "you@example.com" clips inside the field rather than
   * blowing out the row.
   */
  max-width: 100%;
  display: block;
  font-family: var(--font-body);
  font-size: 0.9375rem;
  color: var(--color-text);
  background: var(--color-surface);
  border: var(--surface-border-width-input) solid var(--color-border);
  border-radius: var(--radius-input);
  padding: 0.5rem 0.75rem;
  outline: none;
  box-shadow: none;
  transition:
    border-color 120ms ease,
    box-shadow 120ms ease,
    background-color 120ms ease;
}

.cagm-input::placeholder {
  color: var(--color-text-muted);
}

/* Reserve room on the side that has an icon slot. */
.cagm-input.has-leading {
  padding-left: 2.25rem;
}

.cagm-input.has-trailing {
  padding-right: 2.25rem;
}

.cagm-input:hover:not(:disabled) {
  background: linear-gradient(
      var(--state-layer-hover),
      var(--state-layer-hover)
    ),
    var(--color-surface);
}

.cagm-input:focus {
  border-color: var(--color-primary);
  /* Box-shadow (focus ring) is rendered on the wrapper via :focus-within so
   * it isn't clipped by the wrapper's overflow: hidden (which we need for
   * the ripple). Background stays on the neutral --color-surface (matching
   * the resting state) so hovering/clicking the input never shifts it back
   * to the brand-tinted surface axis — only the border + --state-layer-focus
   * overlay carry the primary accent on focus. */
  background: linear-gradient(
      var(--state-layer-focus),
      var(--state-layer-focus)
    ),
    var(--color-surface);
}

.cagm-input:active:not(:disabled) {
  background: linear-gradient(
      var(--state-layer-pressed),
      var(--state-layer-pressed)
    ),
    var(--color-surface);
}

.cagm-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.cagm-input.is-error {
  border-color: var(--color-negative);
  color: var(--color-negative);
}

.cagm-input.is-error:focus {
  border-color: var(--color-negative);
  background: linear-gradient(
      var(--state-layer-focus),
      var(--state-layer-focus)
    ),
    var(--surface-tonal-bg-input);
}

/*
 * Icon slot decoration. Sits inside the wrapper (so overflow: hidden clips
 * it to the rounded corners), vertically centered, color falls back to
 * muted text so the icon reads as a decoration rather than an actionable
 * accent-colored element — but uses currentColor so consumers can override
 * the color on their own icon (e.g. <Icon style="color:var(--color-accent)">).
 * pointer-events:none so clicks pass through to the input below.
 */
.cagm-input__leading,
.cagm-input__trailing {
  position: absolute;
  top: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  color: var(--color-text-muted);
  pointer-events: none;
  z-index: 1;
  transform: translateY(-50%);
}

.cagm-input__leading {
  left: 0.75rem;
}

.cagm-input__trailing {
  right: 0.75rem;
}

.cagm-input__leading :deep(svg),
.cagm-input__trailing :deep(svg) {
  width: 100%;
  height: 100%;
  fill: currentColor;
}

/*
 * Ripple. Rendered as absolutely-positioned spans inside the wrapper, with
 * overflow:hidden on the wrapper keeping the animation inside the rounded
 * corners. Per-ripple key + animationend listener cleans each one out of the
 * array after its CSS animation completes, so the DOM stays tidy.
 */
.cagm-input__ripple {
  position: absolute;
  border-radius: 50%;
  background: var(--ripple-color);
  pointer-events: none;
  transform: translate(-50%, -50%) scale(0);
  opacity: 0.6;
  animation: cagm-input-ripple var(--ripple-duration) var(--ripple-easing)
    forwards;
}

@keyframes cagm-input-ripple {
  to {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0;
  }
}
</style>