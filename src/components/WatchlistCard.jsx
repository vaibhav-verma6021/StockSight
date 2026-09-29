import { Star } from 'lucide-react'
import { Card, CardHeader } from './Card.jsx'
import { EmptyState } from './EmptyState.jsx'
import { ListSkeleton, StockListItem } from './TopMovers.jsx'

export function WatchlistCard({ stocks, capacity, loading, onSelect }) {
  return (
    <Card>
      <CardHeader
        title="Watchlist"
        meta={`${stocks.length}/${capacity}`}
        action={<span className="text-xs text-text-faint">Recently viewed first</span>}
      />
      {loading ? (
        <ListSkeleton rows={3} />
      ) : stocks.length === 0 ? (
        <EmptyState icon={Star} title="Your watchlist is empty" hint="Star a stock to track it here" />
      ) : (
        <ul className="pb-2">
          {stocks.map((stock) => (
            <StockListItem key={stock.ticker} stock={stock} onSelect={onSelect} />
          ))}
        </ul>
      )}
    </Card>
  )
}
