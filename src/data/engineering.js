// Copy for the "How it's built" section and modal.
export const ENGINEERING = [
  {
    feature: 'Top Movers',
    technique: 'Bounded min-heap',
    complexity: 'O(n log k)',
    file: 'src/ds/minHeap.js',
    why: 'Keeps only the best k candidates, so there is no full sort on every tick.',
  },
  {
    feature: 'Momentum',
    technique: 'Monotonic stack',
    complexity: 'O(n) per day, read-only per tick',
    file: 'src/ds/stockSpan.js',
    why: 'Rebuilt from closed days at each close, so evicted days never linger. Live prices only peek.',
  },
  {
    feature: 'Trend lines',
    technique: 'Sliding-window running sum',
    complexity: 'O(1) per tick',
    file: 'src/ds/slidingWindow.js',
    why: 'Slides once per daily close; the live average peeks at the window in O(1).',
  },
  {
    feature: 'Smart Watchlist',
    technique: 'Doubly linked list + hash map',
    complexity: 'O(1) ops',
    file: 'src/ds/watchlist.js',
    why: 'LRU ordering: constant-time lookup, reorder and eviction.',
  },
]
