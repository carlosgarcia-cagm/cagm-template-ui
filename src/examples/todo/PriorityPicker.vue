<script setup lang="ts">
import Button from '@/components/atoms/Button'
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

function select(value: Priority | undefined) {
  modelValue.value = value
}
</script>

<template>
  <div class="priority-picker" role="group" :aria-label="ariaLabel">
    <Button
      v-for="option in PRIORITY_OPTIONS"
      :key="option.key"
      variant="ghost"
      size="sm"
      :disabled="disabled"
      class="priority-picker__option"
      :class="[
        `priority-picker__option--${option.key}`,
        { 'is-selected': modelValue === option.value },
      ]"
      :aria-pressed="modelValue === option.value"
      @mousedown.prevent
      @click="select(option.value)"
    >
      {{ option.label }}
    </Button>
  </div>
</template>

<style scoped>
.priority-picker {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

/* Compact chip sizing; `@mousedown.prevent` keeps focus in the inline-edit
   input so clicking a chip does not trigger the blur-commit. */
.priority-picker .priority-picker__option {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-color: var(--color-border);
  color: var(--color-text-muted);
  background: transparent;
}

.priority-picker .priority-picker__option.is-selected.priority-picker__option--none {
  background: var(--color-surface-raised);
  border-color: var(--color-border);
  color: var(--color-text-muted);
}

.priority-picker .priority-picker__option.is-selected.priority-picker__option--low {
  background: var(--color-info-bg);
  border-color: var(--color-info);
  color: var(--color-info);
}

.priority-picker .priority-picker__option.is-selected.priority-picker__option--medium {
  background: var(--color-warning-bg);
  border-color: var(--color-warning);
  color: var(--color-warning);
}

.priority-picker .priority-picker__option.is-selected.priority-picker__option--high {
  background: var(--color-negative-bg);
  border-color: var(--color-negative);
  color: var(--color-negative);
}
</style>
