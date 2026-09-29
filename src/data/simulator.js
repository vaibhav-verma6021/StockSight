// Simulated market feed. Pure functions, no React and no data structures.
//
// Time model: a trading day lasts DAY_MS of wall-clock time and is made of
// TICKS_PER_DAY live ticks. Ticks only move today's price. At the end of the
// day it is closed and appended to history (the "rollover").

export const TICK_MS = 5000
export const DAY_MS = 2 * 60 * 1000
export const TICKS_PER_DAY = DAY_MS / TICK_MS // 24
export const CLOSED_DAYS = 59 // finalized daily closes kept per stock
export const HISTORY_LENGTH = CLOSED_DAYS + 1 // chart points: closed days + today
export const DEFAULT_VOL = 0.0115
// Only a share of the market trades on each tick (~30–50%), like a real feed
// where quotes arrive unevenly. Stocks that don't tick keep their snapshot
// object untouched, so memoized table rows skip re-rendering.
export const MIN_UPDATE_SHARE = 0.3
export const MAX_UPDATE_SHARE = 0.5

// A stock trades on about TICKS_PER_DAY * 40% ticks a day. Scaling each move
// by 1 / √(that count) keeps the whole day's move close to its daily vol.
export const TICK_VOL_SCALE = 1 / Math.sqrt(TICKS_PER_DAY * ((MIN_UPDATE_SHARE + MAX_UPDATE_SHARE) / 2))

const SQRT3 = Math.sqrt(3)

/**
 * Next price from a small random walk, rounded to cents. `vol` is the std dev
 * of one move (the caller scales daily vol down to a per-tick vol). A uniform
 * move in [-a, a] has std dev a / √3, so the bound is vol · √3.
 */
export function nextPrice(price, rand = Math.random, vol = DEFAULT_VOL) {
  const pct = (rand() * 2 - 1) * vol * SQRT3
  const next = price * (1 + pct)
  return Math.max(0.01, Math.round(next * 100) / 100)
}

export function nextTradingDay(date) {
  const d = new Date(`${date}T00:00:00Z`)
  do {
    d.setUTCDate(d.getUTCDate() + 1)
  } while (d.getUTCDay() === 0 || d.getUTCDay() === 6)
  return d.toISOString().slice(0, 10)
}

export function appendCapped(list, value, max = HISTORY_LENGTH) {
  const next = [...list, value]
  return next.length > max ? next.slice(next.length - max) : next
}
