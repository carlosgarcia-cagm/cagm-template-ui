<script setup lang="ts">
import { computed } from 'vue'
import SegmentedControl from '@/components/molecules/SegmentedControl'
import type { SegmentedControlOption } from '@/components/molecules/SegmentedControl'
import { PRIORITY_OPTIONS, type Priority } from './types'

withDefaults(
  defineProps<{
    disabled?: boolean
    ariaLabel?: string
  }>(),
  {
    disabled: false,
    ariaLabel: 'Priority',
  },
)

const modelValue = defineModel<Priority | undefined>({ default: undefined })

/*
 * The SegmentedControl molecule uses a generic string|number value, but the
 * Priority's "no priority" case is modelled as `undefined`. We translate it
 * to/from the sentinel `__none` at the boundary so the molecule stays clean
 * (no nullable values in its public API) while the caller still gets a
 * natural `Priority | undefined` v-model.
 *
 * `data-value` on each rendered option becomes `String(option.value)`, so
 * the per-tone CSS hooks in the <style> block below target
 * `data-value="low" | "medium" | "high" | "__none"`.
 */
const NONE = '__none'
type PriorityOption = Priority | typeof NONE

const options: SegmentedControlOption<PriorityOption>[] = PRIORITY_OPTIONS.map((opt) => ({
  value: (opt.value ?? NONE) as PriorityOption,
  label: opt.label,
}))

const internalValue = computed<PriorityOption>({
  get() {
    return modelValue.value ?? NONE
  },
  set(value) {
    modelValue.value = value === NONE ? undefined : (value as Priority)
  },
})
</script>

<template>
  <SegmentedControl
    v-model="internalValue"
    :options="options"
    size="sm"
    :disabled="disabled"
    :aria-label="ariaLabel"
    no-focus-on-click
  />
</template>

<style scoped>
/*
 * Per-tone selected styling. The SegmentedControl's neutral active look
 * (raised surface + accent tint) is overridden here with the same per-priority
 * palette the previous hand-rolled button group used, so the visual output is
 * unchanged. The data-value selector comes from the molecule's per-option
 * attribute, so the SegmentedControl internals stay untouched.
 *
 * We also strip the selected-tint layer (`::before`) and the inner shadow
 * to keep the priority tones reading as solid, flat fills — matching the
 * pre-migration look exactly.
 */
.priority-picker :deep(.cagm-segmented-control__option[aria-checked='true'][data-value='__none']) {
  background: var(--color-surface-raised);
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  box-shadow: none;
}
.priority-picker :deep(.cagm-segmented-control__option[aria-checked='true'][data-value='__none']::before) {
  background: transparent;
}

.priority-picker :deep(.cagm-segmented-control__option[aria-checked='true'][data-value='low']) {
  background: var(--color-info-bg);
  color: var(--color-info);
  box-shadow: none;
}
.priority-picker :deep(.cagm-segmented-control__option[aria-checked='true'][data-value='low']::before) {
  background: transparent;
}

.priority-picker :deep(.cagm-segmented-control__option[aria-checked='true'][data-value='medium']) {
  background: var(--color-warning-bg);
  color: var(--color-warning);
  box-shadow: none;
}
.priority-picker :deep(.cagm-segmented-control__option[aria-checked='true'][data-value='medium']::before) {
  background: transparent;
}

.priority-picker :deep(.cagm-segmented-control__option[aria-checked='true'][data-value='high']) {
  background: var(--color-negative-bg);
  color: var(--color-negative);
  box-shadow: none;
}
.priority-picker :deep(.cagm-segmented-control__option[aria-checked='true'][data-value='high']::before) {
  background: transparent;
}
</style>