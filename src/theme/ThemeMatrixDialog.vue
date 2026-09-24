<script setup lang="ts">
import { useTheme, type ShapeAxis } from '@/theme/useTheme'
import Modal from '@/components/organisms/Modal'
import Button from '@/components/atoms/Button'

/**
 * Global theme matrix. Rendered once from App.vue and opened from the nav
 * toolbar. Owns the full set of theme controls (colors, shape, density, mode)
 * that used to live in the fixed TokenControlPanel sidebar.
 */
const open = defineModel<boolean>({ default: false })

const {
  mode,
  shape,
  density,
  primaryColor,
  secondaryColor,
  accentColor,
  setMode,
  setShape,
  setDensity,
  setPrimaryColor,
  setSecondaryColor,
  setAccentColor,
} = useTheme()

const shapes: ShapeAxis[] = ['square', 'soft', 'rounded', 'pill']

function onPrimaryColorChange(event: Event) {
  setPrimaryColor((event.target as HTMLInputElement).value)
}

function onSecondaryColorChange(event: Event) {
  setSecondaryColor((event.target as HTMLInputElement).value)
}

function onAccentColorChange(event: Event) {
  setAccentColor((event.target as HTMLInputElement).value)
}
</script>

<template>
  <Modal v-model="open" title="Theme settings">
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
    </div>
  </Modal>
</template>

<style scoped>
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
</style>
