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
// Only a share of the market trades on each tick (~30–50%), like a real feed
// where quotes arrive unevenly. Stocks that don't tick keep their snapshot
// object untouched, so memoized table rows skip re-rendering.
export const MIN_UPDATE_SHARE = 0.3
export const MAX_UPDATE_SHARE = 0.5

// Largest random move on one tick, by volatility tier (fraction of price).
export const TICK_MOVE = { calm: 0.0003, normal: 0.0006, volatile: 0.0012 }

// Each tick also pulls the price back toward the day's open by this share of
// the gap, so a day's change stays in a realistic band instead of wandering.
export const REVERSION = 0.04

/** Next price: uniform noise in ±maxMove plus a pull toward `anchor`, in cents. */
export function nextPrice(price, rand = Math.random, maxMove = TICK_MOVE.normal, anchor = price) {
  const pct = (rand() * 2 - 1) * maxMove - REVERSION * (price / anchor - 1)
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
