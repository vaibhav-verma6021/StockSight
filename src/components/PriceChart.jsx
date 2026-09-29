import { useId } from 'react'
import { Area, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatDate, formatPrice } from '../lib/format.js'

const axisTick = { fill: 'var(--color-text-faint)', fontSize: 11, fontFamily: 'var(--font-mono)' }

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const rows = [
    { key: 'price', name: 'Price', color: 'var(--color-text)' },
    { key: 'ma5', name: 'MA 5', color: 'var(--color-accent)' },
    { key: 'ma20', name: 'MA 20', color: 'var(--color-amber)' },
  ]
  const point = payload[0].payload
  return (
    <div className="min-w-36 rounded-control border border-border-strong bg-bg-elevated/95 px-3 py-2 shadow-float backdrop-blur">
      <div className="mb-1.5 text-xs text-text-faint">{formatDate(label)}</div>
      {rows.map(({ key, name, color }) =>
        payload.some((p) => p.dataKey === key) && point[key] != null ? (
          <div key={key} className="flex items-center justify-between gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-text-muted">
              <span className="size-1.5 rounded-full" style={{ background: color }} />
              {name}
            </span>
            <span className="num text-text">{formatPrice(point[key])}</span>
          </div>
        ) : null,
      )}
    </div>
  )
}

export function PriceChart({ data, showMa5, showMa20, height = 280 }) {
  const gradientId = `area-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  const up = data.length > 1 && data[data.length - 1].price >= data[0].price
  const color = up ? 'var(--color-up)' : 'var(--color-down)'

  return (
    <div className="cursor-crosshair" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.28} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--color-border)" strokeOpacity={0.6} />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            axisLine={false}
            tickLine={false}
            tick={axisTick}
            minTickGap={48}
            dy={6}
          />
          <YAxis
            orientation="right"
            domain={[(min) => min * 0.985, (max) => max * 1.015]}
            axisLine={false}
            tickLine={false}
            tick={axisTick}
            tickFormatter={(v) => (v >= 1000 ? v.toFixed(0) : v.toFixed(v >= 100 ? 0 : 1))}
            width={48}
          />
          <Tooltip
            content={<ChartTooltip />}
            cursor={{ stroke: 'var(--color-text-faint)', strokeDasharray: '3 3' }}
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke={color}
            strokeWidth={1.75}
            fill={`url(#${gradientId})`}
            isAnimationActive={false}
            activeDot={{ r: 3.5, strokeWidth: 2, stroke: 'var(--color-bg-elevated)', fill: color }}
          />
          {showMa5 && (
            <Line
              type="monotone"
              dataKey="ma5"
              stroke="var(--color-accent)"
              strokeWidth={1.25}
              dot={false}
              activeDot={false}
              isAnimationActive={false}
            />
          )}
          {showMa20 && (
            <Line
              type="monotone"
              dataKey="ma20"
              stroke="var(--color-amber)"
              strokeWidth={1.25}
              strokeDasharray="4 3"
              dot={false}
              activeDot={false}
              isAnimationActive={false}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
