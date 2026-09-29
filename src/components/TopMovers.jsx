import { useState } from 'react'
import { Card, CardHeader } from './Card.jsx'
import { Change } from './Change.jsx'
import { SegmentedControl } from './SegmentedControl.jsx'
import { Skeleton } from './Skeleton.jsx'
import { TickerMark } from './TickerMark.jsx'
import { formatPrice } from '../lib/format.js'

const TABS = [
  { value: 'gainers', label: 'Gainers' },
  { value: 'losers', label: 'Losers' },
]

export function StockListItem({ stock, onSelect, trailing }) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect?.(stock.ticker)}
        className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors duration-150 hover:bg-bg-hover"
      >
        <TickerMark ticker={stock.ticker} />
        <span className="min-w-0 flex-1">
          <span className="block text-body font-semibold">{stock.ticker}</span>
          <span className="block truncate text-xs text-text-faint">{stock.name}</span>
        </span>
        <span className="text-right">
          <span className="num block text-body">{formatPrice(stock.price)}</span>
          <Change value={stock.changePct} className="block text-xs" />
        </span>
        {trailing}
      </button>
    </li>
  )
}

export function ListSkeleton({ rows = 5 }) {
  return (
    <ul className="pb-2">
      {Array.from({ length: rows }, (_, i) => (
        <li key={i} className="flex items-center gap-3 px-4 py-2.5">
          <Skeleton className="size-8 rounded-control" />
          <div className="flex-1">
            <Skeleton className="mb-1.5 h-3.5 w-12" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-8 w-16" />
        </li>
      ))}
    </ul>
  )
}

export function TopMovers({ gainers, losers, loading, onSelect }) {
  const [tab, setTab] = useState('gainers')
  const list = tab === 'gainers' ? gainers : losers

  return (
    <Card>
      <CardHeader
        title="Top Movers"
        action={<SegmentedControl label="Top movers" options={TABS} value={tab} onChange={setTab} />}
      />
      {loading ? (
        <ListSkeleton />
      ) : (
        <ol className="pb-2">
          {list.map((stock) => (
            <StockListItem key={stock.ticker} stock={stock} onSelect={onSelect} />
          ))}
        </ol>
      )}
    </Card>
  )
}
