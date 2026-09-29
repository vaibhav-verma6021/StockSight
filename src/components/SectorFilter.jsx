import clsx from 'clsx'

export const ALL_SECTORS = 'All'

export function SectorFilter({ options, value, onChange, className }) {
  return (
    <div
      role="group"
      aria-label="Filter by sector"
      className={clsx('flex gap-1.5 overflow-x-auto [scrollbar-width:none]', className)}
    >
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.value)}
            className={clsx(
              'inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full border px-2.5 text-xs font-medium whitespace-nowrap transition-colors duration-150',
              active
                ? 'border-accent/40 bg-accent-soft text-text'
                : 'border-border text-text-muted hover:border-border-strong hover:text-text',
            )}
          >
            {o.value}
            <span className={clsx('num', active ? 'text-accent-fg' : 'text-text-faint')}>{o.count}</span>
          </button>
        )
      })}
    </div>
  )
}
