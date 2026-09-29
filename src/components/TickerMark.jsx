export function TickerMark({ ticker }) {
  return (
    <span
      aria-hidden
      className="num flex size-8 shrink-0 items-center justify-center rounded-control border border-border bg-bg-hover text-[10px] font-semibold text-text-muted"
    >
      {ticker.slice(0, 4)}
    </span>
  )
}
