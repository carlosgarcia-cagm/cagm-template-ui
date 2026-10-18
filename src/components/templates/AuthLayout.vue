<script setup lang="ts">
import Card from '@/components/atoms/Card'

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
    <Card variant="raised" padding="lg" class="auth-layout__card">
      <template v-if="title" #title>
        <h1 class="auth-layout__title">{{ title }}</h1>
      </template>

      <template v-if="$slots.subtitle" #subtitle>
        <slot name="subtitle" />
      </template>

      <slot />

      <template v-if="$slots.footer" #footer>
        <slot name="footer" />
      </template>
    </Card>
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
}

.auth-layout__title {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  text-align: center;
}
</style>
