<script setup lang="ts">
import { useTheme } from '@/theme/useTheme'

/**
 * Global interaction-style controls. Rendered once from App.vue so the FAB and
 * its preview swatch persist across every route. The theme matrix (colors,
 * shape, density, mode) now lives in ThemeMatrixDialog, opened from the nav.
 */
const { interaction, setInteractionStyle } = useTheme()

function toggleInteraction() {
  setInteractionStyle(interaction.value === 'glow' ? 'material' : 'glow')
}
</script>

<template>
  <div class="interaction-preview" :class="`interaction-preview--${interaction}`" aria-hidden="true">
    <span class="interaction-preview__swatch"></span>
    <span class="interaction-preview__label">{{ interaction }}</span>
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
.interaction-preview {
  position: fixed;
  bottom: 39px;
  right: 88px;
  z-index: var(--z-modal, 1000);
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.625rem;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  background: var(--color-surface-raised);
  box-shadow: var(--shadow-lg);
  font-family: var(--font-body);
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1;
  color: var(--color-text-muted);
  pointer-events: none;
  transition: background-color 0.15s ease, border-color 0.15s ease;
}

.interaction-preview--glow {
  border-style: dashed;
}

.interaction-preview--material {
  border-color: color-mix(in srgb, var(--color-accent) 55%, var(--color-border));
  background: color-mix(in srgb, var(--color-accent) 10%, var(--color-surface-raised));
}

.interaction-preview__swatch {
  width: 14px;
  height: 14px;
  flex: none;
  border: 2px solid var(--color-accent);
  border-radius: 50%;
  background: var(--interaction-preview-bg);
  transition: background-color 0.15s ease;
}

.interaction-preview__label {
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.interaction-fab {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: var(--z-modal, 1000);
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 50%;
  background: var(--color-accent);
  color: var(--color-on-accent);
  box-shadow: var(--shadow-lg);
  cursor: pointer;
  isolation: isolate;
  transition:
    transform 0.15s ease,
    background-color 0.15s ease,
    box-shadow 0.15s ease;
}

/*
 * Mode-aware interaction layer. In "material" the --state-layer-* tokens are a
 * translucent accent tint; in "glow" they resolve to transparent. The same
 * rules therefore paint a filled overlay in one mode and nothing in the other.
 * Negative z-index keeps the tint above the FAB background but below the icon.
 */
.interaction-fab::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: transparent;
  pointer-events: none;
  z-index: -1;
  transition: background-color 0.15s ease;
}

/*
 * Hover: "glow" adds an external halo (--hover-ring is a 2px accent ring there
 * and 0 0 0 0 transparent in "material"), while "material" adds an internal
 * state-layer fill. The two modes now differ both outside and inside the disc.
 */
.interaction-fab:hover {
  transform: scale(1.05);
  background: var(--color-accent-hover);
  box-shadow: var(--shadow-lg), var(--hover-ring);
}

.interaction-fab:hover::before {
  background: var(--state-layer-hover);
}

.interaction-fab:active {
  transform: scale(0.97);
  background: var(--color-accent-active);
  box-shadow: var(--shadow-lg);
}

.interaction-fab:active::before {
  background: var(--state-layer-pressed);
}

.interaction-fab:focus-visible {
  outline: none;
  box-shadow: var(--shadow-lg), var(--focus-ring);
}

/*
 * Keyboard focus: in "glow" the external --focus-ring already makes focus
 * visible, but in "material" --focus-ring is 0-size, so without this the FAB
 * would show nothing. The state-layer fill mirrors what mouse hover does.
 */
.interaction-fab:focus-visible::before {
  background: var(--state-layer-focus);
}

.interaction-fab__label {
  font-size: 1.25rem;
  line-height: 1;
}
</style>
