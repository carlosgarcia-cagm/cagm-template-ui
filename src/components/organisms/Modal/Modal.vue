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

/**
 * Additive extension of the original two-prop Modal:
 *  - `size`         controls max-width (sm | md | lg | full). Defaults to
 *                   'md' which matches the legacy `min(28rem, calc(100vw - 2rem))`.
 *  - `hideClose`    suppresses the default close button (e.g. for destructive
 *                   confirms that must use a footer action). The `#close`
 *                   slot still wins over this flag when supplied.
 *  - `ariaLabel`    provides an accessible name when `title` is omitted
 *                   (Reka/ARIA require every Dialog to have a DialogTitle).
 *  - `persistent`   disables closing via Escape and overlay click so the
 *                   dialog can only be dismissed through a footer action.
 *                   The default close button is also suppressed when persistent
 *                   so users can't escape by accident.
 *  - `#header`      slot replaces the entire built-in header block (title +
 *                   description + close), for fully custom headers.
 *  - `#close`       slot replaces the default close glyph while staying
 *                   inside Reka's DialogClose (so keyboard close still works).
 */
export type ModalSize = 'sm' | 'md' | 'lg' | 'full'

withDefaults(
  defineProps<{
    title?: string
    description?: string
    size?: ModalSize
    hideClose?: boolean
    ariaLabel?: string
    persistent?: boolean
  }>(),
  {
    title: undefined,
    description: undefined,
    size: 'md',
    hideClose: false,
    ariaLabel: undefined,
    persistent: false,
  },
)

const open = defineModel<boolean>({ default: false })

/**
 * Resolved accessible name for the dialog. Priority:
 *   1. explicit `title` prop
 *   2. explicit `ariaLabel` prop
 *   3. generic fallback so the dialog is never unnamed
 */
function resolveAccessibleName(props: { title?: string; ariaLabel?: string }): string {
  if (props.title && props.title.trim().length > 0) return props.title
  if (props.ariaLabel && props.ariaLabel.trim().length > 0) return props.ariaLabel
  return 'Dialog'
}

/**
 * Block close attempts when `persistent` is set. Reka's DialogContent emits
 * CustomEvents that expose `preventDefault()`; calling it stops the underlying
 * DialogRoot from flipping its open state.
 */
function preventIfPersistent(event: { preventDefault: () => void }, persistent: boolean) {
  if (persistent) event.preventDefault()
}
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogTrigger v-if="$slots.trigger" as-child>
      <slot name="trigger" />
    </DialogTrigger>
    <DialogPortal>
      <DialogOverlay class="cagm-modal-overlay" />
      <DialogContent
        class="cagm-modal-content"
        :class="[`cagm-modal-content--${size}`]"
        :aria-label="!title ? resolveAccessibleName({ title, ariaLabel }) : undefined"
        @escape-key-down="(event) => preventIfPersistent(event, persistent)"
        @pointer-down-outside="(event) => preventIfPersistent(event, persistent)"
        @interact-outside="(event) => preventIfPersistent(event, persistent)"
      >
        <!--
          `#header` wins entirely. When supplied the consumer owns the whole
          header (title + description + close), so we render nothing else
          inside the modal-header wrapper.
        -->
        <div v-if="$slots.header" class="cagm-modal-header">
          <slot name="header" />
        </div>
        <div v-else class="cagm-modal-header">
          <!--
            DialogTitle is always rendered so screen readers always see an
            accessible name. When `title` is omitted we still produce a
            DialogTitle, but visually-hide it via the `cagm-modal-title--sr-only`
            class so the layout isn't disturbed.
          -->
          <DialogTitle
            class="cagm-modal-title"
            :class="{ 'cagm-modal-title--sr-only': !title }"
          >
            {{ title ?? resolveAccessibleName({ title, ariaLabel }) }}
          </DialogTitle>
          <DialogDescription
            v-if="description"
            class="cagm-modal-description"
          >
            {{ description }}
          </DialogDescription>
          <!--
            Close button: shown by default, hidden when `hideClose` or
            `persistent` is true. `#close` slot replaces the icon but stays
            inside DialogClose so keyboard activation still dismisses.
          -->
          <DialogClose
            v-if="$slots.close || (!hideClose && !persistent)"
            class="cagm-modal-close"
            aria-label="Close"
          >
            <slot name="close">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </slot>
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

/* Size variants — `md` is the legacy default and intentionally redundant with
   the base width above so existing markup (without `size`) still matches. */
.cagm-modal-content--sm {
  width: min(22rem, calc(100vw - 2rem));
}

.cagm-modal-content--md {
  width: min(28rem, calc(100vw - 2rem));
}

.cagm-modal-content--lg {
  width: min(40rem, calc(100vw - 2rem));
}

.cagm-modal-content--full {
  width: calc(100vw - 2rem);
  max-height: calc(100vh - 2rem);
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

/* Visually-hidden but reachable by assistive tech — used when no `title` prop
   is provided so the DialogTitle element still satisfies Reka/ARIA. */
.cagm-modal-title--sr-only {
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
