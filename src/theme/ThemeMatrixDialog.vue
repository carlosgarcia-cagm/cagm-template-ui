<script setup lang="ts">
import {
  useTheme,
  type ShapeAxis,
  type SurfaceAxis,
  type ElevationAxis,
  type ButtonSizeAxis,
} from '@/theme/useTheme'
import Button from '@/components/atoms/Button'

/**
 * Global theme matrix. Rendered once from App.vue and opened from the nav
 * toolbar. Owns the full set of theme controls (colors, shape, density, mode)
 * that used to live in the fixed TokenControlPanel sidebar.
 *
 * Implemented as a right-edge sliding drawer rather than a centered modal,
 * following the same visual/technical approach as DashboardLayout's sidebar
 * overlay: fixed-position drawer + scrim backdrop, transform-based slide
 * animation, `:inert` when closed for accessibility.
 */
const open = defineModel<boolean>({ default: false })

const {
  mode,
  shape,
  density,
  surfaceStyle,
  elevation,
  buttonSize,
  surfaceStyleButton,
  surfaceStyleCard,
  surfaceStyleInput,
  surfaceStyleDropdown,
  surfaceStyleModal,
  surfaceStyleBadge,
  primaryColor,
  secondaryColor,
  accentColor,
  setMode,
  setShape,
  setDensity,
  setSurfaceStyle,
  setElevation,
  setButtonSize,
  setSurfaceStyleButton,
  setSurfaceStyleCard,
  setSurfaceStyleInput,
  setSurfaceStyleDropdown,
  setSurfaceStyleModal,
  setSurfaceStyleBadge,
  setPrimaryColor,
  setSecondaryColor,
  setAccentColor,
} = useTheme()

const shapes: ShapeAxis[] = ['square', 'soft', 'rounded', 'pill']
const surfaceOptions: SurfaceAxis[] = ['outlined', 'flat', 'filled']
const elevationOptions: ElevationAxis[] = ['zero', 'subtle', 'standard', 'bold']

/**
 * Global default button size. Buttons without an explicit `size` prop follow
 * this axis; call sites that pass `size` explicitly are unaffected.
 */
const buttonSizeOptions: { label: string; value: ButtonSizeAxis }[] = [
  { label: 'Small', value: 'sm' },
  { label: 'Medium', value: 'md' },
  { label: 'Large', value: 'lg' },
]

/**
 * Per-component surface override control. `null` = "Inherit" — removes the
 * per-category attribute so the component falls back to the global axis.
 */
const surfaceOverrideOptions: { label: string; value: 'outlined' | 'flat' | 'filled' | null }[] = [
  { label: 'Inherit', value: null },
  { label: 'Outlined', value: 'outlined' },
  { label: 'Flat', value: 'flat' },
  { label: 'Filled', value: 'filled' },
]

function onPrimaryColorChange(event: Event) {
  setPrimaryColor((event.target as HTMLInputElement).value)
}

function onSecondaryColorChange(event: Event) {
  setSecondaryColor((event.target as HTMLInputElement).value)
}

function onAccentColorChange(event: Event) {
  setAccentColor((event.target as HTMLInputElement).value)
}

function close() {
  open.value = false
}
</script>

<template>
  <div
    v-if="open"
    class="theme-matrix-drawer__backdrop"
    aria-hidden="true"
    @click="close"
  />
  <aside
    id="theme-matrix-drawer"
    class="theme-matrix-drawer"
    :class="{ 'theme-matrix-drawer--closed': !open }"
    :inert="!open"
    role="dialog"
    aria-modal="true"
    aria-labelledby="theme-matrix-drawer-title"
  >
    <header class="theme-matrix-drawer__header">
      <h2 id="theme-matrix-drawer-title" class="theme-matrix-drawer__title">Theme settings</h2>
      <Button
        variant="ghost"
        size="sm"
        class="theme-matrix-drawer__close"
        aria-label="Close theme settings"
        @click="close"
      >
        ✕
      </Button>
    </header>

    <div class="theme-matrix-drawer__body">
      <div class="theme-matrix">
        <div class="theme-matrix__group">
          <label class="theme-matrix__label" for="theme-primary-color">Primary color</label>
          <input
            id="theme-primary-color"
            type="color"
            class="theme-matrix__color-input"
            :value="primaryColor"
            @input="onPrimaryColorChange"
          />
        </div>

        <div class="theme-matrix__group">
          <label class="theme-matrix__label" for="theme-secondary-color">Secondary color</label>
          <input
            id="theme-secondary-color"
            type="color"
            class="theme-matrix__color-input"
            :value="secondaryColor"
            @input="onSecondaryColorChange"
          />
        </div>

        <div class="theme-matrix__group">
          <label class="theme-matrix__label" for="theme-accent-color">Accent color</label>
          <input
            id="theme-accent-color"
            type="color"
            class="theme-matrix__color-input"
            :value="accentColor"
            @input="onAccentColorChange"
          />
        </div>

        <div class="theme-matrix__group">
          <span class="theme-matrix__label">Shape</span>
          <div class="theme-matrix__button-group">
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

        <div class="theme-matrix__group">
          <span class="theme-matrix__label">Density</span>
          <div class="theme-matrix__button-group">
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

        <div class="theme-matrix__group">
          <span class="theme-matrix__label">Surface</span>
          <div class="theme-matrix__button-group">
            <Button
              v-for="option in surfaceOptions"
              :key="option"
              size="sm"
              :variant="surfaceStyle === option ? 'primary' : 'secondary'"
              @click="setSurfaceStyle(option)"
            >
              {{ option }}
            </Button>
          </div>
        </div>

        <div class="theme-matrix__group">
          <span class="theme-matrix__label">Elevation</span>
          <div class="theme-matrix__button-group">
            <Button
              v-for="option in elevationOptions"
              :key="option"
              size="sm"
              :variant="elevation === option ? 'primary' : 'secondary'"
              @click="setElevation(option)"
            >
              {{ option }}
            </Button>
          </div>
        </div>

        <div class="theme-matrix__group">
          <span class="theme-matrix__label">Button size</span>
          <div class="theme-matrix__button-group">
            <Button
              v-for="option in buttonSizeOptions"
              :key="option.value"
              size="sm"
              :variant="buttonSize === option.value ? 'primary' : 'secondary'"
              @click="setButtonSize(option.value)"
            >
              {{ option.label }}
            </Button>
          </div>
        </div>

        <div class="theme-matrix__group">
          <span class="theme-matrix__label">Mode</span>
          <div class="theme-matrix__button-group">
            <Button size="sm" :variant="mode === 'light' ? 'primary' : 'secondary'" @click="setMode('light')">
              light
            </Button>
            <Button size="sm" :variant="mode === 'dark' ? 'primary' : 'secondary'" @click="setMode('dark')">
              dark
            </Button>
          </div>
        </div>

        <div class="theme-matrix__section">
          <h3 class="theme-matrix__section-label">Per-component overrides</h3>
          <p class="theme-matrix__section-hint">
            Override the global Surface axis for a single component category. Leave on
            "Inherit" to follow the global setting.
          </p>

          <div class="theme-matrix__group">
            <span class="theme-matrix__label">Button surface</span>
            <div class="theme-matrix__button-group">
              <Button
                v-for="option in surfaceOverrideOptions"
                :key="option.label"
                size="sm"
                :variant="surfaceStyleButton === option.value ? 'primary' : 'secondary'"
                @click="setSurfaceStyleButton(option.value)"
              >
                {{ option.label }}
              </Button>
            </div>
          </div>

          <div class="theme-matrix__group">
            <span class="theme-matrix__label">Card surface</span>
            <div class="theme-matrix__button-group">
              <Button
                v-for="option in surfaceOverrideOptions"
                :key="`card-${option.label}`"
                size="sm"
                :variant="surfaceStyleCard === option.value ? 'primary' : 'secondary'"
                @click="setSurfaceStyleCard(option.value)"
              >
                {{ option.label }}
              </Button>
            </div>
          </div>

          <div class="theme-matrix__group">
            <span class="theme-matrix__label">Input surface</span>
            <div class="theme-matrix__button-group">
              <Button
                v-for="option in surfaceOverrideOptions"
                :key="`input-${option.label}`"
                size="sm"
                :variant="surfaceStyleInput === option.value ? 'primary' : 'secondary'"
                @click="setSurfaceStyleInput(option.value)"
              >
                {{ option.label }}
              </Button>
            </div>
          </div>

          <div class="theme-matrix__group">
            <span class="theme-matrix__label">Dropdown surface</span>
            <div class="theme-matrix__button-group">
              <Button
                v-for="option in surfaceOverrideOptions"
                :key="`dropdown-${option.label}`"
                size="sm"
                :variant="surfaceStyleDropdown === option.value ? 'primary' : 'secondary'"
                @click="setSurfaceStyleDropdown(option.value)"
              >
                {{ option.label }}
              </Button>
            </div>
          </div>

          <div class="theme-matrix__group">
            <span class="theme-matrix__label">Modal surface</span>
            <div class="theme-matrix__button-group">
              <Button
                v-for="option in surfaceOverrideOptions"
                :key="`modal-${option.label}`"
                size="sm"
                :variant="surfaceStyleModal === option.value ? 'primary' : 'secondary'"
                @click="setSurfaceStyleModal(option.value)"
              >
                {{ option.label }}
              </Button>
            </div>
          </div>

          <div class="theme-matrix__group">
            <span class="theme-matrix__label">Badge surface</span>
            <div class="theme-matrix__button-group">
              <Button
                v-for="option in surfaceOverrideOptions"
                :key="`badge-${option.label}`"
                size="sm"
                :variant="surfaceStyleBadge === option.value ? 'primary' : 'secondary'"
                @click="setSurfaceStyleBadge(option.value)"
              >
                {{ option.label }}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
/*
 * Scrim: covers the viewport under the drawer. Same scrim token as the
 * Dashboard sidebar (var(--color-scrim with the color-mix fallback so the
 * pattern renders even on themes that haven't defined --color-scrim).
 */
.theme-matrix-drawer__backdrop {
  position: fixed;
  inset: 0;
  z-index: var(--z-modal);
  background: var(--color-scrim, color-mix(in srgb, black 40%, transparent));
}

/*
 * Drawer panel: pinned to the right viewport edge. Always rendered so the
 * transform-based slide works in both directions; closed state is expressed
 * via `--closed` (translateX(100%)) plus `:inert` so the offscreen panel
 * is removed from the tab order and stops receiving pointer events.
 * z-index sits one step above the backdrop so the panel is always on top.
 */
.theme-matrix-drawer {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 360px;
  max-width: 90vw;
  z-index: calc(var(--z-modal) + 10);
  display: flex;
  flex-direction: column;
  background: var(--color-surface-raised);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  transform: translateX(0);
  transition: transform 0.25s ease;
}

.theme-matrix-drawer--closed {
  transform: translateX(100%);
}

.theme-matrix-drawer__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.875rem 1.25rem;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.theme-matrix-drawer__title {
  margin: 0;
  font-family: var(--font-display, var(--font-body));
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text);
}

.theme-matrix-drawer__close {
  padding: 0.375rem 0.625rem;
  font-size: 1rem;
  line-height: 1;
}

.theme-matrix-drawer__body {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 1.25rem 1.25rem;
}

@media (prefers-reduced-motion: reduce) {
  .theme-matrix-drawer {
    transition: none;
  }
}

/* --- original control styles (unchanged) --------------------------------- */

.theme-matrix {
  display: grid;
  gap: 1rem;
}

.theme-matrix__group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.theme-matrix__label {
  font-family: var(--font-body);
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-text-muted);
}

.theme-matrix__button-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.theme-matrix__color-input {
  width: 100%;
  height: 2.25rem;
  padding: 0;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-button);
  background: transparent;
  cursor: pointer;
}

.theme-matrix__section {
  display: grid;
  gap: 1rem;
  padding-top: 0.75rem;
  margin-top: 0.25rem;
  border-top: 1px solid var(--color-border);
}

.theme-matrix__section-label {
  margin: 0;
  font-family: var(--font-body);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-muted);
}

.theme-matrix__section-hint {
  margin: -0.5rem 0 0;
  font-family: var(--font-body);
  font-size: 0.75rem;
  color: var(--color-text-muted);
  line-height: 1.4;
}
</style>