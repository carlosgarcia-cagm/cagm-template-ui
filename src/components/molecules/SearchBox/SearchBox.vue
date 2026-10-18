<script setup lang="ts">
import { watch, onBeforeUnmount, useSlots } from 'vue'
import Input from '@/components/atoms/Input'
import Icon from '@/components/atoms/Icon'
import Button from '@/components/atoms/Button'
import Spinner from '@/components/atoms/Spinner'

const props = withDefaults(
  defineProps<{
    placeholder?: string
    disabled?: boolean
    debounceMs?: number
    /**
     * Shows an inline spinner in place of the clear button while
     * `true`. Intended for async search results — the consumer owns
     * when to flip the flag.
     */
    loading?: boolean
  }>(),
  {
    placeholder: 'Search…',
    disabled: false,
    debounceMs: 300,
    loading: false,
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

// Detect results slot lazily. We declare it as a render function so we
// can decide whether to render the surrounding `<div>` and keep the
// markup unconditional.
const slots = useSlots()
const hasResultsSlot = !!slots.results
</script>

<template>
  <div class="cagm-search-box">
    <Input
      v-model="modelValue"
      type="text"
      :placeholder="placeholder"
      :disabled="disabled"
      @keydown="onKeydown"
    >
      <template #leading>
        <Icon :size="16" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </Icon>
      </template>

      <template #trailing>
        <Spinner
          v-if="loading"
          class="cagm-search-box__spinner"
          :size="16"
        />
        <Button
          v-else-if="modelValue"
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
      </template>
    </Input>

    <!--
      Optional results surface for autocomplete / suggestions. Hidden
      when the consumer does not provide a `#results` slot so existing
      call sites are visually unchanged.
    -->
    <div v-if="hasResultsSlot" class="cagm-search-box__results">
      <slot name="results" />
    </div>
  </div>
</template>

<style scoped>
/*
 * Layout. The wrapper previously positioned the prefix icon and clear
 * Button absolutely and overrode `.cagm-input`'s padding via :deep().
 * Both responsibilities have moved into Input's `#leading`/`#trailing`
 * slots — Input already reserves horizontal padding when either slot
 * is filled, so we no longer touch `.cagm-input` directly.
 *
 * One :deep() override remains: Input's `.cagm-input__trailing` is a
 * fixed 18×18 absolutely-positioned wrapper with pointer-events:none,
 * tuned for a single decorative icon. SearchBox's clear button is a
 * real <button> with its own padding, so we let the wrapper size to
 * its content and re-enable pointer events just for this consumer.
 * This keeps the override local to SearchBox and additive only — Input
 * itself is untouched.
 */
.cagm-search-box {
  position: relative;
  display: block;
  width: 100%;
  font-family: var(--font-body);
}

.cagm-search-box :deep(.cagm-input__trailing) {
  width: auto;
  height: auto;
  right: 0.5rem;
  pointer-events: auto;
}

.cagm-search-box__clear {
  padding: 0.25rem;
  border-radius: var(--radius-button);
}

.cagm-search-box__spinner {
  display: inline-block;
}

.cagm-search-box__results {
  margin-top: 0.5rem;
}
</style>
