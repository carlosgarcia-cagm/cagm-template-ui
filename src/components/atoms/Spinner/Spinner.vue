<script setup lang="ts">
withDefaults(
  defineProps<{
    size?: number
    color?: string
    /** Screen-reader label; override for i18n (default `"Loading"`). */
    label?: string
  }>(),
  {
    size: 20,
    color: 'var(--color-accent)',
    label: 'Loading',
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
    <span class="spinner__visually-hidden">{{ label }}</span>
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

/* Motion-sensitivity guard: stop the endless rotation and fall back to a
 * gentle opacity pulse so the indicator still reads as "busy". */
@media (prefers-reduced-motion: reduce) {
  .spinner {
    animation: spinner-pulse 1.6s ease-in-out infinite;
  }
}

@keyframes spinner-pulse {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.4;
  }
}
</style>
