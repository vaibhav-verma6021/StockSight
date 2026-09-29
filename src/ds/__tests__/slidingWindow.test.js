import { describe, it, expect } from 'vitest'
import { movingAverage, MovingAverage } from '../slidingWindow.js'

// Brute-force reference: recompute every window from scratch.
function naiveMA(prices, k) {
  return prices.map((_, i) => {
    if (i < k - 1) return null
    let sum = 0
    for (let j = i - k + 1; j <= i; j++) sum += prices[j]
    return sum / k
  })
}

describe('movingAverage', () => {
  it('returns an empty array for empty input', () => {
    expect(movingAverage([], 5)).toEqual([])
  })

  it('computes a simple window', () => {
    expect(movingAverage([1, 2, 3, 4, 5], 3)).toEqual([null, null, 2, 3, 4])
  })

  it('k = 1 returns the prices themselves', () => {
    expect(movingAverage([4, 8, 15], 1)).toEqual([4, 8, 15])
  })

  it('k > n returns all nulls', () => {
    expect(movingAverage([1, 2, 3], 5)).toEqual([null, null, null])
  })

  it('k = n gives a single average at the end', () => {
    expect(movingAverage([2, 4, 6], 3)).toEqual([null, null, 4])
  })

  it('single element', () => {
    expect(movingAverage([42], 1)).toEqual([42])
    expect(movingAverage([42], 2)).toEqual([null])
  })

  it('k <= 0 returns all nulls', () => {
    expect(movingAverage([1, 2], 0)).toEqual([null, null])
  })

  it('matches the brute-force result on a longer series', () => {
    const prices = Array.from({ length: 60 }, (_, i) => 100 + Math.sin(i / 3) * 10 + i * 0.5)
    const fast = movingAverage(prices, 20)
    const slow = naiveMA(prices, 20)
    fast.forEach((v, i) => {
      if (slow[i] === null) expect(v).toBeNull()
      else expect(v).toBeCloseTo(slow[i], 9)
    })
  })
})

describe('MovingAverage (incremental)', () => {
  it('returns null until the window is full', () => {
    const ma = new MovingAverage(3)
    expect(ma.value).toBeNull()
    expect(ma.next(1)).toBeNull()
    expect(ma.next(2)).toBeNull()
    expect(ma.next(3)).toBe(2)
  })

  it('slides the window and drops the oldest value', () => {
    const ma = new MovingAverage(3)
    ;[1, 2, 3].forEach((p) => ma.next(p))
    expect(ma.next(6)).toBeCloseTo((2 + 3 + 6) / 3)
    expect(ma.next(9)).toBeCloseTo((3 + 6 + 9) / 3)
  })

  it('k = 1 always equals the last price', () => {
    const ma = new MovingAverage(1)
    expect(ma.next(5)).toBe(5)
    expect(ma.next(7)).toBe(7)
  })

  it('agrees with the batch version over many wrap-arounds', () => {
    const prices = Array.from({ length: 100 }, (_, i) => (i * 37) % 23)
    const batch = movingAverage(prices, 7)
    const ma = new MovingAverage(7)
    prices.forEach((p, i) => {
      const v = ma.next(p)
      if (batch[i] === null) expect(v).toBeNull()
      else expect(v).toBeCloseTo(batch[i], 9)
    })
  })

  it('rejects an invalid window size', () => {
    expect(() => new MovingAverage(0)).toThrow()
    expect(() => new MovingAverage(2.5)).toThrow()
  })
})

describe('MovingAverage.peek', () => {
  it('returns the average next(price) would, without mutating', () => {
    const ma = new MovingAverage(3)
    expect(ma.peek(5)).toBeNull() // 0 values + 1 is not a full window
    ma.next(1)
    ma.next(2)
    expect(ma.peek(6)).toBe(3) // (1 + 2 + 6) / 3
    expect(ma.value).toBeNull() // unchanged
    ma.next(3)
    expect(ma.peek(9)).toBeCloseTo((2 + 3 + 9) / 3)
    expect(ma.value).toBe(2)
  })
})

