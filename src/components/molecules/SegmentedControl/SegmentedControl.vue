<script setup lang="ts" generic="T extends string | number">
import { computed, nextTick, ref } from 'vue'
import type { ComponentPublicInstance } from 'vue'

export type SegmentedControlSize = 'sm' | 'md' | 'lg'

export interface SegmentedControlOption<TValue = string> {
  value: TValue
  label: string
  disabled?: boolean
}

const props = withDefaults(
  defineProps<{
    options: SegmentedControlOption<T>[]
    size?: SegmentedControlSize
    disabled?: boolean
    ariaLabel?: string
    /**
     * When true, buttons use `@mousedown.prevent` so clicking an option does
     * NOT shift focus away from whatever currently holds it. Intended for
     * composite controls embedded inside an inline-edit field, where a
     * focus shift would prematurely trigger a parent blur-commit (see
     * PriorityPicker inside TodoItem's edit row).
     */
    noFocusOnClick?: boolean
  }>(),
  {
    size: 'md',
    disabled: false,
    ariaLabel: 'Segmented control',
    noFocusOnClick: false,
  },
)

const modelValue = defineModel<T>({ required: true })

const emit = defineEmits<{
  'update:modelValue': [value: T]
}>()

const optionRefs = ref<Array<HTMLButtonElement | null>>([])

// Vue passes either an Element (native HTML tag) or a ComponentPublicInstance
// (component ref) into function-style :ref bindings. The native <button> case
// is what we actually expect, but the wider type keeps Vue's ref system happy.
function setOptionRef(el: Element | ComponentPublicInstance | null, index: number) {
  optionRefs.value[index] = el as HTMLButtonElement | null
}

const enabledIndices = computed<number[]>(() =>
  props.options
    .map((opt, idx) => ({ opt, idx }))
    .filter(({ opt }) => !opt.disabled && !props.disabled)
    .map(({ idx }) => idx),
)

function focusIndex(idx: number) {
  const target = optionRefs.value[idx]
  if (target) {
    nextTick(() => target.focus())
  }
}

function activate(value: T) {
  modelValue.value = value
  emit('update:modelValue', value)
}

function onKeydown(event: KeyboardEvent, index: number) {
  if (props.disabled) return
  const enabledIdxs = enabledIndices.value
  if (enabledIdxs.length === 0) return

  const currentPos = enabledIdxs.indexOf(index)
  // Unknown index (shouldn't happen) or current item disabled — bail out and
  // let the browser use its default tab behaviour instead of jumping to a
  // random option.
  if (currentPos === -1) return

  // Capture the resolved T value once per branch to keep TS happy with the
  // generic — re-indexing `props.options[next].value` widens `T` to its
  // constraint (`string | number`) and the assignment back to `modelValue`
  // (typed as `Ref<T>`) no longer typechecks.
  function commitByRawIndex(nextIdx: number) {
    const opt = props.options[nextIdx] as SegmentedControlOption<T> | undefined
    if (!opt) return
    activate(opt.value)
    focusIndex(nextIdx)
  }

  switch (event.key) {
    case 'ArrowRight':
    case 'ArrowDown': {
      event.preventDefault()
      commitByRawIndex(enabledIdxs[(currentPos + 1) % enabledIdxs.length]!)
      break
    }
    case 'ArrowLeft':
    case 'ArrowUp': {
      event.preventDefault()
      const nextPos = currentPos === 0 ? enabledIdxs.length - 1 : currentPos - 1
      commitByRawIndex(enabledIdxs[nextPos]!)
      break
    }
    case 'Home': {
      event.preventDefault()
      commitByRawIndex(enabledIdxs[0]!)
      break
    }
    case 'End': {
      event.preventDefault()
      commitByRawIndex(enabledIdxs[enabledIdxs.length - 1]!)
      break
    }
  }
}

function isActive(value: T): boolean {
  return modelValue.value === value
}

function tabindexFor(value: T): number {
  if (props.disabled) return -1
  return isActive(value) ? 0 : -1
}
</script>

<template>
  <div
    class="cagm-segmented-control"
    :class="[`cagm-segmented-control--${size}`]"
    role="radiogroup"
    :aria-label="ariaLabel"
    :aria-disabled="disabled || undefined"
  >
    <button
      v-for="(option, index) in options"
      :key="String(option.value)"
      :ref="(el) => setOptionRef(el, index)"
      type="button"
      role="radio"
      class="cagm-segmented-control__option"
      :class="{ 'is-active': isActive(option.value) }"
      :aria-checked="isActive(option.value)"
      :tabindex="tabindexFor(option.value)"
      :disabled="disabled || option.disabled"
      :data-value="String(option.value)"
      @mousedown="noFocusOnClick ? $event.preventDefault() : undefined"
      @click="activate(option.value)"
      @keydown="onKeydown($event, index)"
    >
      <slot name="option" :item="option" :active="isActive(option.value)">
        {{ option.label }}
      </slot>
    </button>
  </div>
</template>

<style scoped>
.cagm-segmented-control {
  display: inline-flex;
  align-items: stretch;
  gap: 0;
  padding: 0.1875rem;
  background: var(--surface-tonal-bg-button);
  border: var(--surface-border-width-button) solid var(--surface-border-color-button);
  border-radius: var(--radius-button);
  font-family: var(--font-body);
  isolation: isolate;
}

/* Sizes — match the Button sm/md/lg convention used across the system. */
.cagm-segmented-control--sm .cagm-segmented-control__option {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
}

.cagm-segmented-control--md .cagm-segmented-control__option {
  font-size: 0.8125rem;
  padding: 0.375rem 0.625rem;
}

.cagm-segmented-control--lg .cagm-segmented-control__option {
  font-size: 0.9375rem;
  padding: 0.5rem 0.875rem;
}

.cagm-segmented-control__option {
  appearance: none;
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  font-family: inherit;
  font-weight: 600;
  line-height: 1;
  /* Inner radius slightly less than the container so the "pill" hugs the
   * surrounding track on every shape-axis value (square -> pill). */
  border-radius: calc(var(--radius-button) - 2px);
  cursor: pointer;
  isolation: isolate;
  position: relative;
  transition:
    background-color 0.15s ease,
    color 0.15s ease,
    box-shadow 0.15s ease;
}

.cagm-segmented-control__option::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: transparent;
  pointer-events: none;
  z-index: -1;
  transition: background-color 0.15s ease;
}

.cagm-segmented-control__option:hover:not(:disabled):not(.is-active)::before {
  background: var(--state-layer-hover);
}

.cagm-segmented-control__option:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}

.cagm-segmented-control__option:focus-visible::before {
  background: var(--state-layer-focus);
}

.cagm-segmented-control__option:active:not(:disabled)::before {
  background: var(--state-layer-pressed);
}

.cagm-segmented-control__option:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

/*
 * Active state. Two stacked layers — the raised surface and a persistent
 * accent tint on top — mirror the Tabs design: a clear visual "this is the
 * selected option" that survives every [data-interaction] mode
 * (--state-layer-* resolves to transparent in "glow"). Consumers can
 * override the selected look per option via :deep() + [data-value] (see
 * PriorityPicker).
 */
.cagm-segmented-control__option.is-active {
  background: var(--color-surface-raised);
  color: var(--color-text);
  box-shadow: var(--shadow-sm);
}

.cagm-segmented-control__option.is-active::before {
  background: var(--color-selected-bg);
}

@media (prefers-reduced-motion: reduce) {
  .cagm-segmented-control__option,
  .cagm-segmented-control__option::before {
    transition: none;
  }
}
</style>