/**
 * Doubly linked list + hash map: the watchlist (LRU-style)
 * ----------------------------------------------------------------------------
 * What:  An ordered list of tickers, most recently viewed first, capped at a
 *        fixed capacity. When it is full, adding a new ticker evicts the least
 *        recently viewed one from the tail. This is LeetCode 146 (LRU Cache).
 *
 * Why a linked list + map and not an array?
 *        With an array, "move AAPL to the front" means finding it (O(n)) and
 *        shifting everything over (O(n)). Removing from the middle costs O(n)
 *        too.
 *        - The Map gives O(1) lookup from a ticker to its list node.
 *        - The doubly linked list gives O(1) unlink and O(1) insert at the
 *          front, because each node knows both of its neighbours.
 *        Together, every operation except toArray is O(1).
 *
 *        Dummy head and tail sentinels mean every real node always has a prev
 *        and a next. So there are no special cases for an empty list, the first
 *        node or the last node.
 *
 * Powers: the Watchlist sidebar (star / unstar, most recently viewed first).
 *
 * Complexity (n = items in the watchlist, n <= capacity)
 *   add(ticker)          time O(1)   (includes eviction)
 *   remove(ticker)       time O(1)
 *   moveToFront(ticker)  time O(1)
 *   has(ticker)          time O(1)
 *   size()               time O(1)
 *   toArray()            time O(n)
 *   space                O(n)
 */

export class Node {
  constructor(ticker) {
    this.ticker = ticker
    this.prev = null
    this.next = null
  }
}

export class DoublyLinkedList {
  constructor() {
    // Sentinels: head.next is the first real node, tail.prev is the last.
    this.head = new Node(null)
    this.tail = new Node(null)
    this.head.next = this.tail
    this.tail.prev = this.head
    this.length = 0
  }

  /** Insert node right after the head sentinel. O(1). */
  addToFront(node) {
    node.prev = this.head
    node.next = this.head.next
    this.head.next.prev = node // old first node now points back to the new one
    this.head.next = node
    this.length++
  }

  /** Unlink node from wherever it is. O(1), because we know its neighbours. */
  removeNode(node) {
    node.prev.next = node.next // left neighbour skips over node
    node.next.prev = node.prev // right neighbour skips back over node
    node.prev = null
    node.next = null
    this.length--
  }

  /** Remove and return the last real node, or null if the list is empty. */
  removeLast() {
    if (this.length === 0) return null
    const last = this.tail.prev
    this.removeNode(last)
    return last
  }

  toArray() {
    const out = []
    for (let node = this.head.next; node !== this.tail; node = node.next) {
      out.push(node.ticker)
    }
    return out
  }
}

export class Watchlist {
  constructor(capacity = 10) {
    this.capacity = capacity
    this.list = new DoublyLinkedList()
    this.index = new Map() // ticker -> Node, for O(1) lookup
  }

  has(ticker) {
    return this.index.has(ticker)
  }

  size() {
    return this.list.length
  }

  /**
   * Add ticker at the front. If it is already present it just moves to the
   * front. Returns the evicted ticker when capacity is exceeded, else null.
   */
  add(ticker) {
    if (this.has(ticker)) {
      this.moveToFront(ticker)
      return null
    }

    const node = new Node(ticker)
    this.list.addToFront(node)
    this.index.set(ticker, node)

    if (this.list.length > this.capacity) {
      const evicted = this.list.removeLast() // least recently viewed lives at the tail
      this.index.delete(evicted.ticker)
      return evicted.ticker
    }
    return null
  }

  /** Remove ticker. Returns true if it was present. */
  remove(ticker) {
    const node = this.index.get(ticker)
    if (!node) return false
    this.list.removeNode(node)
    this.index.delete(ticker)
    return true
  }

  /** Mark ticker as most recently viewed. No-op if it isn't watched. */
  moveToFront(ticker) {
    const node = this.index.get(ticker)
    if (!node) return false
    this.list.removeNode(node) // unlink from its current spot...
    this.list.addToFront(node) // ...and relink right after head
    return true
  }

  /** Tickers from most to least recently viewed. */
  toArray() {
    return this.list.toArray()
  }
}
