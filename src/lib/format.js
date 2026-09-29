const MINUS = '−' // typographic minus sign, same width as "+"

const priceFormat = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatPrice(value) {
  if (value == null) return '—'
  return `$${priceFormat.format(value)}`
}

/** 1.234 -> "+1.23%", -0.5 -> "−0.50%" */
export function formatPercent(value, digits = 2) {
  if (value == null) return '—'
  const rounded = Number(value.toFixed(digits))
  const sign = rounded > 0 ? '+' : rounded < 0 ? MINUS : ''
  return `${sign}${Math.abs(rounded).toFixed(digits)}%`
}

/** Signed dollar change: 2.5 -> "+$2.50" */
export function formatChange(value) {
  if (value == null) return '—'
  const rounded = Number(value.toFixed(2))
  const sign = rounded > 0 ? '+' : rounded < 0 ? MINUS : ''
  return `${sign}$${priceFormat.format(Math.abs(rounded))}`
}

/** "2026-09-25" -> "Sep 25" */
export function formatDate(iso) {
  const d = new Date(`${iso}T00:00:00Z`)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
}

// Spans below this are noise ("2D high" just means it beat yesterday).
export const MIN_MOMENTUM_SPAN = 5

/**
 * 12 -> "12D high", or null below MIN_MOMENTUM_SPAN. `maxSpan` is
 * closedDays + 1, the most a span can be: a price above every day in the
 * window reads "60D high".
 */
export function formatMomentum(span, maxSpan) {
  if (span == null || span < MIN_MOMENTUM_SPAN) return null
  return span >= maxSpan ? `${maxSpan}D high` : `${span}D high`
}

export function tone(value) {
  if (value > 0) return 'up'
  if (value < 0) return 'down'
  return 'flat'
}
