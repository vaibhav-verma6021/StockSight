# Stocksight

A live stock dashboard where every feature runs on a data structure I wrote from scratch.

It tracks 65 US stocks with top movers, momentum ("12D high"), moving-average trend lines and a watchlist that keeps whatever you looked at last on top. The market data is simulated, so there's no backend and no API keys.

Live demo: _coming soon_

| Landing | Dashboard | Stock detail |
| --- | --- | --- |
| _screenshot_ | _screenshot_ | _screenshot_ |

## Why

I wanted a project where DSA actually does something instead of sitting in a LeetCode tab. A stock dashboard updates constantly, which makes it a good excuse: sorting everything or rescanning history on every tick is visibly wasteful, so the choice of structure matters.

## Running it

```bash
npm install
npm run dev      # localhost:5173
npm test         # vitest
npm run build
npm run seed     # regenerate src/data/seed.json
```

Needs Node 18+. It deploys to Vercel as-is (Vite preset, `vercel.json` handles client-side routes).

## Data structures

Everything is in `src/ds/`: plain JS with no React, each file with its own tests.

| Structure | Feature | Complexity |
| --- | --- | --- |
| Min-heap capped at k | Top gainers / losers | `O(n log k)` per tick instead of sorting all n |
| Monotonic stack | Momentum ("12D high") | `O(n)` rebuild once per day, read-only peek per tick |
| Sliding window (running sum + circular buffer) | MA 5 / MA 20 lines, trend arrow | `O(1)` per update |
| Doubly linked list + hash map | Watchlist (LRU, max 10) | `O(1)` add / remove / move to front |

A few notes:

- The heap keeps the best 5 seen so far with the weakest at the root. Losers use the same heap with the comparator flipped.
- The stock span is LeetCode 901. Each price gets pushed and popped at most once, so building it is linear.
- The watchlist is basically LeetCode 146. The map finds a ticker's node and the linked list lets me unlink and reinsert it without shifting an array.

## How the simulation works

Prices tick every 5 seconds, and only 30 to 50% of stocks move on each tick, so it feels less robotic. A trading day lasts 2 minutes. The top bar shows something like "Day 61 · closes in 1:42" so you can see when a day closes.

Each stock only really has two things: `closedDays` (the last 59 closes) and `today` (open + live price). The chart, moving averages, momentum and 60-day high/low are all computed from those.

## A bug I hit

Momentum kept showing things like "85-day high" on a chart that only had 60 days. Two problems were stacking up. First, I was treating every 3-second tick as a new trading day and pushing it into the span stack, so intraday noise became permanent history. Second, when old days fell off the 60-day chart they stayed inside the stack, because a monotonic stack can't evict its oldest entry: that day's count gets folded into the spans at the bottom.

The fix was to separate ticks from daily closes. Ticks only change today's price and use a read-only `peekSpan()` that never touches the stack. When a day closes, I rebuild the stack from the 59 closed days. That's `O(n)` once every two minutes, which is nothing, and it means evicted days can't leak back in. In dev mode, every tick also checks each span against a brute-force count and warns if they disagree. The tests do the same over thousands of random ticks.

## Project layout

```
src/ds/          heap, stack, sliding window, LRU list + tests
src/data/        seed data, price simulator, MarketFeed (ties it all together)
src/hooks/       tick loop, watchlist wrapper
src/components/  table, charts, cards, detail panel
src/pages/       landing page and dashboard
scripts/         seeded random-walk generator for the 60 days of history
```

`MarketFeed` in `src/data/market.js` is the piece that connects everything. It's plain JS, so I could test the whole tick → data structures → snapshot flow without rendering anything.

## What I'd do next

- Pull real market data through a small backend
- Push updates over WebSockets instead of a timer
- Use a trie for ticker search as you type

## Stack

React 19, Vite, Tailwind v4, Recharts (detail chart only; the sparklines are plain SVG), React Router, Vitest.
