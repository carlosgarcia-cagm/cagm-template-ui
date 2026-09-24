import { defineConfig, presetWind } from 'unocss'

// Attributify preset intentionally disabled. Arbitrary values (e.g. bg-[var(--color-surface)])
// let utilities consume CSS custom property tokens defined under src/tokens/.
export default defineConfig({
  presets: [presetWind()],
  theme: {},
  shortcuts: {},
})
