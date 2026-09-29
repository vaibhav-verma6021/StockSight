import { memo, useState } from 'react'
import clsx from 'clsx'
import { ArrowDown, ArrowUp, ChevronsUpDown, SearchX, Star, TrendingDown, TrendingUp } from 'lucide-react'
import { Badge } from './Badge.jsx'
import { Change } from './Change.jsx'
import { EmptyState } from './EmptyState.jsx'
import { Skeleton } from './Skeleton.jsx'
import { Sparkline } from './Sparkline.jsx'
import { formatMomentum, formatPrice } from '../lib/format.js'

const SPARK_POINTS = 30

const SORTERS = {
  ticker: (s) => s.ticker,
  price: (s) => s.price,
  changePct: (s) => s.changePct,
  span: (s) => s.span,
}

const cell = 'px-3 py-3 first:pl-4 last:pr-4'
// Sparkline and trend need room; below 1100px they'd squeeze Momentum.
const hideBelowWide = 'hidden min-[1100px]:table-cell'

// Opaque background so rows scroll underneath the sticky header, and an inset
// shadow in place of a border (borders on sticky cells scroll away).
const headCell = 'sticky top-0 z-10 bg-bg-elevated shadow-[inset_0_-1px_0_var(--color-border)]'

function SortHeader({ label, column, sort, onSort, align = 'right', className }) {
  const active = sort.column === column
  const Icon = !active ? ChevronsUpDown : sort.dir === 'asc' ? ArrowUp : ArrowDown
  return (
    <th
      scope="col"
      className={clsx(cell, headCell, 'font-medium', className)}
      aria-sort={active ? `${sort.dir}ending` : 'none'}
    >
      <button
        type="button"
        onClick={() => onSort(column)}
        className={clsx(
          'label-caps inline-flex items-center gap-1 rounded transition-colors hover:text-text-muted',
          align === 'right' && 'flex-row-reverse',
          active && 'text-text-muted',
        )}
      >
        {label}
        <Icon size={12} strokeWidth={2} className={active ? 'text-text-muted' : 'opacity-60'} />
      </button>
    </th>
  )
}

function Momentum({ span, maxSpan }) {
  const label = formatMomentum(span, maxSpan)
  return label ? <Badge tone="accent" className="num">{label}</Badge> : <span className="text-text-faint">—</span>
}

function Trend({ trend }) {
  if (!trend) return <span className="text-text-faint">—</span>
  const up = trend === 'up'
  const Icon = up ? TrendingUp : TrendingDown
  return (
    <span
      title={up ? 'Above MA 20' : 'Below MA 20'}
      className={clsx(
        'inline-flex size-7 items-center justify-center rounded-full',
        up ? 'bg-up-soft text-up' : 'bg-down-soft text-down',
      )}
    >
      <Icon size={14} strokeWidth={2} />
      <span className="sr-only">{up ? 'Uptrend' : 'Downtrend'}</span>
    </span>
  )
}

// Memoized: MarketFeed returns the same object for stocks that didn't trade,
// so only changed rows re-render. Callbacks passed in must be stable.
const Row = memo(function Row({ stock, watched, onSelect, onToggleWatch }) {
  const flash = stock.direction === 'up' ? 'animate-flash-up' : stock.direction === 'down' ? 'animate-flash-down' : ''
  return (
    <tr
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
      aria-label={onSelect ? `${stock.ticker}, ${stock.name}. Open details` : undefined}
      onClick={() => onSelect?.(stock.ticker)}
      onKeyDown={(e) => {
        // Ignore keys aimed at the star button inside the row.
        if (!onSelect || e.target !== e.currentTarget) return
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault() // Space would otherwise scroll the table
          onSelect(stock.ticker)
        }
      }}
      className="group cursor-pointer border-t border-border transition-colors duration-150 hover:bg-bg-hover focus-visible:bg-bg-hover focus-visible:outline-none"
    >
      <td className={clsx(cell, 'w-10 pr-0')}>
        <button
          type="button"
          aria-label={watched ? `Remove ${stock.ticker} from watchlist` : `Add ${stock.ticker} to watchlist`}
          aria-pressed={watched}
          onClick={(e) => {
            e.stopPropagation() // don't also open the detail panel
            onToggleWatch?.(stock.ticker)
          }}
          className="-m-1.5 flex size-7 items-center justify-center rounded-md text-text-faint transition-colors hover:bg-bg-elevated hover:text-text"
        >
          <Star size={15} strokeWidth={1.75} className={clsx(watched && 'fill-amber text-amber')} />
        </button>
      </td>
      <td className={cell}>
        <div className="font-semibold tracking-tight">{stock.ticker}</div>
        <div className="max-w-[180px] truncate text-xs text-text-faint">{stock.name}</div>
      </td>
      <td className={clsx(cell, 'text-right')}>
        {/* A new key remounts the span, which restarts the flash animation. */}
        <span key={stock.updatedAt} className={clsx('num -mx-1.5 rounded-md px-1.5 py-1 text-text', flash)}>
          {formatPrice(stock.price)}
        </span>
      </td>
      <td className={clsx(cell, 'text-right')}>
        <Change value={stock.changePct} pill className="min-w-[72px]" />
      </td>
      <td className={clsx(cell, hideBelowWide, 'text-right')}>
        <div className="flex justify-end">
          <Sparkline data={[...stock.closedDays.slice(1 - SPARK_POINTS), stock.price]} />
        </div>
      </td>
      <td className={clsx(cell, 'text-right')}>
        <Momentum span={stock.span} maxSpan={stock.maxSpan} />
      </td>
      <td className={clsx(cell, hideBelowWide, 'text-right')}>
        <Trend trend={stock.trend} />
      </td>
    </tr>
  )
})

function SkeletonRows({ count }) {
  return Array.from({ length: count }, (_, i) => (
    <tr key={i} className="border-t border-border">
      <td className={clsx(cell, 'w-10 pr-0')}>
        <Skeleton className="size-4" />
      </td>
      <td className={cell}>
        <Skeleton className="mb-1.5 h-3.5 w-12" />
        <Skeleton className="h-3 w-24" />
      </td>
      <td className={cell}>
        <Skeleton className="ml-auto h-3.5 w-16" />
      </td>
      <td className={cell}>
        <Skeleton className="ml-auto h-6 w-[72px] rounded-full" />
      </td>
      <td className={clsx(cell, hideBelowWide)}>
        <Skeleton className="ml-auto h-6 w-24" />
      </td>
      <td className={cell}>
        <Skeleton className="ml-auto h-6 w-20 rounded-full" />
      </td>
      <td className={clsx(cell, hideBelowWide)}>
        <Skeleton className="ml-auto size-7 rounded-full" />
      </td>
    </tr>
  ))
}

/**
 * `scroll` caps the table at a fixed height with a sticky header, for the full
 * list on the dashboard. Without it the table grows to fit (landing preview).
 */
export function StockTable({ stocks, loading, emptyTitle, isWatched, onSelect, onToggleWatch, limit, scroll }) {
  const [sort, setSort] = useState({ column: null, dir: 'desc' })

  const onSort = (column) =>
    setSort((s) =>
      s.column === column ? { column, dir: s.dir === 'desc' ? 'asc' : 'desc' } : { column, dir: 'desc' },
    )

  let rows = stocks
  if (sort.column) {
    const key = SORTERS[sort.column]
    const dir = sort.dir === 'asc' ? 1 : -1
    rows = [...stocks].sort((a, b) => (key(a) > key(b) ? dir : key(a) < key(b) ? -dir : 0))
  }
  if (limit) rows = rows.slice(0, limit)

  const headerProps = { sort, onSort }

  return (
    <div className={clsx('overflow-x-auto', scroll && 'max-h-[640px] overflow-y-auto overscroll-contain')}>
      <table className="w-full min-w-[460px] border-collapse text-body">
        <thead>
          <tr className="text-left">
            <th scope="col" className={clsx(cell, headCell, 'w-10 pr-0')}>
              <span className="sr-only">Watch</span>
            </th>
            <SortHeader label="Symbol" column="ticker" align="left" {...headerProps} />
            <SortHeader label="Price" column="price" className="text-right" {...headerProps} />
            <SortHeader label="Change" column="changePct" className="text-right" {...headerProps} />
            <th scope="col" className={clsx(cell, headCell, hideBelowWide, 'label-caps text-right font-medium')}>
              30D
            </th>
            <SortHeader label="Momentum" column="span" className="text-right" {...headerProps} />
            <th scope="col" className={clsx(cell, headCell, hideBelowWide, 'label-caps text-right font-medium')}>
              Trend
            </th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <SkeletonRows count={limit ?? 10} />
          ) : (
            rows.map((stock) => (
              <Row
                key={stock.ticker}
                stock={stock}
                watched={isWatched?.(stock.ticker)}
                onSelect={onSelect}
                onToggleWatch={onToggleWatch}
              />
            ))
          )}
        </tbody>
      </table>
      {!loading && rows.length === 0 && (
        <EmptyState icon={SearchX} title={emptyTitle} hint="Try a ticker like NVDA or a company name." />
      )}
    </div>
  )
}
