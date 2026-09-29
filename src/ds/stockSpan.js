/**
 * Monotonic stack: stock span
 * ----------------------------------------------------------------------------
 * What:  The span of a day is the number of consecutive days, ending today and
 *        including today, where the price was <= today's price. A span of 12
 *        means today's price is a "12-day high". This is LeetCode 901.
 *
 * Why a monotonic stack and not a nested loop?
 *        The nested-loop approach walks back from each day until it finds a
 *        higher price. That costs O(n^2) on a rising series.
 *
 *        Instead we keep a stack of earlier prices that are strictly
 *        decreasing from bottom to top. When today's price arrives we pop every
 *        entry that is <= today and add its span to ours. A popped day can
 *        never be the "blocker" for any later day, because today is at least
 *        as high and more recent. Each price is pushed once and popped at most
 *        once, so n prices cost O(n) total. That is O(1) amortized per day.
 *
 * Powers: the "Momentum" column ("12D high") and the Momentum stat.
 *
 * How the live dashboard uses it
 *        The stack only ever holds CLOSED days, and it is rebuilt from scratch
 *        once per day at rollover instead of being patched incrementally.
 *          - Rollover: rebuild(closedDays) runs next() over the (at most 59)
 *            closed prices: O(n). Evicting the oldest day from a monotonic
 *            stack would mean digging it out of the absorbed spans at the
 *            bottom, which the structure doesn't support. Rebuilding makes
 *            that bug impossible: a day that left the window was never pushed.
 *            With n = 59 once every two minutes, the cost is irrelevant.
 *          - Tick: the live price is not final, so it must not be pushed.
 *            peekSpan(price) walks the stack read-only and adds up the spans a
 *            real next(price) would absorb. Nothing is popped, so the cost is
 *            not amortized: O(d), where d is the number of entries <= price
 *            (worst case O(n) on a price that tops the whole window).
 *        The span of the live price is therefore at most closedDays + 1.
 *
 * Complexity
 *   Stack.push / pop / peek / isEmpty / size   time O(1)
 *   stockSpan(prices)                          time O(n)   space O(n)
 *   StockSpanner.next(price)                   time O(1) amortized, space O(n)
 *   StockSpanner.rebuild(prices)               time O(n)   space O(n)
 *   StockSpanner.peekSpan(price)               time O(d) <= O(n), no mutation
 */

/** Minimal array-backed stack. The top of the stack is the end of the array. */
export class Stack {
  constructor() {
    this.items = []
  }

  push(item) {
    this.items.push(item)
  }

  pop() {
    return this.items.pop() // undefined when empty
  }

  peek() {
    return this.items[this.items.length - 1]
  }

  isEmpty() {
    return this.items.length === 0
  }

  size() {
    return this.items.length
  }
}

/** Span for every day in one pass. Returns an array the same length as prices. */
export function stockSpan(prices) {
  const spans = new Array(prices.length)
  const stack = new Stack() // holds indices whose prices strictly decrease upward

  for (let i = 0; i < prices.length; i++) {
    // Pop every earlier day that is not higher than today. It can't block any
    // future day, because today is at least as high and more recent.
    while (!stack.isEmpty() && prices[stack.peek()] <= prices[i]) {
      stack.pop()
    }
    // If the stack is empty, nothing earlier was higher, so the span covers
    // all i + 1 days. Otherwise it reaches back to the day after the blocker.
    spans[i] = stack.isEmpty() ? i + 1 : i - stack.peek()
    stack.push(i)
  }
  return spans
}

/**
 * Online version for live updates. It only sees one price at a time, so it
 * stores [price, span] pairs instead of indices.
 *   const s = new StockSpanner()
 *   s.next(100) // 1
 *   s.next(80)  // 1
 *   s.next(90)  // 2
 */
export class StockSpanner {
  constructor() {
    this.stack = new Stack() // entries: { price, span }, prices strictly decrease upward
  }

  next(price) {
    let span = 1 // today always counts
    // Absorb every entry that is <= today. Its span is already a count of
    // consecutive lower days, so we add it on instead of re-walking them.
    while (!this.stack.isEmpty() && this.stack.peek().price <= price) {
      span += this.stack.pop().span
    }
    this.stack.push({ price, span })
    return span
  }

  /** Throw the stack away and rebuild it from `prices` (oldest first). O(n). */
  rebuild(prices) {
    this.stack = new Stack()
    for (const p of prices) this.next(p)
    return this
  }

  /**
   * The span `price` would get if it were pushed next, without pushing it.
   * Walks down from the top, summing the spans of entries <= price. Entries
   * strictly decrease upward, so the first one above `price` ends the walk.
   */
  peekSpan(price) {
    const items = this.stack.items
    let span = 1 // the live price itself
    for (let i = items.length - 1; i >= 0 && items[i].price <= price; i--) {
      span += items[i].span
    }
    return span
  }
}

/**
 * Brute-force reference for peekSpan: walk back over `closed` until a higher
 * price. O(n). Used by tests and the development-mode self-check.
 */
export function bruteForceSpan(closed, price) {
  let span = 1
  for (let i = closed.length - 1; i >= 0 && closed[i] <= price; i--) span++
  return span
}
