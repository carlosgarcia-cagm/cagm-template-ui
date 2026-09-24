import type { ShapeAxis } from './useTheme'

export interface ThemePreset {
  name: string
  accentColor: string
  primaryColor: string
  secondaryColor: string
  shape: ShapeAxis
  description: string
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    name: 'Indigo / Soft',
    accentColor: '#6366f1',
    primaryColor: '#6366f1',
    secondaryColor: '#06b6d4',
    shape: 'soft',
    description: 'Balanced, friendly default with gently rounded corners.',
  },
  {
    name: 'Emerald / Rounded',
    accentColor: '#10b981',
    primaryColor: '#10b981',
    secondaryColor: '#6366f1',
    shape: 'rounded',
    description: 'Fresh, organic feel with generously rounded corners.',
  },
  {
    name: 'Rose / Pill',
    accentColor: '#f43f5e',
    primaryColor: '#f43f5e',
    secondaryColor: '#8b5cf6',
    shape: 'pill',
    description: 'Playful and bold with fully rounded pill shapes.',
  },
  {
    name: 'Slate / Square',
    accentColor: '#475569',
    primaryColor: '#475569',
    secondaryColor: '#0ea5e9',
    shape: 'square',
    description: 'Sharp, utilitarian look with crisp square corners.',
  },
  {
    name: 'Amber / Soft',
    accentColor: '#f59e0b',
    primaryColor: '#f59e0b',
    secondaryColor: '#ef4444',
    shape: 'soft',
    description: 'Warm and energetic with softly rounded corners.',
  },
]
