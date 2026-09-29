import { useId } from 'react'

// Plain SVG instead of Recharts: there's one per table row, and they only
// redraw when their row does.
export function Sparkline({ data, width = 96, height = 28 }) {
  const gradientId = `spark-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  if (!data || data.length < 2) return <svg width={width} height={height} aria-hidden />

  let min = Infinity
  let max = -Infinity
  for (const v of data) {
    if (v < min) min = v
    if (v > max) max = v
  }
  const range = max - min || 1
  const pad = 2
  const stepX = width / (data.length - 1)
  const y = (v) => height - pad - ((v - min) / range) * (height - pad * 2)

  const line = data.map((v, i) => `${(i * stepX).toFixed(1)},${y(v).toFixed(1)}`).join(' ')
  const color = data[data.length - 1] >= data[0] ? 'var(--color-up)' : 'var(--color-down)'

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden className="overflow-visible">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${height} ${line} ${width},${height}`} fill={`url(#${gradientId})`} />
      <polyline points={line} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}
