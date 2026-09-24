<script setup lang="ts">
import { computed } from 'vue'

type AvatarSize = 'sm' | 'md' | 'lg'

const props = withDefaults(
  defineProps<{
    src?: string
    name?: string
    size?: AvatarSize
  }>(),
  {
    src: undefined,
    name: '',
    size: 'md',
  },
)

const initials = computed(() => {
  const parts = props.name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return ''
  if (parts.length === 1) return parts[0]!.charAt(0).toUpperCase()
  return (parts[0]!.charAt(0) + parts[parts.length - 1]!.charAt(0)).toUpperCase()
})

const showImage = computed(() => Boolean(props.src))
</script>

<template>
  <span class="avatar" :class="`avatar--${size}`" :title="name || undefined">
    <img v-if="showImage" class="avatar__image" :src="src" :alt="name" />
    <span v-else class="avatar__initials">{{ initials }}</span>
  </span>
</template>

<style scoped>
.avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 50%;
  overflow: hidden;
  font-family: var(--font-body);
  font-weight: 600;
  color: var(--color-accent);
  background: color-mix(in srgb, var(--color-accent) 20%, var(--color-surface-raised));
  user-select: none;
  position: relative;
}

.avatar:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}

.avatar::after {
  content: '';
  position: absolute;
  inset: 0;
  background: transparent;
  pointer-events: none;
}

.avatar:hover::after {
  background: var(--state-layer-hover);
}

.avatar:active::after {
  background: var(--state-layer-pressed);
}

.avatar--sm {
  width: 24px;
  height: 24px;
  font-size: 10px;
}

.avatar--md {
  width: 32px;
  height: 32px;
  font-size: 13px;
}

.avatar--lg {
  width: 48px;
  height: 48px;
  font-size: 18px;
}

.avatar__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.avatar__initials {
  line-height: 1;
}
</style>
