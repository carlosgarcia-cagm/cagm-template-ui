<script setup lang="ts">
import { computed } from 'vue'

// Icon is a generic, icon-set-agnostic wrapper. Consumers pass raw inline
// SVG or an icon-font glyph as the default slot; this component only
// handles sizing and color inheritance via currentColor.
const props = withDefaults(
  defineProps<{
    name?: string
    size?: number
    /**
     * Accessible name for a meaningful icon. When provided the icon is exposed
     * as `role="img"` with this `aria-label`; when omitted the icon stays
     * decorative (`aria-hidden="true"`).
     */
    label?: string
  }>(),
  {
    name: undefined,
    size: 20,
    label: undefined,
  },
)

const style = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
  fontSize: `${props.size}px`,
}))

const isDecorative = computed(() => !props.label)
</script>

<template>
  <span
    class="icon"
    :data-icon-name="name"
    :style="style"
    :role="isDecorative ? undefined : 'img'"
    :aria-label="label || undefined"
    :aria-hidden="isDecorative ? 'true' : undefined"
  >
    <slot />
  </span>
</template>

<style scoped>
.icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  line-height: 1;
  color: currentColor;
  font-family: var(--font-body);
}

.icon :deep(svg) {
  width: 100%;
  height: 100%;
  fill: currentColor;
}
</style>
