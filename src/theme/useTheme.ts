import { reactive, toRefs } from 'vue'

export type ThemeMode = 'light' | 'dark'
export type ShapeAxis = 'square' | 'soft' | 'rounded' | 'pill'
export type DensityAxis = 'full-width' | 'padded'
export type InteractionAxis = 'glow' | 'material'

interface ThemeState {
  mode: ThemeMode
  shape: ShapeAxis
  density: DensityAxis
  interaction: InteractionAxis
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
  accentColor: '#6366f1',
  primaryColor: '#3b82f6',
  secondaryColor: '#7c3aed',
}

export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const normalized = hex.replace('#', '')
  const full =
    normalized.length === 3
      ? normalized
          .split('')
          .map((c) => c + c)
          .join('')
      : normalized

  const r = parseInt(full.slice(0, 2), 16) / 255
  const g = parseInt(full.slice(2, 4), 16) / 255
  const b = parseInt(full.slice(4, 6), 16) / 255

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

function applyAccentColor(hex: string) {
  const { h, s, l } = hexToHsl(hex)
  const style = document.documentElement.style
  style.setProperty('--accent-h', String(h))
  style.setProperty('--accent-s', `${s}%`)
  style.setProperty('--accent-l', `${l}%`)
}

function applyPrimaryColor(hex: string) {
  const { h, s, l } = hexToHsl(hex)
  const style = document.documentElement.style
  style.setProperty('--primary-h', String(h))
  style.setProperty('--primary-s', `${s}%`)
  style.setProperty('--primary-l', `${l}%`)
}

function applySecondaryColor(hex: string) {
  const { h, s, l } = hexToHsl(hex)
  const style = document.documentElement.style
  style.setProperty('--secondary-h', String(h))
  style.setProperty('--secondary-s', `${s}%`)
  style.setProperty('--secondary-l', `${l}%`)
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
      initial = { ...initial, ...JSON.parse(stored) }
    }
  } catch {
    // ignore malformed/inaccessible storage
  }

  setMode(initial.mode)
  setShape(initial.shape)
  setDensity(initial.density)
  setInteractionStyle(initial.interaction)
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
    setAccentColor,
    setPrimaryColor,
    setSecondaryColor,
  }
}
