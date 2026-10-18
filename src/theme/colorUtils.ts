/*
 * Color math shared by the theme layer. Two jobs:
 *
 * 1. A fixed 9-step tonal ramp (100..900) around a picked brand color, so the
 *    theme can expose per-color shades (--color-primary-700, ...) instead of a
 *    single hue+lightness.
 * 2. Proper WCAG 2.x relative-luminance contrast so a text color can be chosen
 *    that *guarantees* AA (>= 4.5:1) instead of relying on a naive heuristic
 *    (e.g. "dark colors get white text").
 *
 * Everything is pure and framework-free so it is easy to unit-test later.
 */

export interface Rgb {
  r: number
  g: number
  b: number
}

export interface Hsl {
  h: number
  s: number
  l: number
}

export const TONAL_STEPS = [100, 200, 300, 400, 500, 600, 700, 800, 900] as const
export type TonalStep = (typeof TONAL_STEPS)[number]

/**
 * Base lightness ramp (% units) shared by every brand color. Step 500 is the
 * "reference" shade and is replaced by the picked color's own lightness (see
 * `buildTonalScale`); the surrounding steps are fixed so the ramp stays
 * visually smooth even when the user picks an extreme (very light/dark) color.
 * Hue and saturation are intentionally NOT varied — only lightness — which
 * keeps the scale predictable and cheap to emit as `--<name>-<step>-l`.
 */
export const TONAL_LIGHTNESS_RAMP: Record<TonalStep, number> = {
  100: 95,
  200: 88,
  300: 78,
  400: 65,
  500: 53,
  600: 45,
  700: 37,
  800: 29,
  900: 20,
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

/** Parse `#rgb` / `#rrggbb` into 0-255 sRGB channels. Falls back to black on malformed input. */
export function hexToRgb(hex: string): Rgb {
  const normalized = hex.replace('#', '').trim()
  const full =
    normalized.length === 3
      ? normalized
          .split('')
          .map((c) => c + c)
          .join('')
      : normalized

  if (full.length !== 6 || !/^[0-9a-fA-F]{6}$/.test(full)) {
    return { r: 0, g: 0, b: 0 }
  }

  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  }
}

/**
 * HSL -> sRGB. `h` in degrees [0, 360), `s` and `l` in percent [0, 100].
 * Standard CSS HSL algorithm; result channels are rounded 0-255.
 */
export function hslToRgb(h: number, s: number, l: number): Rgb {
  const hue = ((h % 360) + 360) % 360
  const sat = clamp(s, 0, 100) / 100
  const light = clamp(l, 0, 100) / 100

  const c = (1 - Math.abs(2 * light - 1)) * sat
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1))
  const m = light - c / 2

  let rp = 0
  let gp = 0
  let bp = 0
  if (hue < 60) [rp, gp, bp] = [c, x, 0]
  else if (hue < 120) [rp, gp, bp] = [x, c, 0]
  else if (hue < 180) [rp, gp, bp] = [0, c, x]
  else if (hue < 240) [rp, gp, bp] = [0, x, c]
  else if (hue < 300) [rp, gp, bp] = [x, 0, c]
  else [rp, gp, bp] = [c, 0, x]

  return {
    r: Math.round((rp + m) * 255),
    g: Math.round((gp + m) * 255),
    b: Math.round((bp + m) * 255),
  }
}

function channelToLinear(channel: number): number {
  const c = channel / 255
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

/** WCAG 2.x relative luminance (0 = black, 1 = white). */
export function relativeLuminance(rgb: Rgb): number {
  return (
    0.2126 * channelToLinear(rgb.r) +
    0.7152 * channelToLinear(rgb.g) +
    0.0722 * channelToLinear(rgb.b)
  )
}

/** WCAG 2.x contrast ratio: (L_lighter + 0.05) / (L_darker + 0.05). Range 1..21. */
export function contrastRatio(a: Rgb, b: Rgb): number {
  const la = relativeLuminance(a)
  const lb = relativeLuminance(b)
  const lighter = Math.max(la, lb)
  const darker = Math.min(la, lb)
  return (lighter + 0.05) / (darker + 0.05)
}

/** True when `fg` on `bg` meets WCAG AA for normal text (default 4.5:1). */
export function meetsAA(fg: Rgb, bg: Rgb, min = 4.5): boolean {
  return contrastRatio(fg, bg) >= min
}

/**
 * Build the concrete scale for a picked color: fixed ramp with step 500
 * pinned to the picked lightness, clamped to a mid-range band (~50-56%) so a
 * very light/dark pick still produces a usable, smooth full scale. The picked
 * color itself remains available untouched as `--color-<name>`.
 */
export function buildTonalScale(baseLightness: number): Record<TonalStep, number> {
  return {
    ...TONAL_LIGHTNESS_RAMP,
    500: clamp(Math.round(baseLightness), 50, 56),
  }
}

/**
 * Pick the lightness (from the scale) of a text-safe shade of the color.
 *
 * Contra the "just use black/white" heuristic, this walks the actual scale and
 * returns the first step that clears AA against EVERY background it may sit
 * on. `prefer: 'dark'` searches light -> dark (dark text for light surfaces);
 * `prefer: 'light'` searches dark -> light (light text for dark surfaces).
 *
 * If no step clears AA (rare, only with extremely low-saturation edge cases)
 * the most extreme step is returned, which maximises the achievable contrast.
 */
export function pickAccessibleLightness(
  h: number,
  s: number,
  scale: Record<TonalStep, number>,
  backgrounds: Rgb[],
  prefer: 'dark' | 'light',
  min = 4.5,
): number {
  const ordered: readonly TonalStep[] =
    prefer === 'dark' ? TONAL_STEPS : [...TONAL_STEPS].slice().reverse()

  let fallback = scale[ordered[ordered.length - 1]]
  for (const step of ordered) {
    const lightness = scale[step]
    const rgb = hslToRgb(h, s, lightness)
    fallback = lightness
    if (backgrounds.every((bg) => contrastRatio(rgb, bg) >= min)) {
      return lightness
    }
  }
  return fallback
}

/**
 * Given a solid background, return whichever candidate has the highest
 * contrast — used for "on-color" text placed directly on a brand fill.
 */
export function pickHigherContrast(
  background: Rgb,
  candidates: { value: string; rgb: Rgb }[],
): string {
  let best = candidates[0]
  let bestRatio = -1
  for (const candidate of candidates) {
    const ratio = contrastRatio(candidate.rgb, background)
    if (ratio > bestRatio) {
      bestRatio = ratio
      best = candidate
    }
  }
  return best.value
}
