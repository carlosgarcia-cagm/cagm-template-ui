// Hand-rolled SVG chart helpers for the dashboard example.
//
// Every chart in this folder is plain inline SVG (no charting library):
// these pure functions turn a series of numbers into SVG path `d`
// attributes sized for a given viewBox.

/**
 * Map a series of values to evenly spaced points inside a `width` x `height`
 * viewBox, keeping `padding` clear on every side. The smallest value sits on
 * the bottom edge and the largest on the top edge.
 */
function toPoints(values: number[], width: number, height: number, padding: number) {
  if (values.length === 0) return []

  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  const stepX = values.length > 1 ? (width - padding * 2) / (values.length - 1) : 0

  return values.map((value, index) => ({
    x: padding + index * stepX,
    y: height - padding - ((value - min) / span) * (height - padding * 2),
  }))
}

/**
 * Build an SVG path `d` attribute drawing a polyline through `values`.
 * Used by both the stat-card sparklines (`0 0 100 28`) and the larger
 * timeseries chart.
 */
export function toLinePath(values: number[], width: number, height: number, padding = 2): string {
  return toPoints(values, width, height, padding)
    .map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x.toFixed(2)},${point.y.toFixed(2)}`)
    .join(' ')
}

/** Same as {@link toLinePath} but closed to the bottom edge, for a soft area fill. */
export function toAreaPath(values: number[], width: number, height: number, padding = 2): string {
  const line = toLinePath(values, width, height, padding)
  if (!line) return ''
  return `${line} L${(width - padding).toFixed(2)},${height} L${padding.toFixed(2)},${height} Z`
}
