<script setup lang="ts">
withDefaults(
  defineProps<{
    size?: number
    color?: string
  }>(),
  {
    size: 20,
    color: 'var(--color-accent)',
  },
)
</script>

<template>
  <span
    class="spinner"
    role="status"
    aria-live="polite"
    :style="{ width: `${size}px`, height: `${size}px`, '--spinner-color': color }"
  >
    <span class="spinner__visually-hidden">Loading</span>
  </span>
</template>

<style scoped>
.spinner {
  display: inline-block;
  border-radius: 50%;
  background: conic-gradient(from 0deg, transparent, var(--spinner-color));
  -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px));
  mask: radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px));
  animation: spinner-rotate 0.8s linear infinite;
}

.spinner__visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@keyframes spinner-rotate {
  to {
    transform: rotate(360deg);
  }
}
</style>
