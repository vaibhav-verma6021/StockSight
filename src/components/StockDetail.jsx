import { useState } from 'react'
import clsx from 'clsx'
import { Star, X } from 'lucide-react'
import { Button } from './Button.jsx'
import { Change, textTone } from './Change.jsx'
import { PriceChart } from './PriceChart.jsx'
import { SegmentedControl } from './SegmentedControl.jsx'
import { useDismiss } from '../hooks/useDismiss.js'
import { maSeries, priceSeries } from '../data/market.js'
import { formatChange, formatMomentum, formatPrice, tone } from '../lib/format.js'

const EXIT_MS = 180

const RANGES = [
  { value: 5, label: '1W' },
  { value: 21, label: '1M' },
  { value: 60, label: '2M' },
]

function Stat({ label, children }) {
  return (
    <div className="rounded-control border border-border bg-bg px-3 py-2.5">
      <div className="label-caps mb-1">{label}</div>
      <div className="num text-sm">{children}</div>
    </div>
  )
}

function MaChip({ active, color, label, onClick }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={clsx(
        'inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-xs font-medium transition-colors duration-150',
        active ? 'border-border-strong bg-bg-hover text-text' : 'border-border text-text-faint hover:text-text-muted',
      )}
    >
      <span className={clsx('h-0.5 w-3 rounded-full', color, !active && 'opacity-40')} />
      {label}
    </button>
  )
}

export function StockDetail({ stock, dates, watched, onToggleWatch, onClose }) {
  const [range, setRange] = useState(60)
  const [showMa5, setShowMa5] = useState(true)
  const [showMa20, setShowMa20] = useState(true)
  const [closing, setClosing] = useState(false)

  // Play the exit animation, then unmount.
  const close = () => {
    if (closing) return
    setClosing(true)
    setTimeout(onClose, EXIT_MS)
  }
  useDismiss(close)

  // `dates` lines up with closedDays + today.
  const prices = priceSeries(stock)
  const { ma5, ma20 } = maSeries(prices)
  const start = Math.max(0, prices.length - range)
  const data = []
  for (let i = start; i < prices.length; i++) {
    data.push({ date: dates[i], price: prices[i], ma5: ma5[i], ma20: ma20[i] })
  }

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={`${stock.ticker} details`}>
      <div
        className={clsx('absolute inset-0 bg-overlay', closing ? 'animate-fade-out' : 'animate-fade-in')}
        onClick={close}
      />
      <aside
        className={clsx(
          'absolute inset-y-0 right-0 flex w-full flex-col border-l border-border bg-bg-elevated shadow-float md:w-[520px]',
          closing ? 'animate-slide-out' : 'animate-slide-in',
        )}
      >
        <header className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold tracking-tight">{stock.ticker}</h2>
              <span className="truncate text-sm text-text-muted">{stock.name}</span>
            </div>
            <div className="mt-2 flex items-baseline gap-3">
              <span className="num text-[32px] leading-none font-medium tracking-tight">{formatPrice(stock.price)}</span>
              <span className={clsx('num text-sm', textTone[tone(stock.change)])}>{formatChange(stock.change)}</span>
              <Change value={stock.changePct} pill />
            </div>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={close} aria-label="Close" autoFocus>
            <X size={16} strokeWidth={1.75} />
          </Button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <SegmentedControl label="Time range" options={RANGES} value={range} onChange={setRange} />
            <div className="flex gap-2">
              <MaChip label="MA 5" color="bg-accent" active={showMa5} onClick={() => setShowMa5((v) => !v)} />
              <MaChip label="MA 20" color="bg-amber" active={showMa20} onClick={() => setShowMa20((v) => !v)} />
            </div>
          </div>

          <div className="-mx-2">
            <PriceChart data={data} showMa5={showMa5} showMa20={showMa20} height={300} />
          </div>

          <h3 className="label-caps mt-6 mb-3">Key stats</h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <Stat label="Day change">
              <Change value={stock.changePct} />
            </Stat>
            <Stat label="60D high">{formatPrice(stock.high)}</Stat>
            <Stat label="60D low">{formatPrice(stock.low)}</Stat>
            <Stat label="Momentum">{formatMomentum(stock.span, stock.maxSpan) ?? '—'}</Stat>
            <Stat label="MA 5">{formatPrice(stock.maFast)}</Stat>
            <Stat label="MA 20">{formatPrice(stock.maSlow)}</Stat>
          </div>
        </div>

        <footer className="border-t border-border px-6 py-4">
          <Button
            variant={watched ? 'secondary' : 'primary'}
            className="w-full"
            onClick={() => onToggleWatch(stock.ticker)}
          >
            <Star size={16} strokeWidth={1.75} className={clsx(watched && 'fill-amber text-amber')} />
            {watched ? 'Remove from watchlist' : 'Add to watchlist'}
          </Button>
        </footer>
      </aside>
    </div>
  )
}
