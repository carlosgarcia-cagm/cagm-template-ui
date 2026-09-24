<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string
  }>(),
  {
    title: undefined,
  },
)
</script>

<template>
  <header class="navbar flex items-center justify-between">
    <div class="navbar__section navbar__section--left flex items-center gap-3">
      <slot name="leading" />
      <slot name="brand">
        <span v-if="title" class="navbar__title">{{ title }}</span>
      </slot>
    </div>
    <div class="navbar__section navbar__section--right flex items-center gap-3">
      <slot name="actions" />
    </div>
  </header>
</template>

<style scoped>
.navbar {
  width: 100%;
  padding: 0.75rem 1.25rem;
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
  font-family: var(--font-body);
  color: var(--color-text);
}

.navbar__title {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.2;
}
</style>
