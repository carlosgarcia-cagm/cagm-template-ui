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
  <div class="auth-layout">
    <div class="auth-layout__card">
      <h1 v-if="title" class="auth-layout__title">{{ title }}</h1>
      <slot />
    </div>
  </div>
</template>

<style scoped>
.auth-layout {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: var(--color-bg);
  padding: 1rem;
}

.auth-layout__card {
  width: 100%;
  max-width: 400px;
  background: var(--color-surface-raised);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-md);
  padding: 2rem;
}

.auth-layout__title {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 1.5rem;
  text-align: center;
}
</style>
