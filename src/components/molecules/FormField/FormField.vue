<script setup lang="ts">
import { useId } from 'vue'
import { Label } from 'reka-ui'
import Input from '@/components/atoms/Input'
import type { InputType } from '@/components/atoms/Input/Input.vue'

const props = withDefaults(
  defineProps<{
    label?: string
    error?: string
    disabled?: boolean
    placeholder?: string
    type?: InputType
    required?: boolean
  }>(),
  {
    label: undefined,
    error: undefined,
    disabled: false,
    placeholder: '',
    type: 'text',
    required: false,
  },
)

const modelValue = defineModel<string>({ default: '' })
const fieldId = useId()
</script>

<template>
  <div class="cagm-form-field">
    <!-- `#label` slot wins over the `label` prop when provided, so consumers
         can render richer labels (icons, required marker, helper text) while
         keeping the same `for`/`id` wiring via the default `<Label>` below. -->
    <slot v-if="$slots.label" name="label" />
    <Label v-else-if="label" class="cagm-form-field__label" :for="fieldId">
      {{ label }}
    </Label>
    <Input
      v-model="modelValue"
      :id="fieldId"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :error="!!props.error"
    >
      <!-- Forward Input's `#leading` / `#trailing` slots so a consumer can
           pass icon / action content (e.g. a password show/hide toggle,
           search icon, clear button) without re-implementing the field. -->
      <template #leading>
        <slot name="leading" />
      </template>
      <template #trailing>
        <slot name="trailing" />
      </template>
    </Input>
    <p v-if="$slots.hint" class="cagm-form-field__hint">
      <slot name="hint" />
    </p>
    <p v-if="error" class="cagm-form-field__error">
      {{ error }}
    </p>
    <slot v-else name="error" />
  </div>
</template>

<style scoped>
.cagm-form-field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.cagm-form-field__label {
  font-family: var(--font-body);
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-text);
}

.cagm-form-field__hint {
  font-family: var(--font-body);
  font-size: 0.8125rem;
  color: var(--color-text-muted);
  margin: 0;
}

.cagm-form-field__error {
  font-family: var(--font-body);
  font-size: 0.8125rem;
  color: var(--color-negative);
  margin: 0;
}
</style>
