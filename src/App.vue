<template>
  <ThemeProvider>
    <nav ref="navRef" class="app-nav">
      <RouterLink to="/" class="app-nav__brand" @click="closeMenu">CAGM UI</RouterLink>
      <div
        id="app-nav-links"
        class="app-nav__links"
        :class="{ 'app-nav__links--open': menuOpen }"
      >
        <RouterLink to="/playground" class="app-nav__link" @click="closeMenu">Playground</RouterLink>
        <RouterLink to="/login" class="app-nav__link" @click="closeMenu">Login</RouterLink>
        <RouterLink to="/todo" class="app-nav__link" @click="closeMenu">Todo</RouterLink>
        <RouterLink to="/dashboard" class="app-nav__link" @click="closeMenu">Dashboard</RouterLink>
        <RouterLink to="/reports" class="app-nav__link" @click="closeMenu">Reports</RouterLink>
      </div>
      <Button
        size="sm"
        variant="secondary"
        class="app-nav__theme-button"
        aria-label="Open theme settings"
        @click="openThemeSettings"
      >
        <svg
          class="app-nav__theme-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="3" />
          <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
        </svg>
        Theme
      </Button>
      <Button
        variant="ghost"
        size="sm"
        class="app-nav__menu-button"
        :aria-expanded="menuOpen"
        aria-controls="app-nav-links"
        :aria-label="menuOpen ? 'Close navigation menu' : 'Open navigation menu'"
        @click="toggleMenu"
      >
        <svg
          v-if="!menuOpen"
          class="app-nav__menu-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
        <svg
          v-else
          class="app-nav__menu-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </Button>
    </nav>
    <RouterView />
    <TokenControlPanel />
    <ThemeMatrixDialog v-model="themeDialogOpen" />
  </ThemeProvider>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import ThemeProvider from '@/theme/ThemeProvider.vue'
import TokenControlPanel from '@/playground/components/TokenControlPanel.vue'
import ThemeMatrixDialog from '@/theme/ThemeMatrixDialog.vue'
import Button from '@/components/atoms/Button'

const themeDialogOpen = ref(false)

/*
 * Responsive nav state. On wide viewports the hamburger trigger is hidden
 * (`display: none`) and the links render inline, so `menuOpen` has no visual
 * effect; below the breakpoint the links collapse into a dropdown panel that
 * this flag toggles.
 */
const menuOpen = ref(false)
const navRef = ref<HTMLElement | null>(null)
const route = useRoute()

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}

function closeMenu() {
  menuOpen.value = false
}

function openThemeSettings() {
  closeMenu()
  themeDialogOpen.value = true
}

// Close the menu on any route change — covers programmatic navigation and
// browser back/forward, where no link click fires.
watch(() => route.fullPath, closeMenu)

// Escape closes the menu; a pointerdown outside the nav also closes it.
function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') closeMenu()
}

function onPointerDown(event: PointerEvent) {
  if (!menuOpen.value) return
  if (navRef.value && !navRef.value.contains(event.target as Node)) closeMenu()
}

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
  document.addEventListener('pointerdown', onPointerDown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
  document.removeEventListener('pointerdown', onPointerDown)
})
</script>

<style scoped>
.app-nav {
  position: sticky;
  top: 0;
  z-index: var(--z-dropdown);
  display: flex;
  align-items: center;
  gap: var(--space-4);
  min-height: 56px;
  padding: var(--space-2) var(--space-4);
  background: var(--color-surface);
  border-bottom: var(--surface-border-width) solid var(--surface-border-color);
  box-shadow: var(--shadow-sm);
  font-family: var(--font-body);
}

.app-nav__brand {
  padding: var(--space-1) var(--space-2);
  font-family: var(--font-display);
  font-size: 1.125rem;
  font-weight: 700;
  letter-spacing: 0.01em;
  color: var(--color-text);
  text-decoration: none;
  /* Never wrap onto two lines ("CAGM" / "UI") or get squeezed — the brand
     stays on one line and lets the collapsible links area give way first. */
  white-space: nowrap;
  flex-shrink: 0;
}

.app-nav__links {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.app-nav__link {
  position: relative;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-button);
  font-family: var(--font-body);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-muted);
  text-decoration: none;
  transition: background-color 0.15s ease, color 0.15s ease;
}

/* Real background on hover: a subtle accent tint in "glow", plus the
   Material state-layer fill when the "material" interaction axis is active. */
.app-nav__link:hover {
  color: var(--color-text);
  background-color: color-mix(in srgb, var(--color-accent) 8%, transparent);
  background-image: linear-gradient(var(--state-layer-hover), var(--state-layer-hover));
}

.app-nav__link:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
  background-color: color-mix(in srgb, var(--color-accent) 8%, transparent);
  background-image: linear-gradient(var(--state-layer-focus), var(--state-layer-focus));
}

/* Persistent pill on the active route. */
.app-nav__link.router-link-active {
  color: var(--color-accent);
  font-weight: 600;
  background-color: color-mix(in srgb, var(--color-accent) 12%, transparent);
}

/* Pushed to the trailing edge of the bar, opposite the brand/links.
   `flex-shrink: 0` guarantees it is never clipped at narrow widths. */
.app-nav__theme-button {
  margin-left: auto;
  flex-shrink: 0;
}

.app-nav__theme-icon {
  width: 16px;
  height: 16px;
}

/* Hamburger trigger — hidden on wide viewports; the media query below
   reveals it once the links collapse into the dropdown. */
.app-nav__menu-button {
  display: none;
  flex-shrink: 0;
}

.app-nav__menu-icon {
  width: 20px;
  height: 20px;
}

/*
 * Below ~1100px the brand + four links + Theme button no longer fit on one
 * row, so the links collapse into a hamburger-toggled dropdown panel
 * (reusing the ☰ / ✕ pattern from DashboardLayout for consistency). The
 * brand and Theme button keep `flex-shrink: 0`, so the Theme drawer stays
 * reachable and unclipped down to ~360px.
 */
@media (max-width: 1100px) {
  .app-nav {
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
  }

  .app-nav__menu-button {
    display: inline-flex;
  }

  /* Dropdown panel anchored to the sticky nav's bottom edge. */
  .app-nav__links {
    position: absolute;
    top: 100%;
    right: 0;
    left: 0;
    display: none;
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-1);
    padding: var(--space-2) var(--space-3) var(--space-3);
    background: var(--color-surface);
    border-bottom: var(--surface-border-width) solid var(--surface-border-color);
    box-shadow: var(--shadow-lg);
  }

  .app-nav__links--open {
    display: flex;
  }

  .app-nav__link {
    padding: var(--space-3) var(--space-4);
  }
}
</style>
