import './base.css'
import './theme.css'
import './theme-dark.css'
import './semantic-colors.css'
import './shape.css'
import './elevation.css'
import './density.css'
import './interaction.css'
import './fonts.css'

export const TOKEN_AXES = {
  theme: ['light', 'dark'] as const,
  shape: ['square', 'soft', 'rounded', 'pill'] as const,
  density: ['full-width', 'padded'] as const,
  interaction: ['glow', 'material'] as const,
}
