import { Badge } from './Badge.jsx'
import { Change, textTone } from './Change.jsx'
import { StatCard } from './StatCard.jsx'
import { formatPercent, formatPrice, tone } from '../lib/format.js'

function MoverCard({ label, stock, loading }) {
  return (
    <StatCard
      label={label}
      loading={loading}
      tag={stock && !loading && <Badge className="font-semibold text-text">{stock.ticker}</Badge>}
      value={stock ? formatPrice(stock.price) : '—'}
      detail={
        stock && (
          <>
            <Change value={stock.changePct} />
            <span className="truncate text-text-faint">{stock.name}</span>
          </>
        )
      }
    />
  )
}

export function MarketOverview({ advancers, decliners, gainers, losers, avgChangePct, total, loading }) {
  const breadth = advancers + decliners
  const upShare = breadth ? (advancers / breadth) * 100 : 50

  return (
    <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
      <StatCard
        label={
          <>
            <span className="sm:hidden">Adv / Dec</span>
            <span className="hidden sm:inline">Advancers / Decliners</span>
          </>
        }
        loading={loading}
        value={
          <>
            <span className="text-up">{advancers}</span>
            <span className="text-text-faint"> / </span>
            <span className="text-down">{decliners}</span>
          </>
        }
        detail={<span className="text-text-faint">{total - breadth} unchanged</span>}
      >
        {!loading && (
          <div className="flex h-1 gap-0.5 overflow-hidden rounded-full" aria-hidden>
            <div className="rounded-full bg-up transition-[width] duration-500" style={{ width: `${upShare}%` }} />
            <div className="flex-1 rounded-full bg-down" />
          </div>
        )}
      </StatCard>
      <MoverCard label="Top gainer" stock={gainers[0]} loading={loading} />
      <MoverCard label="Top loser" stock={losers[0]} loading={loading} />
      <StatCard
        label="Avg change"
        loading={loading}
        value={<span className={textTone[tone(avgChangePct)]}>{formatPercent(avgChangePct)}</span>}
        detail={<span className="text-text-faint">Across {total} stocks</span>}
      />
    </div>
  )
}
