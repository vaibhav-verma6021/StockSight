import { describe, it, expect } from 'vitest'
import { MarketFeed, maSeries, MA_FAST, MA_SLOW, priceSeries, TOP_K } from '../market.js'
import { CLOSED_DAYS, MAX_UPDATE_SHARE, MIN_UPDATE_SHARE, TICKS_PER_DAY } from '../simulator.js'
import { bruteForceSpan } from '../../ds/stockSpan.js'
import { movingAverage } from '../../ds/slidingWindow.js'

// Deterministic PRNG so the ticks are reproducible.
function seeded(seed) {
  return () => {
    seed = (seed * 16807) % 2147483647
    return (seed - 1) / 2147483646
  }
}

const stackOf = (feed) => feed.states.map((st) => st.spanner.stack.items.map((e) => ({ ...e })))

describe('MarketFeed', () => {
  it('seeds 65 stocks, each with a sector and a volatility tier', () => {
    const feed = new MarketFeed()
    expect(feed.stocks.length).toBe(65)
    expect(new Set(feed.stocks.map((s) => s.ticker)).size).toBe(65)
    for (const st of feed.states) {
      expect(st.sector).toBeTruthy()
      expect(['calm', 'normal', 'volatile']).toContain(st.tier)
      expect(st.closedDays.length).toBe(CLOSED_DAYS)
    }
  })

  it('500 ticks with no rollover change only today.price', () => {
    const feed = new MarketFeed(undefined, seeded(1), { ticksPerDay: Infinity })
    const closedBefore = feed.states.map((st) => st.closedDays)
    const opensBefore = feed.states.map((st) => st.today.open)
    const stacksBefore = stackOf(feed)

    for (let i = 0; i < 500; i++) feed.step()

    feed.states.forEach((st, i) => {
      expect(st.closedDays).toBe(closedBefore[i]) // same array, never appended to
      expect(st.closedDays.length).toBe(CLOSED_DAYS)
      expect(st.today.open).toBe(opensBefore[i])
    })
    expect(stackOf(feed)).toEqual(stacksBefore)
    expect(feed.stocks.some((s, i) => s.price !== feed.states[i].today.open)).toBe(true) // prices did move
  })

  it('rollover closes today into closedDays and opens at that close', () => {
    const feed = new MarketFeed(undefined, seeded(2))
    for (let i = 0; i < TICKS_PER_DAY - 1; i++) feed.step()
    const closes = feed.states.map((st) => st.today.price)
    const oldest = feed.states.map((st) => st.closedDays[1])
    const day = feed.dayNumber

    feed.step() // the day's last tick is the rollover

    expect(feed.dayNumber).toBe(day + 1)
    expect(feed.snapshot.ticksLeft).toBe(TICKS_PER_DAY)
    feed.states.forEach((st, i) => {
      expect(st.closedDays.length).toBe(CLOSED_DAYS)
      expect(st.closedDays[CLOSED_DAYS - 1]).toBe(closes[i])
      expect(st.closedDays[0]).toBe(oldest[i]) // the oldest day dropped off
      expect(st.today).toEqual({ open: closes[i], price: closes[i] })
    })
  })

  it('span always equals brute force and never exceeds closedDays + 1', () => {
    const feed = new MarketFeed(undefined, seeded(7), { ticksPerDay: 6 }) // many rollovers
    for (let i = 0; i < 1500; i++) {
      for (const s of feed.step().stocks) {
        expect(s.span).toBe(bruteForceSpan(s.closedDays, s.price))
        expect(s.span).toBeLessThanOrEqual(s.closedDays.length + 1)
        expect(s.maxSpan).toBe(s.closedDays.length + 1)
      }
    }
  })

  it('live stats are derived from closedDays + today', () => {
    const feed = new MarketFeed(undefined, seeded(9), { ticksPerDay: 5 })
    for (let i = 0; i < 137; i++) feed.step()
    for (const s of feed.stocks) {
      const series = priceSeries(s)
      const last = series.length - 1
      expect(s.maFast).toBeCloseTo(movingAverage(series, MA_FAST)[last], 6)
      expect(s.maSlow).toBeCloseTo(movingAverage(series, MA_SLOW)[last], 6)
      expect(maSeries(series).ma20[last]).toBeCloseTo(s.maSlow, 6)
      expect(s.high).toBe(Math.max(...series))
      expect(s.low).toBe(Math.min(...series))
      expect(s.prevClose).toBe(s.closedDays[s.closedDays.length - 1])
    }
    expect(feed.snapshot.dates.length).toBe(CLOSED_DAYS + 1)
  })

  it('ticks only a share of stocks and keeps the others as the same object', () => {
    const feed = new MarketFeed(undefined, seeded(11), { ticksPerDay: Infinity })
    let ticked = 0
    const ticks = 50
    for (let i = 0; i < ticks; i++) {
      const before = feed.snapshot.stocks
      const after = feed.step().stocks
      for (let j = 0; j < after.length; j++) {
        if (after[j] === before[j]) continue
        ticked++
        expect(after[j].updatedAt).toBe(feed.tick)
      }
    }
    const share = ticked / (ticks * feed.stocks.length)
    expect(share).toBeGreaterThan(MIN_UPDATE_SHARE - 0.05)
    expect(share).toBeLessThan(MAX_UPDATE_SHARE + 0.05)
  })

  it('mean reversion keeps the daily change in a realistic band', () => {
    // No rollover, so each stock drifts against the same open for 2,000 ticks.
    const feed = new MarketFeed(undefined, seeded(13), { ticksPerDay: Infinity })
    for (let i = 0; i < 2000; i++) {
      for (const s of feed.step().stocks) {
        const limit = feed.states.find((st) => st.ticker === s.ticker).tier === 'volatile' ? 4 : 2
        expect(Math.abs(s.changePct)).toBeLessThan(limit)
      }
    }
  })

  it('top movers are the k best / worst by change', () => {
    const feed = new MarketFeed(undefined, seeded(3))
    const { stocks, gainers, losers } = feed.step()
    const byChange = [...stocks].sort((a, b) => b.changePct - a.changePct) // reference only
    expect(gainers.map((s) => s.ticker)).toEqual(byChange.slice(0, TOP_K).map((s) => s.ticker))
    expect(losers.map((s) => s.ticker)).toEqual(byChange.reverse().slice(0, TOP_K).map((s) => s.ticker))
  })

  it('verify mode stays quiet when spans are correct', () => {
    const warnings = []
    const warn = console.warn
    console.warn = (...args) => warnings.push(args)
    try {
      const feed = new MarketFeed(undefined, seeded(5), { ticksPerDay: 4, verify: true })
      for (let i = 0; i < 200; i++) feed.step()
    } finally {
      console.warn = warn
    }
    expect(warnings).toEqual([])
  })
})
