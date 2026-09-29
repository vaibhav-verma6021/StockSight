import clsx from 'clsx'

export function Card({ as: Component = 'section', className, ...props }) {
  return <Component className={clsx('rounded-card border border-border bg-bg-elevated', className)} {...props} />
}

export function CardHeader({ title, meta, action, className }) {
  return (
    <div className={clsx('flex min-h-14 items-center justify-between gap-3 px-4 py-3', className)}>
      <div className="flex items-baseline gap-2">
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        {meta && <span className="num text-xs text-text-faint">{meta}</span>}
      </div>
      {action}
    </div>
  )
}
