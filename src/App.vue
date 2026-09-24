<template>
  <ThemeProvider>
    <nav class="app-nav">
      <RouterLink to="/" class="app-nav__brand">CAGM UI</RouterLink>
      <div class="app-nav__links">
        <RouterLink to="/playground" class="app-nav__link">Playground</RouterLink>
        <RouterLink to="/login" class="app-nav__link">Login</RouterLink>
        <RouterLink to="/todo" class="app-nav__link">Todo</RouterLink>
        <RouterLink to="/dashboard" class="app-nav__link">Dashboard</RouterLink>
      </div>
      <Button
        size="sm"
        variant="secondary"
        class="app-nav__theme-button"
        aria-label="Open theme settings"
        @click="themeDialogOpen = true"
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
    </nav>
    <RouterView />
    <TokenControlPanel />
    <ThemeMatrixDialog v-model="themeDialogOpen" />
  </ThemeProvider>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import ThemeProvider from '@/theme/ThemeProvider.vue'
import TokenControlPanel from '@/playground/components/TokenControlPanel.vue'
import ThemeMatrixDialog from '@/theme/ThemeMatrixDialog.vue'
import Button from '@/components/atoms/Button'

const themeDialogOpen = ref(false)
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
  border-bottom: 1px solid var(--color-border);
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

/* Pushed to the trailing edge of the bar, opposite the brand/links. */
.app-nav__theme-button {
  margin-left: auto;
}

.app-nav__theme-icon {
  width: 16px;
  height: 16px;
}
</style>
