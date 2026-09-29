import clsx from 'clsx'

export function SegmentedControl({ options, value, onChange, label, className }) {
  const index = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  )

  return (
    <div
      role="tablist"
      aria-label={label}
      className={clsx(
        'relative inline-grid grid-flow-col auto-cols-fr rounded-control border border-border bg-bg p-0.5',
        className,
      )}
    >
      <span
        aria-hidden
        className="absolute inset-y-0.5 left-0.5 rounded-[6px] bg-accent-soft ring-1 ring-accent/40 ring-inset transition-transform duration-200 ease-out"
        style={{
          width: `calc((100% - 4px) / ${options.length})`,
          transform: `translateX(${index * 100}%)`, // one indicator-width per step
        }}
      />
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={clsx(
              'relative h-7 rounded-[6px] px-3 text-xs font-medium transition-colors duration-150',
              active ? 'text-text' : 'text-text-muted hover:text-text',
            )}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
