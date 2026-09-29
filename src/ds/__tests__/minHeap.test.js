import { describe, it, expect } from 'vitest'
import { MinHeap, topKGainers, topKLosers } from '../minHeap.js'

const stock = (ticker, changePct) => ({ ticker, changePct })
const tickers = (list) => list.map((s) => s.ticker)

describe('MinHeap', () => {
  it('empty heap', () => {
    const h = new MinHeap()
    expect(h.size()).toBe(0)
    expect(h.peek()).toBeUndefined()
    expect(h.pop()).toBeUndefined()
  })

  it('single element', () => {
    const h = new MinHeap()
    h.push(7)
    expect(h.peek()).toBe(7)
    expect(h.pop()).toBe(7)
    expect(h.size()).toBe(0)
  })

  it('pops numbers in ascending order', () => {
    const h = new MinHeap()
    const input = [5, 3, 9, 1, 1, 8, 2, 7, 0, 6]
    input.forEach((n) => h.push(n))
    const out = []
    while (h.size() > 0) out.push(h.pop())
    expect(out).toEqual([0, 1, 1, 2, 3, 5, 6, 7, 8, 9])
  })

  it('keeps the heap property after every push', () => {
    const h = new MinHeap()
    for (const n of [9, 4, 7, 1, 8, 2, 6, 3, 5]) {
      h.push(n)
      for (let i = 1; i < h.heap.length; i++) {
        expect(h.heap[(i - 1) >> 1]).toBeLessThanOrEqual(h.heap[i])
      }
    }
  })

  it('accepts a custom comparator (max-heap)', () => {
    const h = new MinHeap((a, b) => b - a)
    ;[3, 10, 1].forEach((n) => h.push(n))
    expect(h.pop()).toBe(10)
    expect(h.pop()).toBe(3)
  })
})

describe('topKGainers / topKLosers', () => {
  const stocks = [
    stock('AAPL', 1.2),
    stock('TSLA', -3.4),
    stock('NVDA', 4.1),
    stock('INTC', -0.5),
    stock('META', 2.2),
    stock('DIS', -1.9),
  ]

  it('returns the top k gainers, highest first', () => {
    expect(tickers(topKGainers(stocks, 3))).toEqual(['NVDA', 'META', 'AAPL'])
  })

  it('returns the top k losers, lowest first', () => {
    expect(tickers(topKLosers(stocks, 3))).toEqual(['TSLA', 'DIS', 'INTC'])
  })

  it('empty input', () => {
    expect(topKGainers([], 5)).toEqual([])
    expect(topKLosers([], 5)).toEqual([])
  })

  it('k > n returns every stock, still ordered', () => {
    expect(tickers(topKGainers(stocks, 50))).toEqual(['NVDA', 'META', 'AAPL', 'INTC', 'DIS', 'TSLA'])
  })

  it('k = 0 returns nothing', () => {
    expect(topKGainers(stocks, 0)).toEqual([])
  })

  it('single element', () => {
    expect(tickers(topKLosers([stock('V', 0.3)], 1))).toEqual(['V'])
  })

  it('does not mutate the input', () => {
    const copy = [...stocks]
    topKGainers(stocks, 2)
    expect(stocks).toEqual(copy)
  })
})
