<script setup lang="ts">
import {
  DropdownMenuRoot,
  DropdownMenuTrigger,
  DropdownMenuPortal,
  DropdownMenuContent,
  DropdownMenuItem,
} from 'reka-ui'

export interface DropdownItem {
  value: string
  label: string
  disabled?: boolean
}

withDefaults(
  defineProps<{
    items: DropdownItem[]
    align?: 'start' | 'center' | 'end'
  }>(),
  {
    align: 'start',
  },
)

const emit = defineEmits<{
  select: [value: string]
}>()
</script>

<template>
  <DropdownMenuRoot>
    <DropdownMenuTrigger class="cagm-dropdown__trigger" as-child>
      <slot name="trigger" />
    </DropdownMenuTrigger>
    <DropdownMenuPortal>
      <DropdownMenuContent
        class="cagm-dropdown__content"
        :align="align"
        :side-offset="4"
      >
        <DropdownMenuItem
          v-for="item in items"
          :key="item.value"
          class="cagm-dropdown__item"
          :disabled="item.disabled"
          @select="emit('select', item.value)"
        >
          {{ item.label }}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenuPortal>
  </DropdownMenuRoot>
</template>

<style scoped>
.cagm-dropdown__trigger {
  display: inline-flex;
}

.cagm-dropdown__content {
  min-width: 10rem;
  background: var(--color-surface-raised);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-md);
  padding: 0.25rem;
  font-family: var(--font-body);
  z-index: 50;
}

.cagm-dropdown__item {
  position: relative;
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  color: var(--color-text);
  border-radius: var(--radius-button);
  padding: 0.5rem 0.625rem;
  cursor: pointer;
  outline: none;
  isolation: isolate;
  transition: background-color 0.15s ease;
}

.cagm-dropdown__item::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: transparent;
  pointer-events: none;
  z-index: -1;
  transition: background-color 0.15s ease;
}

.cagm-dropdown__item[data-highlighted]::before {
  background: var(--state-layer-hover);
}

.cagm-dropdown__item:focus-visible {
  box-shadow: var(--focus-ring);
}

.cagm-dropdown__item[data-disabled] {
  cursor: not-allowed;
  opacity: 0.5;
}
</style>
