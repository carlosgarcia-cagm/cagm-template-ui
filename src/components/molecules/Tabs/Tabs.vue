<script setup lang="ts">
import { TabsRoot, TabsList, TabsTrigger, TabsContent } from 'reka-ui'

export interface TabItem {
  value: string
  label: string
  disabled?: boolean
}

withDefaults(
  defineProps<{
    items: TabItem[]
    modelValue?: string
  }>(),
  {
    modelValue: undefined,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <TabsRoot
    class="cagm-tabs"
    :model-value="modelValue"
    @update:model-value="(value) => emit('update:modelValue', String(value))"
  >
    <TabsList class="cagm-tabs__list" aria-label="Tabs">
      <TabsTrigger
        v-for="item in items"
        :key="item.value"
        class="cagm-tabs__trigger"
        :value="item.value"
        :disabled="item.disabled"
      >
        {{ item.label }}
      </TabsTrigger>
    </TabsList>
    <TabsContent
      v-for="item in items"
      :key="item.value"
      class="cagm-tabs__content"
      :value="item.value"
    >
      <slot :name="item.value" />
    </TabsContent>
  </TabsRoot>
</template>

<style scoped>
.cagm-tabs {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.cagm-tabs__list {
  display: flex;
  gap: 0.25rem;
  border-bottom: 1px solid var(--color-border);
}

.cagm-tabs__trigger {
  position: relative;
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 0.875rem;
  line-height: 1;
  color: var(--color-text-muted);
  background: transparent;
  border: none;
  border-radius: var(--radius-button) var(--radius-button) 0 0;
  padding: 0.625rem 0.875rem;
  cursor: pointer;
  isolation: isolate;
  transition:
    color 0.15s ease,
    box-shadow 0.15s ease;
}

.cagm-tabs__trigger::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: transparent;
  pointer-events: none;
  z-index: -1;
  transition: background-color 0.15s ease;
}

.cagm-tabs__trigger:hover:not(:disabled)::before {
  background: var(--state-layer-hover);
}

.cagm-tabs__trigger:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}

.cagm-tabs__trigger:focus-visible::before {
  background: var(--state-layer-focus);
}

.cagm-tabs__trigger:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.cagm-tabs__trigger[data-state='active'] {
  color: var(--color-text);
  box-shadow: inset 0 -2px 0 0 var(--color-accent);
}

/*
 * Persistent "this tab is selected" fill. Uses the stable --color-selected-bg
 * token (not --state-layer-hover, which is transparent in "glow"), so the
 * selected tab keeps its background in every [data-interaction] mode. The
 * accent underline below remains the primary selected indicator.
 */
.cagm-tabs__trigger[data-state='active']::before {
  background: var(--color-selected-bg);
}

.cagm-tabs__content {
  padding: 1rem 0;
}

.cagm-tabs__content:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
  border-radius: var(--radius-card);
}
</style>
