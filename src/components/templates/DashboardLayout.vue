<script setup lang="ts">
import { computed, ref } from 'vue'
import Button from '@/components/atoms/Button'
import Icon from '@/components/atoms/Icon'
import Navbar from '@/components/organisms/Navbar'
import Sidebar, { type SidebarItem } from '@/components/organisms/Sidebar'

const props = withDefaults(
  defineProps<{
    title?: string
    items: SidebarItem[]
    activeHref?: string
    /**
     * `v-model:sidebarOpen` — sidebar open/collapsed state.
     *
     * Controlled usage: pass the prop and listen to `update:sidebarOpen`; the
     * parent owns state.
     *
     * Uncontrolled usage (back-compat for `<DashboardLayout>` without the
     * prop): when the prop is `undefined`, an internal `ref(false)` owns
     * state. Defaults to closed so existing call sites (e.g.
     * `DashboardView.vue`) keep rendering identically with no prop changes.
     */
    sidebarOpen?: boolean
    /**
     * Accessible label for the sidebar toggle button (the hamburger / close
     * icon rendered in the Navbar's leading slot).
     *
     * Default is the same Spanish string the component has always rendered
     * so existing screen-reader output is unchanged unless a parent opts in
     * to a translated / custom label.
     */
    sidebarToggleLabel?: string
  }>(),
  {
    title: undefined,
    activeHref: undefined,
    sidebarToggleLabel: 'Alternar barra lateral',
    // Intentionally NOT defaulted: leaving `sidebarOpen` as `undefined` is
    // how we detect "uncontrolled" usage below.
  },
)

const emit = defineEmits<{
  select: [item: SidebarItem]
  'update:sidebarOpen': [value: boolean]
}>()

// Uncontrolled state — used only when the `sidebarOpen` prop is not
// provided. Starts closed to match the previous internal `ref(false)`
// behaviour exactly.
const internalSidebarOpen = ref(false)

/**
 * `true` when the consumer is driving `sidebarOpen` via the prop
 * (controlled). Detected by `sidebarOpen !== undefined` so that an
 * explicit `:sidebar-open="false"` is treated as controlled — the
 * consumer owns the truth in that case.
 */
const isSidebarOpenControlled = computed(() => props.sidebarOpen !== undefined)

/**
 * Effective sidebar state: prop value when controlled, otherwise the
 * internal ref. Writable so `toggleSidebar` (and any future inline
 * state change) can route through one symbol and dispatch to either
 * the emit or the internal ref.
 */
const sidebarOpen = computed<boolean>({
  get: () => (isSidebarOpenControlled.value ? (props.sidebarOpen as boolean) : internalSidebarOpen.value),
  set: (next: boolean) => {
    if (isSidebarOpenControlled.value) {
      emit('update:sidebarOpen', next)
    } else {
      internalSidebarOpen.value = next
    }
  },
})

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value
}
</script>

<template>
  <div class="dashboard-layout" :class="{ 'dashboard-layout--sidebar-collapsed': !sidebarOpen }">
    <Navbar class="dashboard-layout__navbar" :title="title">
      <template #leading>
        <Button
          variant="ghost"
          size="sm"
          class="dashboard-layout__sidebar-toggle"
          :aria-expanded="sidebarOpen"
          aria-controls="dashboard-sidebar"
          :aria-label="sidebarToggleLabel"
          @click="toggleSidebar"
        >
          <Icon :size="20" aria-hidden="true">
            <svg
              v-if="!sidebarOpen"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              style="fill: none"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
            <svg
              v-else
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              style="fill: none"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </Icon>
        </Button>
      </template>
      <template #brand>
        <slot name="navbar-brand" />
      </template>
      <template #actions>
        <slot name="navbar-actions" />
      </template>
    </Navbar>
    <div
      v-if="sidebarOpen"
      class="dashboard-layout__backdrop"
      aria-hidden="true"
      @click="toggleSidebar"
    />
    <!--
      Sidebar region. By default we render the shared `Sidebar` organism
      using the `items` / `activeHref` props and a `@select` re-emit.
      Consumers that need a different sidebar (a folder rail, a custom
      nav, a navigation tree with their own selection logic) can pass a
      `#sidebar` slot and it will be rendered inside the same
      positioned wrapper so the toggle / backdrop / `aria-controls`
      wiring continues to work. The wrapper keeps `id="dashboard-sidebar"`
      so the toggle's `aria-controls` always resolves, regardless of
      whether the default Sidebar or a custom slot is rendered.
    -->
    <Sidebar
      v-if="!$slots.sidebar"
      id="dashboard-sidebar"
      class="dashboard-layout__sidebar"
      :items="items"
      :active-href="activeHref"
      :inert="!sidebarOpen"
      @select="emit('select', $event)"
    />
    <div
      v-else
      id="dashboard-sidebar"
      class="dashboard-layout__sidebar"
      :inert="!sidebarOpen"
    >
      <slot name="sidebar" />
    </div>
    <main class="dashboard-layout__content">
      <slot />
    </main>
    <!--
      Optional layout-level footer. Rendered as a third explicit grid
      row below the content so it sits at the bottom of the layout
      (below the scrollable content) without overlapping the sidebar
      toggle or backdrop. No styling is imposed on the slotted
      content — consumers bring their own surface / padding / borders.
      The wrapper element is only emitted when the slot is provided,
      so the layout markup is byte-identical to the previous version
      for consumers that don't opt in.
    -->
    <footer v-if="$slots.footer" class="dashboard-layout__footer">
      <slot name="footer" />
    </footer>
  </div>
</template>

<style scoped>
.dashboard-layout {
  /*
   * `--navbar-height`: the rendered height of the Navbar above this layout.
   *
   * Currently a hand-computed fallback:
   *   0.75rem vertical padding (×2) + sm Button
   *   (0.375rem padding ×2 + 1.5px border ×2 + 20px icon) = 3.6875rem.
   *
   * A parallel Navbar task may expose `--navbar-height` from the Navbar's
   * own root element. Because CSS custom properties only inherit
   * parent → child (never child → parent), the layout cannot read that
   * value in pure CSS; the consumption point will need a small bridge
   * (e.g. `getComputedStyle(navbarRef).getPropertyValue('--navbar-height')`
   * fed back into a `:style` binding). Until that lands, this fallback
   * keeps `DashboardLayout` working standalone — single source of truth
   * for anchoring the backdrop and the absolutely-positioned sidebar
   * below the Navbar.
   */
  --navbar-height: 3.6875rem;

  position: relative;
  display: grid;
  /*
   * The sidebar is no longer part of the grid flow: the content column owns
   * the full width and the sidebar floats above it as an absolute overlay.
   *
   * Three explicit rows: Navbar (auto), content (1fr — fills remaining
   * viewport), and an optional footer slot (auto — sizes to its content
   * or collapses to 0 when the slot is empty).
   */
  grid-template-columns: 1fr;
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    'navbar'
    'content'
    'footer';
  min-height: 100vh;
}

.dashboard-layout__navbar {
  grid-area: navbar;
}

.dashboard-layout__content {
  grid-area: content;
  position: relative;
  /*
   * Own stacking context so the content's internals can never rise above the
   * overlay backdrop/sidebar that sit as later siblings (z-index 20 / 30).
   */
  z-index: 0;
  background: var(--color-bg);
  overflow-y: auto;
}

/*
 * Optional layout-level footer wrapper — only emitted when the
 * `#footer` slot is provided. Place it in the third grid row so it
 * sits below the scrollable content without overlapping the sidebar
 * toggle or backdrop. No background / padding / border is imposed;
 * consumers fully control the footer surface.
 */
.dashboard-layout__footer {
  grid-area: footer;
}

/*
 * Scrim below this component's own Navbar, layered between content and
 * sidebar. Anchored to `.dashboard-layout` (position: relative) rather than
 * the viewport, so it starts exactly at this component's top edge — below any
 * outer/global navigation bar App.vue renders above the RouterView — instead
 * of at a viewport-relative offset that would overlap this component's own
 * Navbar (and its hamburger toggle).
 */
.dashboard-layout__backdrop {
  position: absolute;
  top: var(--navbar-height);
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 20;
  background: var(--color-scrim, color-mix(in srgb, black 40%, transparent));
}

/*
 * Overlay drawer: absolutely positioned below this component's own Navbar
 * (anchored to `.dashboard-layout`, position: relative) rather than the
 * viewport, so it starts at this component's top edge — below any outer nav
 * App.vue renders above the RouterView — and never covers this component's
 * own Navbar/hamburger. `.dashboard-layout` is min-height: 100vh, so the
 * calculated height still spans the full remaining viewport exactly.
 * Sliding in/out via transform (no width/grid animation). The extra
 * `.dashboard-layout` class raises specificity so it wins over Sidebar's
 * own scoped `width: 100%; height: 100%`.
 */
.dashboard-layout .dashboard-layout__sidebar {
  position: absolute;
  top: var(--navbar-height);
  left: 0;
  width: 240px;
  height: calc(100vh - var(--navbar-height));
  z-index: 30;
  overflow-x: hidden;
  overflow-y: auto;
  box-shadow: var(--shadow-lg);
  transform: translateX(0);
  transition: transform 0.25s ease;
}

.dashboard-layout--sidebar-collapsed .dashboard-layout__sidebar {
  transform: translateX(-100%);
}

.dashboard-layout__sidebar-toggle {
  padding: 0.375rem;
}

@media (prefers-reduced-motion: reduce) {
  .dashboard-layout .dashboard-layout__sidebar {
    transition: none;
  }
}
</style>
