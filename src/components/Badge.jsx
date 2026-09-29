import clsx from 'clsx'

const tones = {
  neutral: 'bg-bg-hover text-text-muted',
  accent: 'bg-accent-soft text-accent-fg',
  up: 'bg-up-soft text-up',
  down: 'bg-down-soft text-down',
  flat: 'bg-bg-hover text-text-muted',
}

export function Badge({ tone = 'neutral', className, ...props }) {
  return (
    <span
      className={clsx(
        'inline-flex h-6 items-center gap-1 rounded-full px-2 text-xs font-medium whitespace-nowrap',
        tones[tone],
        className,
      )}
      {...props}
    />
  )
}
