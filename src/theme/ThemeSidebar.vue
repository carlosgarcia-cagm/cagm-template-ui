<script setup lang="ts">
import { ref } from 'vue'
import { useTheme, type ShapeAxis } from '@/theme/useTheme'
import Button from '@/components/atoms/Button'

const {
  mode,
  shape,
  density,
  interaction,
  accentColor,
  setMode,
  setShape,
  setDensity,
  setInteractionStyle,
  setAccentColor,
} = useTheme()

const open = ref(false)
const shapes: ShapeAxis[] = ['square', 'soft', 'rounded', 'pill']

function onAccentColorChange(event: Event) {
  setAccentColor((event.target as HTMLInputElement).value)
}

function toggleInteraction() {
  setInteractionStyle(interaction.value === 'glow' ? 'material' : 'glow')
}
</script>

<template>
  <div class="theme-sidebar" :class="{ 'theme-sidebar--open': open }">
    <button
      type="button"
      class="theme-sidebar__toggle"
      :aria-expanded="open"
      aria-controls="theme-sidebar-panel"
      :aria-label="open ? 'Close theme controls' : 'Open theme controls'"
      @click="open = !open"
    >
      <svg
        class="theme-sidebar__toggle-chevron"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M15 6l-6 6 6 6" />
      </svg>
    </button>

    <div
      id="theme-sidebar-panel"
      class="theme-sidebar__panel"
      role="region"
      aria-label="Theme controls"
      :aria-hidden="!open"
      :inert="!open"
    >
      <h2 class="theme-sidebar__heading">Theme Controls</h2>

      <div class="theme-sidebar__group">
        <label class="theme-sidebar__label" for="theme-accent-color-input">Accent color</label>
        <input
          id="theme-accent-color-input"
          type="color"
          class="theme-sidebar__color-input"
          :value="accentColor"
          @input="onAccentColorChange"
        />
      </div>

      <div class="theme-sidebar__group">
        <span class="theme-sidebar__label">Shape</span>
        <div class="theme-sidebar__button-group">
          <Button
            v-for="option in shapes"
            :key="option"
            size="sm"
            :variant="shape === option ? 'primary' : 'secondary'"
            @click="setShape(option)"
          >
            {{ option }}
          </Button>
        </div>
      </div>

      <div class="theme-sidebar__group">
        <span class="theme-sidebar__label">Density</span>
        <div class="theme-sidebar__button-group">
          <Button
            size="sm"
            :variant="density === 'padded' ? 'primary' : 'secondary'"
            @click="setDensity('padded')"
          >
            padded
          </Button>
          <Button
            size="sm"
            :variant="density === 'full-width' ? 'primary' : 'secondary'"
            @click="setDensity('full-width')"
          >
            full-width
          </Button>
        </div>
      </div>

      <div class="theme-sidebar__group">
        <span class="theme-sidebar__label">Mode</span>
        <div class="theme-sidebar__button-group">
          <Button size="sm" :variant="mode === 'light' ? 'primary' : 'secondary'" @click="setMode('light')">
            light
          </Button>
          <Button size="sm" :variant="mode === 'dark' ? 'primary' : 'secondary'" @click="setMode('dark')">
            dark
          </Button>
        </div>
      </div>
    </div>
  </div>

  <button
    type="button"
    class="interaction-fab"
    :title="`Interaction style: ${interaction} (click to toggle)`"
    :aria-label="`Toggle interaction style, currently ${interaction}`"
    @click="toggleInteraction"
  >
    <span class="interaction-fab__label">{{ interaction === 'glow' ? '✨' : '◆' }}</span>
  </button>
</template>

<style scoped>
.theme-sidebar {
  position: fixed;
  top: var(--space-4);
  right: var(--space-4);
  bottom: var(--space-4);
  z-index: var(--z-dropdown);
  display: flex;
  width: 280px;
  transform: translateX(calc(100% + var(--space-4)));
  transition: transform 0.25s ease;
}

.theme-sidebar--open {
  transform: translateX(0);
}

.theme-sidebar__panel {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  overflow-y: auto;
  padding: var(--space-4);
  /* Clearance so the fixed FAB never covers the last control. */
  padding-bottom: calc(var(--space-6) + 52px + var(--space-2));
  background: var(--color-surface-raised);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-lg);
  font-family: var(--font-body);
  color: var(--color-text);
}

.theme-sidebar__toggle {
  position: absolute;
  top: 50%;
  left: calc(-1 * var(--space-8));
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--space-8);
  height: calc(var(--space-8) * 2);
  padding: 0;
  border: 1px solid var(--color-border);
  border-right: none;
  border-radius: var(--radius-card) 0 0 var(--radius-card);
  background: var(--color-surface-raised);
  color: var(--color-text-muted);
  box-shadow: var(--shadow-md);
  cursor: pointer;
  transition: color 0.15s ease, background-color 0.15s ease;
}

.theme-sidebar__toggle:hover {
  color: var(--color-accent);
  background-color: color-mix(in srgb, var(--color-accent) 10%, var(--color-surface-raised));
}

.theme-sidebar__toggle:focus-visible {
  outline: none;
  box-shadow: var(--shadow-md), var(--focus-ring);
}

.theme-sidebar__toggle-chevron {
  width: 18px;
  height: 18px;
  transition: transform 0.25s ease;
}

.theme-sidebar--open .theme-sidebar__toggle-chevron {
  transform: rotate(180deg);
}

.theme-sidebar__heading {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 700;
}

.theme-sidebar__group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.theme-sidebar__label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-text-muted);
}

.theme-sidebar__button-group {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.theme-sidebar__color-input {
  width: 100%;
  height: 2.25rem;
  padding: 0;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-button);
  background: transparent;
  cursor: pointer;
}

/*
 * FAB stays fixed to the viewport (never inside the collapsible panel) so the
 * interaction-style toggle is reachable on every route and in every state.
 * Its fill consumes --interaction-preview-bg: outlined at rest in "glow",
 * tinted fill in "material", making the active mode visible without hovering.
 */
.interaction-fab {
  position: fixed;
  right: var(--space-6);
  bottom: var(--space-6);
  z-index: var(--z-dropdown);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  padding: 0;
  border: 2px solid var(--color-accent);
  border-radius: 50%;
  background-color: var(--color-surface-raised);
  background-image: linear-gradient(var(--interaction-preview-bg), var(--interaction-preview-bg));
  color: var(--color-accent);
  box-shadow: var(--shadow-lg);
  cursor: pointer;
  transition: transform 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}

.interaction-fab:hover {
  transform: scale(1.05);
  border-color: var(--color-accent-hover);
  color: var(--color-accent-hover);
  background-image:
    linear-gradient(var(--state-layer-hover), var(--state-layer-hover)),
    linear-gradient(var(--interaction-preview-bg), var(--interaction-preview-bg));
}

.interaction-fab:focus-visible {
  outline: none;
  box-shadow: var(--shadow-lg), var(--focus-ring);
}

.interaction-fab__label {
  font-size: 1.25rem;
  line-height: 1;
}
</style>
