import { useCallback, useState } from 'react'
import { Watchlist } from '../ds/watchlist.js'

const STORAGE_KEY = 'stocksight:watchlist'
const CAPACITY = 10
const DEFAULT_TICKERS = ['NVDA', 'AAPL', 'TSLA']

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    return Array.isArray(saved) ? saved : DEFAULT_TICKERS
  } catch {
    return DEFAULT_TICKERS
  }
}

function save(tickers) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tickers))
  } catch {
    // Storage can be unavailable (private mode). The watchlist still works in memory.
  }
}

/**
 * React wrapper around the Watchlist data structure. The structure is the
 * source of truth. After each change we copy toArray() into state so React
 * re-renders, and persist it.
 */
export function useWatchlist() {
  const [watchlist] = useState(() => {
    const w = new Watchlist(CAPACITY)
    const saved = load()
    // Saved order is most-recent-first, so insert from the back to rebuild it.
    for (let i = saved.length - 1; i >= 0; i--) w.add(saved[i])
    return w
  })
  const [tickers, setTickers] = useState(() => watchlist.toArray())

  // The callbacks only touch the stable Watchlist instance and a state setter,
  // so they keep their identity across renders. Memoized table rows rely on
  // that to skip re-rendering.
  const sync = useCallback(() => {
    const next = watchlist.toArray()
    setTickers(next)
    save(next)
  }, [watchlist])

  const toggle = useCallback(
    (ticker) => {
      if (watchlist.has(ticker)) watchlist.remove(ticker)
      else watchlist.add(ticker) // may evict the least recently viewed ticker
      sync()
    },
    [watchlist, sync],
  )

  /** Called when a stock is viewed: bumps it to the front if it is watched. */
  const touch = useCallback(
    (ticker) => {
      if (watchlist.moveToFront(ticker)) sync()
    },
    [watchlist, sync],
  )

  return {
    tickers,
    capacity: CAPACITY,
    has: (ticker) => watchlist.has(ticker),
    toggle,
    touch,
  }
}
