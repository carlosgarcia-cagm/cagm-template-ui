<script setup lang="ts">
import { computed } from 'vue'

// Icon is a generic, icon-set-agnostic wrapper. Consumers pass raw inline
// SVG or an icon-font glyph as the default slot; this component only
// handles sizing and color inheritance via currentColor.
const props = withDefaults(
  defineProps<{
    name?: string
    size?: number
  }>(),
  {
    name: undefined,
    size: 20,
  },
)

const style = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
  fontSize: `${props.size}px`,
}))
</script>

<template>
  <span class="icon" :data-icon-name="name" :style="style">
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
