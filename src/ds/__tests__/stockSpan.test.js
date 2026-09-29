import { describe, it, expect } from 'vitest'
import { bruteForceSpan, Stack, stockSpan, StockSpanner } from '../stockSpan.js'

describe('Stack', () => {
  it('push / pop / peek / size / isEmpty', () => {
    const s = new Stack()
    expect(s.isEmpty()).toBe(true)
    expect(s.pop()).toBeUndefined()
    expect(s.peek()).toBeUndefined()

    s.push(1)
    s.push(2)
    expect(s.size()).toBe(2)
    expect(s.peek()).toBe(2)
    expect(s.pop()).toBe(2)
    expect(s.pop()).toBe(1)
    expect(s.isEmpty()).toBe(true)
  })
})

describe('stockSpan', () => {
  it('empty input', () => {
    expect(stockSpan([])).toEqual([])
  })

  it('single element', () => {
    expect(stockSpan([50])).toEqual([1])
  })

  it('classic LeetCode 901 example', () => {
    expect(stockSpan([100, 80, 60, 70, 60, 75, 85])).toEqual([1, 1, 1, 2, 1, 4, 6])
  })

  it('strictly increasing prices span back to day one', () => {
    expect(stockSpan([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5])
  })

  it('strictly decreasing prices have span 1', () => {
    expect(stockSpan([5, 4, 3, 2, 1])).toEqual([1, 1, 1, 1, 1])
  })

  it('duplicate prices count toward the span (<=)', () => {
    expect(stockSpan([10, 10, 10])).toEqual([1, 2, 3])
    expect(stockSpan([30, 10, 10, 20, 20])).toEqual([1, 1, 2, 3, 4])
  })
})

describe('StockSpanner (incremental)', () => {
  it('matches the batch version', () => {
    const prices = [100, 80, 60, 70, 60, 75, 85, 85, 20, 90]
    const spanner = new StockSpanner()
    expect(prices.map((p) => spanner.next(p))).toEqual(stockSpan(prices))
  })

  it('handles duplicates', () => {
    const spanner = new StockSpanner()
    expect(spanner.next(7)).toBe(1)
    expect(spanner.next(7)).toBe(2)
    expect(spanner.next(7)).toBe(3)
  })

  it('first call always returns 1', () => {
    expect(new StockSpanner().next(123)).toBe(1)
  })
})

describe('StockSpanner.rebuild / peekSpan', () => {
  it('rebuild matches pushing the same prices one by one', () => {
    const prices = [100, 80, 60, 70, 60, 75, 85, 85, 20, 90]
    const a = new StockSpanner()
    for (const p of prices) a.next(p)
    const b = new StockSpanner().rebuild([1, 999, 3]).rebuild(prices) // old contents are discarded
    expect(b.stack.items).toEqual(a.stack.items)
  })

  it('peekSpan returns what next() would, without changing the stack', () => {
    const prices = [100, 80, 60, 70, 60, 75, 85]
    const spanner = new StockSpanner().rebuild(prices)
    const before = JSON.stringify(spanner.stack.items)
    for (const p of [1, 60, 72, 85, 99, 100, 500]) {
      expect(spanner.peekSpan(p)).toBe(bruteForceSpan(prices, p))
    }
    expect(JSON.stringify(spanner.stack.items)).toBe(before)
  })

  it('45 falling days then 15 rising days gives the local span', () => {
    const closed = []
    for (let i = 0; i < 45; i++) closed.push(200 - i * 2) // 200 .. 112
    for (let i = 1; i <= 14; i++) closed.push(112 + i) // 113 .. 126
    expect(closed.length).toBe(59)
    const spanner = new StockSpanner().rebuild(closed)
    const live = 127 // 15th rising day
    const span = spanner.peekSpan(live)
    expect(span).toBe(bruteForceSpan(closed, live))
    expect(span).toBeGreaterThanOrEqual(15)
    expect(span).toBeLessThan(60) // blocked by the earlier, higher falling days
  })

  it('span never exceeds closed days + 1, even on a price above everything', () => {
    const closed = Array.from({ length: 59 }, (_, i) => 50 + i)
    expect(new StockSpanner().rebuild(closed).peekSpan(1e9)).toBe(60)
  })

  it('agrees with brute force on random series', () => {
    let seed = 42
    const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647
    for (let t = 0; t < 200; t++) {
      const closed = Array.from({ length: 1 + Math.floor(rand() * 59) }, () => Math.round(rand() * 20))
      const spanner = new StockSpanner().rebuild(closed)
      const live = Math.round(rand() * 22)
      expect(spanner.peekSpan(live)).toBe(bruteForceSpan(closed, live))
    }
  })
})
