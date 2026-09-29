import clsx from 'clsx'
import { Badge } from './Badge.jsx'
import { formatPercent, tone } from '../lib/format.js'

const textTone = { up: 'text-up', down: 'text-down', flat: 'text-text-muted' }

export function Change({ value, pill = false, className }) {
  const t = tone(value)
  if (pill) {
    return (
      <Badge tone={t} className={clsx('num justify-center', className)}>
        {formatPercent(value)}
      </Badge>
    )
  }
  return <span className={clsx('num', textTone[t], className)}>{formatPercent(value)}</span>
}

export { textTone }
