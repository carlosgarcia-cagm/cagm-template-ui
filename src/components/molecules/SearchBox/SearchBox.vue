<script setup lang="ts">
import { watch, onBeforeUnmount } from 'vue'
import Input from '@/components/atoms/Input'
import Icon from '@/components/atoms/Icon'
import Button from '@/components/atoms/Button'

const props = withDefaults(
  defineProps<{
    placeholder?: string
    disabled?: boolean
    debounceMs?: number
  }>(),
  {
    placeholder: 'Search…',
    disabled: false,
    debounceMs: 300,
  },
)

const emit = defineEmits<{
  search: [value: string]
}>()

const modelValue = defineModel<string>({ default: '' })

let debounceTimer: ReturnType<typeof setTimeout> | undefined

watch(modelValue, (value) => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    emit('search', value)
  }, props.debounceMs)
})

onBeforeUnmount(() => {
  if (debounceTimer) clearTimeout(debounceTimer)
})

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    if (debounceTimer) clearTimeout(debounceTimer)
    emit('search', modelValue.value)
  }
}

function onClear() {
  modelValue.value = ''
  if (debounceTimer) clearTimeout(debounceTimer)
  emit('search', '')
}
</script>

<template>
  <div class="cagm-search-box">
    <Icon class="cagm-search-box__prefix-icon" :size="16" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="7" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    </Icon>
    <Input
      v-model="modelValue"
      type="text"
      :placeholder="placeholder"
      :disabled="disabled"
      class="cagm-search-box__input"
      @keydown="onKeydown"
    />
    <Button
      v-if="modelValue"
      variant="ghost"
      size="sm"
      class="cagm-search-box__clear"
      :disabled="disabled"
      aria-label="Clear search"
      @click="onClear"
    >
      <Icon :size="14" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </Icon>
    </Button>
  </div>
</template>

<style scoped>
.cagm-search-box {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.cagm-search-box__prefix-icon {
  position: absolute;
  left: 0.75rem;
  color: var(--color-text-muted);
  pointer-events: none;
}

.cagm-search-box__input :deep(.cagm-input) {
  padding-left: 2.25rem;
  padding-right: 2.25rem;
}

.cagm-search-box__clear {
  position: absolute;
  right: 0.25rem;
  padding: 0.25rem;
  border-radius: var(--radius-button);
}
</style>
