import clsx from 'clsx'

export function Skeleton({ className }) {
  return <div aria-hidden className={clsx('skeleton', className)} />
}
