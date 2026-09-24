<script setup lang="ts">
withDefaults(
  defineProps<{
    id?: string
    placeholder?: string
    disabled?: boolean
    error?: boolean
    type?: 'text' | 'email' | 'password'
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
</script>

<template>
  <input
    v-model="modelValue"
    :id="id"
    :type="type"
    :placeholder="placeholder"
    :disabled="disabled"
    :class="{ 'is-error': error }"
    class="cagm-input"
  />
</template>

<style scoped>
.cagm-input {
  width: 100%;
  font-family: var(--font-body);
  font-size: 0.9375rem;
  color: var(--color-text);
  background: color-mix(in srgb, var(--color-accent) 5%, var(--color-surface));
  border: 1px solid var(--color-border);
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

.cagm-input:hover:not(:disabled) {
  background: linear-gradient(
      var(--state-layer-hover),
      var(--state-layer-hover)
    ),
    color-mix(in srgb, var(--color-accent) 5%, var(--color-surface));
}

.cagm-input:focus {
  border-color: var(--color-accent);
  box-shadow: var(--focus-ring);
  background: linear-gradient(
      var(--state-layer-focus),
      var(--state-layer-focus)
    ),
    color-mix(in srgb, var(--color-accent) 5%, var(--color-surface));
}

.cagm-input:active:not(:disabled) {
  background: linear-gradient(
      var(--state-layer-pressed),
      var(--state-layer-pressed)
    ),
    color-mix(in srgb, var(--color-accent) 5%, var(--color-surface));
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
  box-shadow: var(--focus-ring);
}
</style>
