<script setup lang="ts">
import { ref } from 'vue'
import Button from '@/components/atoms/Button'
import Icon from '@/components/atoms/Icon'
import Navbar from '@/components/organisms/Navbar'
import Sidebar, { type SidebarItem } from '@/components/organisms/Sidebar'

withDefaults(
  defineProps<{
    title?: string
    items: SidebarItem[]
    activeHref?: string
  }>(),
  {
    title: undefined,
    activeHref: undefined,
  },
)

const emit = defineEmits<{
  select: [item: SidebarItem]
}>()

const sidebarOpen = ref(false)

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
          aria-label="Alternar barra lateral"
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
    <Sidebar
      id="dashboard-sidebar"
      class="dashboard-layout__sidebar"
      :items="items"
      :active-href="activeHref"
      :inert="!sidebarOpen"
      @select="emit('select', $event)"
    />
    <main class="dashboard-layout__content">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.dashboard-layout {
  /*
   * Rendered Navbar height: 0.75rem vertical padding (×2) + sm Button
   * (0.375rem padding ×2 + 1.5px border ×2 + 20px icon) = 3.6875rem.
   * Single source of truth for anchoring the absolute start below
   * the navbar; override here if the Navbar's content ever grows taller.
   */
  --navbar-height: 3.6875rem;

  position: relative;
  display: grid;
  /*
   * The sidebar is no longer part of the grid flow: the content column owns
   * the full width and the sidebar floats above it as an absolute overlay.
   */
  grid-template-columns: 1fr;
  grid-template-rows: auto 1fr;
  grid-template-areas:
    'navbar'
    'content';
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
