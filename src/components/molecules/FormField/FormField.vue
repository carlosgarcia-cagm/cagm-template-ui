<script setup lang="ts">
import { useId } from 'vue'
import { Label } from 'reka-ui'
import Input from '@/components/atoms/Input'

const props = withDefaults(
  defineProps<{
    label?: string
    error?: string
    disabled?: boolean
    placeholder?: string
    type?: 'text' | 'email' | 'password'
  }>(),
  {
    label: undefined,
    error: undefined,
    disabled: false,
    placeholder: '',
    type: 'text',
  },
)

const modelValue = defineModel<string>({ default: '' })
const fieldId = useId()
</script>

<template>
  <div class="cagm-form-field">
    <Label v-if="label" class="cagm-form-field__label" :for="fieldId">
      {{ label }}
    </Label>
    <Input
      v-model="modelValue"
      :id="fieldId"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :error="!!props.error"
    />
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

.cagm-form-field__error {
  font-family: var(--font-body);
  font-size: 0.8125rem;
  color: var(--color-negative);
  margin: 0;
}
</style>
