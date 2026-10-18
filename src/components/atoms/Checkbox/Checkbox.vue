<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    id?: string
    name?: string
    value?: string
    indeterminate?: boolean
    disabled?: boolean
  }>(),
  {
    id: undefined,
    name: undefined,
    value: undefined,
    indeterminate: false,
    disabled: false,
  },
)

const modelValue = defineModel<boolean>({ default: false })

const inputRef = ref<HTMLInputElement | null>(null)

/*
 * `indeterminate` is a DOM property, not an attribute, so it can't be bound
 * declaratively. Mirror the prop onto the underlying input, and expose
 * aria-checked="mixed" while active so assistive tech reports the tri-state
 * correctly.
 */
function syncIndeterminate() {
  const el = inputRef.value
  if (el) el.indeterminate = props.indeterminate ?? false
}

watch(() => props.indeterminate, syncIndeterminate)
onMounted(syncIndeterminate)

function onChange(event: Event) {
  const target = event.target as HTMLInputElement
  modelValue.value = target.checked
}
</script>

<template>
  <label class="cagm-checkbox" :class="{ 'is-disabled': disabled }">
    <span class="cagm-checkbox__control">
      <input
        ref="inputRef"
        type="checkbox"
        class="cagm-checkbox__input"
        :checked="modelValue"
        :disabled="disabled"
        :id="id"
        :name="name"
        :value="value"
        :aria-checked="indeterminate ? 'mixed' : undefined"
        @change="onChange"
      />
      <span
        class="cagm-checkbox__box"
        :class="{ 'is-indeterminate': indeterminate }"
        aria-hidden="true"
      >
        <svg
          v-if="indeterminate"
          class="cagm-checkbox__dash"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        >
          <path d="M4.5 8h7" />
        </svg>
        <svg
          v-else-if="modelValue"
          class="cagm-checkbox__check"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M4 8.5l2.75 2.75L12 5.25" />
        </svg>
      </span>
    </span>
    <span v-if="$slots.default" class="cagm-checkbox__label">
      <slot />
    </span>
  </label>
</template>

<style scoped>
.cagm-checkbox {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--font-body);
  font-size: 0.875rem;
  color: var(--color-text);
  cursor: pointer;
  user-select: none;
}

.cagm-checkbox.is-disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.cagm-checkbox__control {
  position: relative;
  display: inline-grid;
  place-items: center;
  width: 1.125rem;
  height: 1.125rem;
  flex-shrink: 0;
}

/* Native input stays in the layout for a11y/keyboard, visually hidden but
 * clickable and focusable so :focus-visible + sibling styles work. */
.cagm-checkbox__input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  opacity: 0;
  cursor: inherit;
}

.cagm-checkbox__box {
  position: relative;
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-input);
  background: var(--color-surface-raised);
  color: var(--color-on-accent);
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

/* State layer matching Button's Material pattern: a translucent fill that
 * sits above the box background but below the check/dash glyph. */
.cagm-checkbox__box::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: transparent;
  pointer-events: none;
  transition: background-color 0.15s ease;
}

.cagm-checkbox:hover:not(.is-disabled) .cagm-checkbox__box::before {
  background: var(--state-layer-hover);
}

.cagm-checkbox__input:focus-visible + .cagm-checkbox__box {
  outline: none;
  box-shadow: var(--focus-ring);
}

.cagm-checkbox__input:focus-visible + .cagm-checkbox__box::before {
  background: var(--state-layer-focus);
}

.cagm-checkbox:active:not(.is-disabled) .cagm-checkbox__box::before {
  background: var(--state-layer-pressed);
}

.cagm-checkbox__input:checked + .cagm-checkbox__box,
.cagm-checkbox__box.is-indeterminate {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: var(--color-on-accent);
}

.cagm-checkbox__check,
.cagm-checkbox__dash {
  width: 0.75rem;
  height: 0.75rem;
  display: block;
}

.cagm-checkbox__label {
  line-height: 1.4;
}
</style>
