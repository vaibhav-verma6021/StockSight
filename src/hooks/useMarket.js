import { useEffect, useState } from 'react'
import { MarketFeed } from '../data/market.js'
import { TICK_MS } from '../data/simulator.js'

// The feed is mutable, so it's stepped only from the interval callback and
// never inside a state updater. StrictMode double-invokes updaters, which
// would advance it twice.
export function useMarket({ loadingMs = 600 } = {}) {
  // In development, every step brute-forces each span and warns on a mismatch.
  const [feed] = useState(() => new MarketFeed(undefined, Math.random, { verify: import.meta.env.DEV }))
  const [market, setMarket] = useState(() => feed.snapshot)
  const [tickedAt, setTickedAt] = useState(() => Date.now()) // anchors the day countdown
  const [paused, setPaused] = useState(false)
  const [loading, setLoading] = useState(loadingMs > 0)

  useEffect(() => {
    if (loadingMs <= 0) return
    const id = setTimeout(() => setLoading(false), loadingMs)
    return () => clearTimeout(id)
  }, [loadingMs])

  useEffect(() => {
    if (paused) return
    setTickedAt(Date.now()) // a resumed interval waits a full TICK_MS again
    const id = setInterval(() => {
      setMarket(feed.step())
      setTickedAt(Date.now())
    }, TICK_MS)
    return () => clearInterval(id)
  }, [feed, paused])

  return {
    ...market,
    // The day closes on the tick `ticksLeft` ticks after `tickedAt`.
    session: { day: market.day, closesAt: tickedAt + market.ticksLeft * TICK_MS },
    loading,
    paused,
    togglePaused: () => setPaused((p) => !p),
  }
}
