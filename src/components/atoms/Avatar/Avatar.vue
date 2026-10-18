<script setup lang="ts">
import { computed } from 'vue'

export type AvatarSize = 'sm' | 'md' | 'lg'

const props = withDefaults(
  defineProps<{
    src?: string
    name?: string
    size?: AvatarSize
    /** When true, renders a focusable `<button>` instead of a non-interactive `<span>`. */
    interactive?: boolean
    /** Native button `type`; only applied in interactive mode. */
    type?: 'button' | 'submit' | 'reset'
    /** Disables the button; only applied in interactive mode. */
    disabled?: boolean
  }>(),
  {
    src: undefined,
    name: '',
    size: 'md',
    interactive: false,
    type: 'button',
    disabled: false,
  },
)

const initials = computed(() => {
  const parts = props.name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return ''
  if (parts.length === 1) return parts[0]!.charAt(0).toUpperCase()
  return (parts[0]!.charAt(0) + parts[parts.length - 1]!.charAt(0)).toUpperCase()
})

const showImage = computed(() => Boolean(props.src))
const tag = computed(() => (props.interactive ? 'button' : 'span'))
</script>

<template>
  <component
    :is="tag"
    class="avatar"
    :class="[`avatar--${size}`, { 'avatar--interactive': interactive }]"
    :title="name || undefined"
    :type="interactive ? type : undefined"
    :disabled="interactive ? disabled : undefined"
  >
    <span class="avatar__frame">
      <img v-if="showImage" class="avatar__image" :src="src" :alt="name" />
      <slot v-else name="fallback">
        <span class="avatar__initials">{{ initials }}</span>
      </slot>
    </span>
    <span v-if="$slots.badge" class="avatar__badge">
      <slot name="badge" />
    </span>
  </component>
</template>

<style scoped>
.avatar {
  position: relative;
  display: inline-flex;
  flex-shrink: 0;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  font: inherit;
  color: inherit;
  text-align: inherit;
  vertical-align: middle;
  user-select: none;
}

.avatar--interactive {
  cursor: pointer;
}

.avatar--interactive:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.avatar__frame {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  /* Shape axis hook: falls back to a full circle until a global
   * --radius-avatar is defined (e.g. by shape.css). */
  border-radius: var(--radius-avatar, 999px);
  overflow: hidden;
  font-family: var(--font-body);
  font-weight: 600;
  color: var(--color-accent);
  background: color-mix(in srgb, var(--color-accent) 20%, var(--color-surface-raised));
}

.avatar:focus-visible {
  outline: none;
}

.avatar:focus-visible .avatar__frame {
  box-shadow: var(--focus-ring);
}

.avatar__frame::after {
  content: '';
  position: absolute;
  inset: 0;
  background: transparent;
  pointer-events: none;
}

.avatar:hover .avatar__frame::after {
  background: var(--state-layer-hover);
}

.avatar:active .avatar__frame::after {
  background: var(--state-layer-pressed);
}

/* Presence-indicator overlay: un-clipped by the frame so dots/pills can
 * overlap the circle's edge. */
.avatar__badge {
  position: absolute;
  right: 0;
  bottom: 0;
  display: inline-flex;
  align-items: flex-end;
  justify-content: flex-end;
  line-height: 0;
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
