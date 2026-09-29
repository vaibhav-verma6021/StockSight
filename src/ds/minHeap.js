/**
 * Binary min-heap: top-K movers
 * ----------------------------------------------------------------------------
 * What:  A complete binary tree stored in an array. Every parent is "smaller"
 *        (by the comparator) than its children, so the smallest item is always
 *        at index 0.
 *          parent(i) = (i - 1) >> 1
 *          left(i)   = 2i + 1
 *          right(i)  = 2i + 2
 *
 * Why a heap and not sorting?
 *        Sorting all n stocks to take the top k costs O(n log n) and orders
 *        items we then throw away. A min-heap capped at size k keeps only the
 *        best k seen so far, and its root is the weakest of them. Each new
 *        stock is pushed, and if the heap grows past k we pop the root. The
 *        weakest candidate drops out. Total cost is O(n log k) time and O(k)
 *        extra space. Top Movers recomputes on every tick, and k (5) is much
 *        smaller than n, so this does less work than a full sort.
 *
 * Powers: the Top Movers panel (Gainers / Losers), plus the top gainer and
 *         top loser stat cards.
 *
 * Complexity (heap holding m items)
 *   push      time O(log m)
 *   pop       time O(log m)
 *   peek      time O(1)
 *   size      time O(1)
 *   siftUp    time O(log m)
 *   siftDown  time O(log m)
 *   topKGainers / topKLosers   time O(n log k)   space O(k)
 */

const defaultCompare = (a, b) => a - b

export class MinHeap {
  /**
   * @param {(a, b) => number} compare  negative if a should sit above b.
   *        Pass (a, b) => b - a to turn this into a max-heap.
   */
  constructor(compare = defaultCompare) {
    this.heap = []
    this.compare = compare
  }

  size() {
    return this.heap.length
  }

  peek() {
    return this.heap[0] // undefined when empty
  }

  push(item) {
    this.heap.push(item) // add at the next free leaf...
    this.siftUp(this.heap.length - 1) // ...then bubble it up to its place
  }

  pop() {
    const heap = this.heap
    if (heap.length === 0) return undefined

    const top = heap[0]
    const last = heap.pop() // remove the last leaf
    if (heap.length > 0) {
      heap[0] = last // move it into the root's hole...
      this.siftDown(0) // ...and push it down until the heap is valid again
    }
    return top
  }

  /** Move heap[i] up while it is smaller than its parent. */
  siftUp(i) {
    const heap = this.heap
    while (i > 0) {
      const parent = (i - 1) >> 1 // integer division by 2
      if (this.compare(heap[i], heap[parent]) >= 0) break // parent already smaller
      this.swap(i, parent)
      i = parent
    }
  }

  /** Move heap[i] down while a child is smaller than it. */
  siftDown(i) {
    const heap = this.heap
    const n = heap.length
    while (true) {
      const left = 2 * i + 1
      const right = 2 * i + 2
      let smallest = i

      if (left < n && this.compare(heap[left], heap[smallest]) < 0) smallest = left
      if (right < n && this.compare(heap[right], heap[smallest]) < 0) smallest = right
      if (smallest === i) break // both children are bigger, so we're done

      this.swap(i, smallest)
      i = smallest
    }
  }

  swap(i, j) {
    const tmp = this.heap[i]
    this.heap[i] = this.heap[j]
    this.heap[j] = tmp
  }
}

/**
 * Generic bounded top-K. `compare` defines the "weakest first" order the heap
 * keeps at its root. Returns the k strongest items, strongest first.
 */
function topK(items, k, compare) {
  if (k <= 0) return []

  const heap = new MinHeap(compare)
  for (const item of items) {
    heap.push(item)
    if (heap.size() > k) heap.pop() // evict the weakest of the k + 1 candidates
  }

  // Popping yields weakest to strongest, so fill the result from the back.
  const result = new Array(heap.size())
  for (let i = result.length - 1; i >= 0; i--) {
    result[i] = heap.pop()
  }
  return result
}

/** k stocks with the highest changePct, highest first. */
export function topKGainers(stocks, k) {
  // Min-heap on changePct: the root is the smallest gain still in the top k.
  return topK(stocks, k, (a, b) => a.changePct - b.changePct)
}

/** k stocks with the lowest changePct, lowest first. */
export function topKLosers(stocks, k) {
  // Reversed comparator: the root is the least-bad loser still in the top k.
  return topK(stocks, k, (a, b) => b.changePct - a.changePct)
}
