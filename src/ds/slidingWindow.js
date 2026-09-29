/**
 * Sliding window: moving averages
 * ----------------------------------------------------------------------------
 * What:  A moving average of window k is the mean of the last k prices. This
 *        file has two versions:
 *          1. movingAverage(prices, k): the whole series in one pass.
 *          2. MovingAverage class: O(1) update when one new price arrives.
 *
 * Why a running sum and not recomputing each window?
 *        The naive way sums k numbers for every position: O(n * k). Neighbouring
 *        windows share k - 1 elements, so we keep one running sum. When the
 *        window slides we add the new price and subtract the one that left.
 *        Each step is O(1), and the whole series is O(n).
 *
 *        On every live tick the class version needs O(1) work per stock, no
 *        matter how long the history is. It stores the last k prices in a
 *        circular buffer, so dropping the oldest price is O(1). An
 *        Array.shift() would be O(k).
 *
 * Powers: the MA 5 and MA 20 trend lines on the price chart, and the trend
 *         arrow in the table.
 *
 * Complexity
 *   movingAverage(prices, k)   time O(n)   space O(n) for the output
 *   new MovingAverage(k)       time O(k)   space O(k) buffer
 *   MovingAverage.next(price)  time O(1)   space O(1)
 *   MovingAverage.peek(price)  time O(1)   no mutation
 *   MovingAverage.value        time O(1)
 *
 * On the dashboard the buffer holds closed days only: next() runs once per
 * day at rollover, and peek(livePrice) gives the live average on every tick.
 */

/**
 * Returns an array the same length as `prices`. Position i holds the average
 * of prices[i - k + 1 .. i], or null while fewer than k prices have been seen.
 * Keeping the output aligned with the input makes charting easy.
 */
export function movingAverage(prices, k) {
  const result = new Array(prices.length).fill(null)
  if (k <= 0) return result

  let sum = 0
  for (let i = 0; i < prices.length; i++) {
    sum += prices[i] // new price enters the window
    if (i >= k) sum -= prices[i - k] // oldest price leaves the window
    if (i >= k - 1) result[i] = sum / k // window is full, so record the average
  }
  return result
}

/**
 * Incremental moving average over the last k values.
 *   const ma = new MovingAverage(3)
 *   ma.next(1) // null  (window not full yet)
 *   ma.next(2) // null
 *   ma.next(3) // 2
 *   ma.next(6) // 3.67  (window is now [2, 3, 6])
 */
export class MovingAverage {
  constructor(k) {
    if (!Number.isInteger(k) || k <= 0) {
      throw new Error('Window size k must be a positive integer')
    }
    this.k = k
    this.buffer = new Array(k) // circular buffer holding the last k prices
    this.head = 0 // index of the oldest price in the buffer
    this.count = 0 // how many slots are filled (at most k)
    this.sum = 0
  }

  /** Add a price and return the new average (null until the window is full). */
  next(price) {
    if (this.count < this.k) {
      // Still filling: write into the next empty slot.
      this.buffer[(this.head + this.count) % this.k] = price
      this.count++
    } else {
      // Full: the oldest price sits at `head`. Overwrite it with the new one
      // and move head forward, wrapping around the end of the buffer.
      this.sum -= this.buffer[this.head]
      this.buffer[this.head] = price
      this.head = (this.head + 1) % this.k
    }
    this.sum += price
    return this.value
  }

  /**
   * The average the window would have if `price` were added next, without
   * adding it. With a full window the oldest value (at head) would drop out.
   */
  peek(price) {
    if (this.count < this.k - 1) return null
    const dropped = this.count === this.k ? this.buffer[this.head] : 0
    return (this.sum - dropped + price) / this.k
  }

  /** Current average, or null while the window is not yet full. */
  get value() {
    return this.count === this.k ? this.sum / this.k : null
  }
}
