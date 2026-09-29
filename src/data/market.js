// MarketFeed: connects the simulated price feed to the data structures.
//
//   tick     -> today.price moves -> O(1) / read-only lookups -> snapshot -> UI
//   rollover -> today closes into closedDays -> MA slide, span rebuild -> UI
//
// Plain JS with no React, so it can be reasoned about (and tested) alone.
//
// Single source of truth per stock:
//   closedDays  the last CLOSED_DAYS finalized daily closes, oldest first.
//               Replaced (never mutated) once a day at rollover.
//   today       { open, price }. The ONLY thing a tick changes.
// Everything else (day change, moving averages, momentum span, 60D high/low,
// the chart series) is derived from those two. The data structures below are
// indexes over closedDays, and are rebuilt or slid only at rollover.

import seed from './seed.json'
import {
  appendCapped,
  CLOSED_DAYS,
  MAX_UPDATE_SHARE,
  MIN_UPDATE_SHARE,
  nextPrice,
  nextTradingDay,
  TICK_VOL_SCALE,
  TICKS_PER_DAY,
} from './simulator.js'
import { movingAverage, MovingAverage } from '../ds/slidingWindow.js'
import { bruteForceSpan, StockSpanner } from '../ds/stockSpan.js'
import { topKGainers, topKLosers } from '../ds/minHeap.js'

export const MA_FAST = 5
export const MA_SLOW = 20
export const TOP_K = 5

/** Chart series for a stock: closed days followed by the live price. */
export function priceSeries(stock) {
  return [...stock.closedDays, stock.today.price]
}

/** Moving-average series for the chart, derived from a price series. O(n). */
export function maSeries(series) {
  return { ma5: movingAverage(series, MA_FAST), ma20: movingAverage(series, MA_SLOW) }
}

function extremes(prices) {
  let high = -Infinity
  let low = Infinity
  for (const p of prices) {
    if (p > high) high = p
    if (p < low) low = p
  }
  return { high, low }
}

// Immutable view of one stock for the UI. Every field is derived from
// closedDays + today, each in O(1) except the read-only span walk.
function describe(st) {
  const { closedDays, today } = st
  const price = today.price
  const prevClose = today.open // today opens at the previous close
  const change = price - prevClose
  const maSlow = st.ma20.peek(price)

  return {
    ticker: st.ticker,
    name: st.name,
    sector: st.sector,
    closedDays,
    today,
    price,
    prevClose,
    change,
    changePct: prevClose ? (change / prevClose) * 100 : 0,
    maFast: st.ma5.peek(price),
    maSlow,
    trend: maSlow == null ? null : price >= maSlow ? 'up' : 'down', // above / below MA 20
    span: st.spanner.peekSpan(price), // read-only: the live price is never pushed
    maxSpan: closedDays.length + 1,
    high: Math.max(st.closedHigh, price),
    low: Math.min(st.closedLow, price),
    direction: st.direction, // 'up' | 'down' after a tick, drives the flash animation
    updatedAt: st.updatedAt, // tick of the last price change, keys the flash animation
  }
}

export class MarketFeed {
  /**
   * @param data     seed: { dates, stocks: [{ ticker, name, sector, vol, prices }] }
   * @param random   PRNG in [0, 1), injectable for tests
   * @param options  ticksPerDay: ticks between rollovers (Infinity = never)
   *                 verify: brute-force check every span after each step
   */
  constructor(data = seed, random = Math.random, { ticksPerDay = TICKS_PER_DAY, verify = false } = {}) {
    this.random = random
    this.ticksPerDay = ticksPerDay
    this.verify = verify
    this.tick = 0
    this.ticksIntoDay = 0

    // The last seed price is today's live price. Everything before it is closed.
    const closedDates = data.dates.slice(0, -1).slice(-CLOSED_DAYS)
    this.todayDate = data.dates[data.dates.length - 1]
    this.dates = [...closedDates, this.todayDate]
    this.dayNumber = data.dates.length // today is day 60 of the seed history

    this.states = data.stocks.map((s) => this.initState(s))
    this.stocks = this.states.map(describe)
    this.snapshot = this.buildSnapshot()
  }

  initState({ ticker, name, sector, vol, prices }) {
    const closedDays = prices.slice(0, -1).slice(-CLOSED_DAYS)
    const { high, low } = extremes(closedDays)
    const st = {
      ticker,
      name,
      sector,
      vol,
      closedDays,
      today: { open: closedDays[closedDays.length - 1], price: prices[prices.length - 1] },
      ma5: new MovingAverage(MA_FAST),
      ma20: new MovingAverage(MA_SLOW),
      spanner: new StockSpanner().rebuild(closedDays),
      closedHigh: high, // cached once a day, so the live 60D high/low is O(1)
      closedLow: low,
      direction: null,
      updatedAt: 0,
    }
    for (const p of closedDays) {
      st.ma5.next(p)
      st.ma20.next(p)
    }
    return st
  }

  /** Ticks left until the current day closes (1 means the next step closes it). */
  get ticksLeft() {
    return this.ticksPerDay - this.ticksIntoDay
  }

  /** Advance one tick. The last tick of each day is the rollover. */
  step() {
    this.tick++
    this.ticksIntoDay++
    if (this.ticksIntoDay >= this.ticksPerDay) this.rollover()
    else this.moveToday()

    if (this.verify) this.selfCheck()
    this.snapshot = this.buildSnapshot()
    return this.snapshot
  }

  /**
   * Intraday tick. A random 30–50% of stocks trade, and only their
   * today.price changes. closedDays, the moving-average windows and the span
   * stack are not touched. Stocks that don't trade keep the same snapshot
   * object, so the UI can skip them with a reference check.
   */
  moveToday() {
    const share = MIN_UPDATE_SHARE + this.random() * (MAX_UPDATE_SHARE - MIN_UPDATE_SHARE)
    const stocks = [...this.stocks]

    for (let i = 0; i < this.states.length; i++) {
      if (this.random() >= share) continue // no trade this tick
      const st = this.states[i]
      const prev = st.today.price
      const price = nextPrice(prev, this.random, st.vol * TICK_VOL_SCALE)
      st.today = { open: st.today.open, price }
      st.direction = price > prev ? 'up' : price < prev ? 'down' : null
      st.updatedAt = this.tick
      stocks[i] = describe(st)
    }
    this.stocks = stocks
  }

  /**
   * Close the day for every stock: today's price becomes the newest closed
   * day, the oldest falls off, and a new day opens at that close.
   */
  rollover() {
    this.ticksIntoDay = 0
    this.dayNumber++
    this.todayDate = nextTradingDay(this.todayDate)
    this.dates = appendCapped(this.dates, this.todayDate, CLOSED_DAYS + 1)

    for (const st of this.states) {
      const close = st.today.price
      st.closedDays = appendCapped(st.closedDays, close, CLOSED_DAYS)
      st.ma5.next(close) // O(1) sliding window: add close, drop the day that left
      st.ma20.next(close)
      st.spanner.rebuild(st.closedDays) // O(n) rebuild: evicted days can't linger
      const { high, low } = extremes(st.closedDays) // O(n), once a day
      st.closedHigh = high
      st.closedLow = low
      st.today = { open: close, price: close }
      st.direction = null
    }
    this.stocks = this.states.map(describe)
  }

  /** Development check: every live span must match a brute-force walk. */
  selfCheck() {
    for (const s of this.stocks) {
      const expected = bruteForceSpan(s.closedDays, s.price)
      if (s.span !== expected || s.span > s.maxSpan) {
        console.warn(
          `[stocksight] span mismatch for ${s.ticker} on tick ${this.tick}: ` +
            `peekSpan=${s.span}, brute force=${expected}, max=${s.maxSpan}`,
        )
      }
    }
  }

  buildSnapshot() {
    const stocks = this.stocks
    let advancers = 0
    let decliners = 0
    let totalPct = 0
    for (const s of stocks) {
      if (s.changePct > 0) advancers++
      else if (s.changePct < 0) decliners++
      totalPct += s.changePct
    }

    return {
      tick: this.tick,
      day: this.dayNumber,
      ticksLeft: this.ticksLeft,
      dates: this.dates, // closed dates + today's date, aligned with priceSeries()
      stocks,
      // Every stock goes through the heap each tick, ticked or not: a stock
      // that sat out can still be pushed out of the top k by one that moved.
      gainers: topKGainers(stocks, TOP_K), // O(n log k) bounded heap, no full sort
      losers: topKLosers(stocks, TOP_K),
      advancers,
      decliners,
      avgChangePct: stocks.length ? totalPct / stocks.length : 0,
    }
  }
}
