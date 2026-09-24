<script setup lang="ts">
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from 'reka-ui'

withDefaults(
  defineProps<{
    title?: string
    description?: string
  }>(),
  {
    title: undefined,
    description: undefined,
  },
)

const open = defineModel<boolean>({ default: false })
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogTrigger v-if="$slots.trigger" as-child>
      <slot name="trigger" />
    </DialogTrigger>
    <DialogPortal>
      <DialogOverlay class="cagm-modal-overlay" />
      <DialogContent class="cagm-modal-content">
        <div class="cagm-modal-header">
          <DialogTitle v-if="title" class="cagm-modal-title">{{ title }}</DialogTitle>
          <DialogDescription v-if="description" class="cagm-modal-description">
            {{ description }}
          </DialogDescription>
          <DialogClose class="cagm-modal-close" aria-label="Close">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </DialogClose>
        </div>
        <div class="cagm-modal-body">
          <slot />
        </div>
        <div v-if="$slots.footer" class="cagm-modal-footer">
          <slot name="footer" />
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<style scoped>
.cagm-modal-overlay {
  position: fixed;
  inset: 0;
  background: var(--color-scrim);
  z-index: var(--z-modal);
  animation: cagm-modal-overlay-in 0.15s ease-out;
}

.cagm-modal-content {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: min(28rem, calc(100vw - 2rem));
  max-height: calc(100vh - 4rem);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  background: var(--color-surface-raised);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-lg);
  z-index: var(--z-modal);
  animation: cagm-modal-content-in 0.15s ease-out;
}

.cagm-modal-content:focus-visible {
  outline: none;
  box-shadow: var(--shadow-lg), var(--focus-ring);
}

.cagm-modal-header {
  position: relative;
  padding: 1.25rem 1.5rem 0.75rem;
}

.cagm-modal-title {
  font-family: var(--font-display, var(--font-body));
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
  padding-right: 1.75rem;
}

.cagm-modal-description {
  font-family: var(--font-body);
  font-size: 0.875rem;
  color: var(--color-text-muted);
  margin: 0.25rem 0 0;
}

.cagm-modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border: none;
  border-radius: var(--radius-card);
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.cagm-modal-close:hover {
  background: var(--state-layer-hover);
  color: var(--color-text);
}

.cagm-modal-close:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}

.cagm-modal-body {
  padding: 0.75rem 1.5rem 1.25rem;
  font-family: var(--font-body);
  color: var(--color-text);
  flex: 1;
}

.cagm-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--color-border);
}

@keyframes cagm-modal-overlay-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes cagm-modal-content-in {
  from {
    opacity: 0;
    transform: translate(-50%, -48%);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%);
  }
}
</style>
