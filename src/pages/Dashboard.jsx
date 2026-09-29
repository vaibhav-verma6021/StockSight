import { useCallback, useEffect, useState } from 'react'
import { Card } from '../components/Card.jsx'
import { EngineeringTable } from '../components/EngineeringTable.jsx'
import { MarketOverview } from '../components/MarketOverview.jsx'
import { Modal } from '../components/Modal.jsx'
import { ALL_SECTORS, SectorFilter } from '../components/SectorFilter.jsx'
import { StockDetail } from '../components/StockDetail.jsx'
import { StockTable } from '../components/StockTable.jsx'
import { TopBar } from '../components/TopBar.jsx'
import { TopMovers } from '../components/TopMovers.jsx'
import { WatchlistCard } from '../components/WatchlistCard.jsx'
import { useMarket } from '../hooks/useMarket.js'
import { useWatchlist } from '../hooks/useWatchlist.js'

export default function Dashboard() {
  const market = useMarket()
  const watchlist = useWatchlist()
  const [query, setQuery] = useState('')
  const [sector, setSector] = useState(ALL_SECTORS)
  const [selected, setSelected] = useState(null)
  const [showBuilt, setShowBuilt] = useState(false)

  useEffect(() => {
    document.title = 'Dashboard · Stocksight'
  }, [])

  // Stable identity, so memoized table rows don't re-render on every tick.
  const { touch } = watchlist
  const openStock = useCallback(
    (ticker) => {
      setSelected(ticker)
      touch(ticker) // viewing a watched stock makes it most recent
    },
    [touch],
  )

  // Sectors never change, so the chip list (with counts) is built once.
  const [sectorOptions] = useState(() => {
    const counts = new Map()
    for (const s of market.stocks) counts.set(s.sector, (counts.get(s.sector) ?? 0) + 1)
    return [
      { value: ALL_SECTORS, count: market.stocks.length },
      ...[...counts].map(([value, count]) => ({ value, count })),
    ]
  })

  const q = query.trim().toLowerCase()
  const filtered =
    q || sector !== ALL_SECTORS
      ? market.stocks.filter(
          (s) =>
            (sector === ALL_SECTORS || s.sector === sector) &&
            (!q || s.ticker.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)),
        )
      : market.stocks
  const inSector = sector === ALL_SECTORS ? '' : ` in ${sector}`
  const emptyTitle = q ? `No results for "${query.trim()}"${inSector}` : `No stocks${inSector}`

  const byTicker = {}
  for (const s of market.stocks) byTicker[s.ticker] = s
  const watchedStocks = watchlist.tickers.map((t) => byTicker[t]).filter(Boolean)
  const selectedStock = selected ? byTicker[selected] : null

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar
        query={query}
        onQueryChange={setQuery}
        paused={market.paused}
        onTogglePaused={market.togglePaused}
        session={market.session}
      />

      <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Markets</h1>
            <p className="mt-1 text-body text-text-muted">US equities</p>
          </div>
        </div>

        <MarketOverview
          advancers={market.advancers}
          decliners={market.decliners}
          gainers={market.gainers}
          losers={market.losers}
          avgChangePct={market.avgChangePct}
          total={market.stocks.length}
          loading={market.loading}
        />

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <Card className="min-w-0 self-start overflow-hidden">
            <div className="flex items-center justify-between px-4 pt-4 pb-3">
              <h2 className="text-base font-semibold tracking-tight">All stocks</h2>
              <span className="num text-xs text-text-faint">
                {filtered.length} of {market.stocks.length}
              </span>
            </div>
            <SectorFilter options={sectorOptions} value={sector} onChange={setSector} className="px-4 pb-3" />
            <StockTable
              stocks={filtered}
              loading={market.loading}
              emptyTitle={emptyTitle}
              scroll
              isWatched={watchlist.has}
              onSelect={openStock}
              onToggleWatch={watchlist.toggle}
            />
          </Card>

          <div className="grid grid-cols-1 content-start gap-6 md:grid-cols-2 xl:grid-cols-1">
            <TopMovers gainers={market.gainers} losers={market.losers} loading={market.loading} onSelect={openStock} />
            <WatchlistCard
              stocks={watchedStocks}
              capacity={watchlist.capacity}
              loading={market.loading}
              onSelect={openStock}
            />
          </div>
        </div>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-2 px-4 py-5 text-xs text-text-faint sm:px-6">
          <span>Simulated market data. Not investment advice.</span>
          <button
            type="button"
            onClick={() => setShowBuilt(true)}
            className="rounded text-text-muted transition-colors hover:text-text"
          >
            How it's built
          </button>
        </div>
      </footer>

      {selectedStock && (
        <StockDetail
          key={selectedStock.ticker}
          stock={selectedStock}
          dates={market.dates}
          watched={watchlist.has(selectedStock.ticker)}
          onToggleWatch={watchlist.toggle}
          onClose={() => setSelected(null)}
        />
      )}

      {showBuilt && (
        <Modal
          title="How it's built"
          description="Each feature stays live on every tick, and history only changes when a trading day closes."
          onClose={() => setShowBuilt(false)}
        >
          <EngineeringTable showWhy />
        </Modal>
      )}
    </div>
  )
}
