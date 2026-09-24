/**
 * Small dependency-free helpers that turn arrays of numbers into SVG path
 * strings and donut geometry, so this example can draw charts inline without
 * pulling a charting library into the bundle.
 */

export type DonutTone = 'positive' | 'negative' | 'warning' | 'info'

export interface ChartPoint {
  x: number
  y: number
}

export interface DonutInput {
  label: string
  tone: DonutTone
  value: number
}

export interface DonutSegment extends DonutInput {
  /** Share of the total, between 0 and 1. */
  share: number
  /** Full ring circumference in user units. */
  circumference: number
  /** `stroke-dasharray` value, with a small gap carved out for the next segment. */
  dashArray: string
  /** Negative `stroke-dashoffset` that advances the arc to its start position. */
  dashOffset: number
}

const round = (value: number) => Math.round(value * 100) / 100

/**
 * Maps `values` into a `width` x `height` box. `paddingX`/`paddingY` keep the
 * extremes away from the edges so strokes are not clipped.
 */
export function toPoints(
  values: readonly number[],
  width: number,
  height: number,
  paddingX = 0,
  paddingY = paddingX,
): ChartPoint[] {
  if (values.length === 0) return []

  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  const innerWidth = width - paddingX * 2
  const innerHeight = height - paddingY * 2
  const step = values.length > 1 ? innerWidth / (values.length - 1) : 0

  return values.map((value, index) => ({
    x: paddingX + index * step,
    y: paddingY + innerHeight - ((value - min) / span) * innerHeight,
  }))
}

/** Straight polyline path — used by the KPI sparklines. */
export function buildLinePath(
  values: readonly number[],
  width: number,
  height: number,
  paddingX = 0,
  paddingY = paddingX,
): string {
  return toPoints(values, width, height, paddingX, paddingY)
    .map((point, index) => `${index === 0 ? 'M' : 'L'}${round(point.x)} ${round(point.y)}`)
    .join(' ')
}

/**
 * Smooth path through every point: Catmull-Rom control points converted to
 * cubic bezier segments. Used by the timeseries chart.
 */
export function buildSmoothPath(
  values: readonly number[],
  width: number,
  height: number,
  paddingX = 0,
  paddingY = paddingX,
): string {
  const points = toPoints(values, width, height, paddingX, paddingY)
  if (points.length < 3) return buildLinePath(values, width, height, paddingX, paddingY)

  let path = `M${round(points[0].x)} ${round(points[0].y)}`
  for (let index = 0; index < points.length - 1; index += 1) {
    const previous = points[index - 1] ?? points[index]
    const current = points[index]
    const next = points[index + 1]
    const afterNext = points[index + 2] ?? next

    const control1 = {
      x: current.x + (next.x - previous.x) / 6,
      y: current.y + (next.y - previous.y) / 6,
    }
    const control2 = {
      x: next.x - (afterNext.x - current.x) / 6,
      y: next.y - (afterNext.y - current.y) / 6,
    }

    path += ` C${round(control1.x)} ${round(control1.y)} ${round(control2.x)} ${round(control2.y)} ${round(next.x)} ${round(next.y)}`
  }

  return path
}

/**
 * Closes a line path down to the bottom edge of the box so it can be filled
 * as an area.
 */
export function closeAreaPath(
  linePath: string,
  values: readonly number[],
  width: number,
  height: number,
  paddingX = 0,
  paddingY = paddingX,
): string {
  if (!linePath) return ''

  const points = toPoints(values, width, height, paddingX, paddingY)
  const first = points[0]
  const last = points[points.length - 1]

  return `${linePath} L${round(last.x)} ${height} L${round(first.x)} ${height} Z`
}

/**
 * Builds `stroke-dasharray`/`stroke-dashoffset` geometry for a donut ring
 * drawn with the circle + dash trick. Colours are intentionally left to the
 * caller so the component can map `tone` onto design tokens.
 */
export function buildDonutSegments(
  items: readonly DonutInput[],
  radius = 44,
  gap = 3,
): DonutSegment[] {
  const circumference = 2 * Math.PI * radius
  const total = items.reduce((sum, item) => sum + item.value, 0) || 1
  let cursor = 0

  return items.map((item) => {
    const share = item.value / total
    const length = share * circumference
    const visible = Math.max(length - gap, 0.5)
    const segment: DonutSegment = {
      ...item,
      share,
      circumference,
      dashArray: `${round(visible)} ${round(circumference - visible)}`,
      dashOffset: round(-cursor),
    }
    cursor += length
    return segment
  })
}
