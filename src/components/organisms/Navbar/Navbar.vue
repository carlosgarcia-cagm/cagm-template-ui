<script lang="ts">
/**
 * Default navbar height. Exposed as a module export so consumers can
 * reference the same constant in their own SSR / non-CSS layout math
 * without having to read the live `--navbar-height` value. The component
 * itself uses this both as the build-time CSS fallback and as the
 * initial `--navbar-height` value before the ResizeObserver fires.
 *
 * Lives in a separate `<script>` block because `<script setup>` cannot
 * contain ES module exports.
 */
export const DEFAULT_NAVBAR_HEIGHT = '3.6875rem'
</script>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, useTemplateRef } from 'vue'

/**
 * Additive extension of the original Navbar (title + #leading + #brand +
 * #actions):
 *  - `#center` slot fills the middle of the row. Renders nothing when
 *    absent so existing layouts (left + right only) keep their spacing.
 *  - `sticky` flips the navbar to `position: sticky; top: 0;` so it stays
 *    pinned at the top of its scrolling container without any consumer-side
 *    CSS.
 *  - Exposes the navbar's actual rendered height as a CSS custom property
 *    (`--navbar-height`) on the root <header> element. A ResizeObserver
 *    keeps the value in sync with content changes (e.g. when an icon button
 *    wraps or a new slot is populated). The default fallback declared in
 *    the component's own scoped style is the same 3.6875rem value the
 *    DashboardLayout currently hardcodes, so consumers that switch to
 *    `var(--navbar-height)` keep their layout byte-for-byte until the first
 *    observation fires.
 */

withDefaults(
  defineProps<{
    title?: string
    sticky?: boolean
  }>(),
  {
    title: undefined,
    sticky: false,
  },
)

const root = useTemplateRef<HTMLElement>('root')
let observer: ResizeObserver | null = null

function publishHeight() {
  const el = root.value
  if (!el) return
  const height = el.getBoundingClientRect().height
  // Round to the nearest pixel so consumers don't read sub-pixel jitter.
  const rounded = `${Math.round(height)}px`
  el.style.setProperty('--navbar-height', rounded)
}

onMounted(() => {
  publishHeight()
  if (typeof ResizeObserver === 'undefined') return
  observer = new ResizeObserver(() => publishHeight())
  if (root.value) observer.observe(root.value)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
})
</script>

<template>
  <header ref="root" class="navbar" :class="{ 'navbar--sticky': sticky }">
    <div class="navbar__section navbar__section--left flex items-center gap-3">
      <slot name="leading" />
      <slot name="brand">
        <span v-if="title" class="navbar__title">{{ title }}</span>
      </slot>
    </div>
    <div v-if="$slots.center" class="navbar__section navbar__section--center flex items-center gap-3">
      <slot name="center" />
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
  /*
   * The initial value matches the magic 3.6875rem DashboardLayout previously
   * hardcoded. ResizeObserver on mount replaces it with the actual rendered
   * height in px; consumers reading `var(--navbar-height)` therefore stay
   * pinned to the navbar's real bottom edge even if the content grows.
   * `v-bind` inlines the constant at build time so the rule is still a
   * static CSS fallback before JS runs.
   */
  --navbar-height: v-bind(DEFAULT_NAVBAR_HEIGHT);
}

.navbar--sticky {
  position: sticky;
  top: 0;
  /* Sticky navbars must sit above ordinary content; the layout's own stack
     contexts still apply on top of this. */
  z-index: 10;
}

.navbar__section--center {
  flex: 1;
  justify-content: center;
  min-width: 0;
}

.navbar__section--right {
  margin-left: auto;
}

.navbar__title {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.2;
}
</style>
