import { reactive, toRefs } from 'vue'
import {
  TONAL_STEPS,
  buildTonalScale,
  hexToRgb,
  hslToRgb,
  pickAccessibleLightness,
  pickHigherContrast,
} from './colorUtils'

export type ThemeMode = 'light' | 'dark'
export type ShapeAxis = 'square' | 'soft' | 'rounded' | 'pill'
export type DensityAxis = 'full-width' | 'padded'
export type InteractionAxis = 'glow' | 'material'
export type SurfaceAxis = 'outlined' | 'flat' | 'filled'
/**
 * Per-component-category surface override. `null` = inherit the global
 * [data-surface] axis (no per-category attribute present on :root).
 */
export type SurfaceOverride = SurfaceAxis | null
export type ElevationAxis = 'subtle' | 'standard' | 'bold' | 'zero'
export type ButtonSizeAxis = 'sm' | 'md' | 'lg'

interface ThemeState {
  mode: ThemeMode
  shape: ShapeAxis
  density: DensityAxis
  interaction: InteractionAxis
  surfaceStyle: SurfaceAxis
  elevation: ElevationAxis
  buttonSize: ButtonSizeAxis
  surfaceStyleButton: SurfaceOverride
  surfaceStyleCard: SurfaceOverride
  surfaceStyleInput: SurfaceOverride
  surfaceStyleDropdown: SurfaceOverride
  surfaceStyleModal: SurfaceOverride
  surfaceStyleBadge: SurfaceOverride
  accentColor: string
  primaryColor: string
  secondaryColor: string
}

const STORAGE_KEY = 'cagm-ui-theme'

const DEFAULTS: ThemeState = {
  mode: 'light',
  shape: 'soft',
  density: 'padded',
  interaction: 'glow',
  surfaceStyle: 'flat',
  elevation: 'standard',
  buttonSize: 'md',
  surfaceStyleButton: null,
  surfaceStyleCard: null,
  surfaceStyleInput: null,
  surfaceStyleDropdown: null,
  surfaceStyleModal: null,
  surfaceStyleBadge: null,
  accentColor: '#6366f1',
  primaryColor: '#3b82f6',
  secondaryColor: '#7c3aed',
}

export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const { r: rRaw, g: gRaw, b: bRaw } = hexToRgb(hex)
  const r = rRaw / 255
  const g = gRaw / 255
  const b = bRaw / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h /= 6
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}

const state = reactive<ThemeState>({ ...DEFAULTS })

function applyMode(mode: ThemeMode) {
  document.documentElement.setAttribute('data-theme', mode)
}

function applyShape(shape: ShapeAxis) {
  document.documentElement.setAttribute('data-shape', shape)
}

function applyDensity(density: DensityAxis) {
  document.documentElement.setAttribute('data-density', density)
}

function applyInteraction(interaction: InteractionAxis) {
  document.documentElement.setAttribute('data-interaction', interaction)
}

function applySurfaceStyle(surfaceStyle: SurfaceAxis) {
  // 'flat' is the no-attribute default, so we remove the attribute instead of
  // setting data-surface="flat" — this keeps the DOM minimal and matches the
  // CSS selector `:root, [data-surface="flat"]` which already covers the
  // absent-attribute case.
  if (surfaceStyle === 'outlined') {
    document.documentElement.setAttribute('data-surface', 'outlined')
  } else if (surfaceStyle === 'filled') {
    document.documentElement.setAttribute('data-surface', 'filled')
  } else {
    document.documentElement.removeAttribute('data-surface')
  }
}

function applyElevation(elevation: ElevationAxis) {
  // 'standard' is the no-attribute default, mirroring how the surface axis
  // omits the attribute for its default ('flat'). This keeps the DOM minimal
  // and matches the CSS, where the standard values live on the un-attributed
  // `:root[data-theme="..."]` selectors.
  if (elevation === 'standard') {
    document.documentElement.removeAttribute('data-elevation')
  } else {
    document.documentElement.setAttribute('data-elevation', elevation)
  }
}

function applyButtonSize(buttonSize: ButtonSizeAxis) {
  // 'md' is the no-attribute default, mirroring how the elevation and surface
  // axes omit their default. Buttons that do not pass an explicit `size` prop
  // read this axis through useTheme() and fall back to 'md' when absent.
  if (buttonSize === 'md') {
    document.documentElement.removeAttribute('data-button-size')
  } else {
    document.documentElement.setAttribute('data-button-size', buttonSize)
  }
}

function applySurfaceOverride(
  category: 'button' | 'card' | 'input' | 'dropdown' | 'modal' | 'badge',
  value: SurfaceOverride,
) {
  // `null` means "inherit the global [data-surface] axis" — remove the
  // per-category attribute entirely. CSS falls back to the global values
  // via the `:root { --surface-...-<cat>: var(--surface-...); }` defaults.
  const attr = `data-surface-${category}`
  if (value === null) {
    document.documentElement.removeAttribute(attr)
  } else {
    document.documentElement.setAttribute(attr, value)
  }
}

type ColorName = 'primary' | 'secondary' | 'accent'

/*
 * Neutral surfaces the brand colors can be read against, used to derive a
 * guaranteed-AA text shade per color (see applyColorPalette).
 * Light mode: white surface, the page background (gray-100), and the color's
 * own lightest tonal tint (step 100) — the strictest of the three wins.
 * Dark mode: the raised surface (gray-800) and page background (gray-900).
 */
const LIGHT_TEXT_BACKGROUNDS = ['#ffffff', '#f4f4f5']
const DARK_TEXT_BACKGROUNDS = ['#27272a', '#18181b']
// Themes' "on-color" candidates: near-white and near-black text.
const ON_COLOR_CANDIDATES = ['#fafafa', '#18181b'].map((value) => ({
  value,
  rgb: hexToRgb(value),
}))

/**
 * Emit every brand-color token family for one color:
 * - `--<name>-h/-s/-l`: the existing picked-color triplet (unchanged).
 * - `--<name>-100-l` .. `--<name>-900-l`: the 9-step tonal ramp (lightness
 *   only — hue/saturation are shared via `--<name>-h/-s`).
 * - `--<name>-text-light-l` / `--<name>-text-dark-l`: a WCAG-AA-safe shade of
 *   the color for use as text on neutral/tonal surfaces, per mode.
 * - `--<name>-on-light` / `--<name>-on-dark`: the best-contrast (near-white or
 *   near-black) text color for a solid fill of the base color, per mode.
 *
 * CSS turns these into `--color-<name>-<step>` / `--color-<name>-text` /
 * `--color-on-<name>` tokens (theme.css / theme-dark.css).
 */
function applyColorPalette(name: ColorName, hex: string) {
  const { h, s, l } = hexToHsl(hex)
  const style = document.documentElement.style
  style.setProperty(`--${name}-h`, String(h))
  style.setProperty(`--${name}-s`, `${s}%`)
  style.setProperty(`--${name}-l`, `${l}%`)

  const scale = buildTonalScale(l)
  for (const step of TONAL_STEPS) {
    style.setProperty(`--${name}-${step}-l`, `${scale[step]}%`)
  }

  // Text-on-neutral shade. In dark mode --color-<name> is +4% lightness
  // (theme-dark.css), so the dark-mode on-color is computed against that.
  const tint100 = hslToRgb(h, s, scale[100])
  const lightBackgrounds = [...LIGHT_TEXT_BACKGROUNDS.map(hexToRgb), tint100]
  const darkBackgrounds = DARK_TEXT_BACKGROUNDS.map(hexToRgb)
  style.setProperty(
    `--${name}-text-light-l`,
    `${pickAccessibleLightness(h, s, scale, lightBackgrounds, 'dark')}%`,
  )
  style.setProperty(
    `--${name}-text-dark-l`,
    `${pickAccessibleLightness(h, s, scale, darkBackgrounds, 'light')}%`,
  )

  // Text placed directly ON a solid fill of the base color.
  style.setProperty(
    `--${name}-on-light`,
    pickHigherContrast(hslToRgb(h, s, l), ON_COLOR_CANDIDATES),
  )
  style.setProperty(
    `--${name}-on-dark`,
    pickHigherContrast(hslToRgb(h, s, l + 4), ON_COLOR_CANDIDATES),
  )
}

function applyAccentColor(hex: string) {
  applyColorPalette('accent', hex)
}

function applyPrimaryColor(hex: string) {
  applyColorPalette('primary', hex)
}

function applySecondaryColor(hex: string) {
  applyColorPalette('secondary', hex)
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore persistence failures (e.g. storage disabled)
  }
}

function setMode(mode: ThemeMode) {
  state.mode = mode
  applyMode(mode)
  persist()
}

function setShape(shape: ShapeAxis) {
  state.shape = shape
  applyShape(shape)
  persist()
}

function setDensity(density: DensityAxis) {
  state.density = density
  applyDensity(density)
  persist()
}

function setInteractionStyle(interaction: InteractionAxis) {
  state.interaction = interaction
  applyInteraction(interaction)
  persist()
}

function setSurfaceStyle(style: SurfaceAxis) {
  state.surfaceStyle = style
  applySurfaceStyle(style)
  persist()
}

function setElevation(elevation: ElevationAxis) {
  state.elevation = elevation
  applyElevation(elevation)
  persist()
}

function setButtonSize(buttonSize: ButtonSizeAxis) {
  state.buttonSize = buttonSize
  applyButtonSize(buttonSize)
  persist()
}

function setSurfaceStyleButton(value: SurfaceOverride) {
  state.surfaceStyleButton = value
  applySurfaceOverride('button', value)
  persist()
}

function setSurfaceStyleCard(value: SurfaceOverride) {
  state.surfaceStyleCard = value
  applySurfaceOverride('card', value)
  persist()
}

function setSurfaceStyleInput(value: SurfaceOverride) {
  state.surfaceStyleInput = value
  applySurfaceOverride('input', value)
  persist()
}

function setSurfaceStyleDropdown(value: SurfaceOverride) {
  state.surfaceStyleDropdown = value
  applySurfaceOverride('dropdown', value)
  persist()
}

function setSurfaceStyleModal(value: SurfaceOverride) {
  state.surfaceStyleModal = value
  applySurfaceOverride('modal', value)
  persist()
}

function setSurfaceStyleBadge(value: SurfaceOverride) {
  state.surfaceStyleBadge = value
  applySurfaceOverride('badge', value)
  persist()
}

function setAccentColor(hex: string) {
  state.accentColor = hex
  applyAccentColor(hex)
  persist()
}

function setPrimaryColor(hex: string) {
  state.primaryColor = hex
  applyPrimaryColor(hex)
  persist()
}

function setSecondaryColor(hex: string) {
  state.secondaryColor = hex
  applySecondaryColor(hex)
  persist()
}

function init() {
  let initial: ThemeState = {
    ...DEFAULTS,
    mode:
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light',
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      // Spread defaults under the stored blob so fields added in later
      // versions gracefully fall back to DEFAULTS for users on older blobs.
      initial = { ...initial, ...JSON.parse(stored) }
    }
  } catch {
    // ignore malformed/inaccessible storage
  }

  setMode(initial.mode)
  setShape(initial.shape)
  setDensity(initial.density)
  setInteractionStyle(initial.interaction)
  setSurfaceStyle(initial.surfaceStyle)
  setElevation(initial.elevation)
  setButtonSize(initial.buttonSize)
  setSurfaceStyleButton(initial.surfaceStyleButton)
  setSurfaceStyleCard(initial.surfaceStyleCard)
  setSurfaceStyleInput(initial.surfaceStyleInput)
  setSurfaceStyleDropdown(initial.surfaceStyleDropdown)
  setSurfaceStyleModal(initial.surfaceStyleModal)
  setSurfaceStyleBadge(initial.surfaceStyleBadge)
  setAccentColor(initial.accentColor)
  setPrimaryColor(initial.primaryColor)
  setSecondaryColor(initial.secondaryColor)
}

if (typeof document !== 'undefined') {
  init()
}

export function useTheme() {
  return {
    ...toRefs(state),
    setMode,
    setShape,
    setDensity,
    setInteractionStyle,
    setSurfaceStyle,
    setElevation,
    setButtonSize,
    setSurfaceStyleButton,
    setSurfaceStyleCard,
    setSurfaceStyleInput,
    setSurfaceStyleDropdown,
    setSurfaceStyleModal,
    setSurfaceStyleBadge,
    setAccentColor,
    setPrimaryColor,
    setSecondaryColor,
  }
}