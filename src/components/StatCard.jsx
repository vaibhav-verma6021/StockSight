import { Card } from './Card.jsx'
import { Skeleton } from './Skeleton.jsx'

export function StatCard({ label, tag, value, detail, loading, children }) {
  return (
    <Card className="flex min-w-0 flex-col gap-3 p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="label-caps truncate">{label}</span>
        {tag}
      </div>
      {loading ? (
        <>
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-4 w-20" />
        </>
      ) : (
        <>
          <div className="num truncate text-2xl leading-8 font-medium tracking-tight sm:text-[28px]">{value}</div>
          <div className="flex min-h-5 items-center gap-2 text-body text-text-muted">{detail}</div>
        </>
      )}
      {children}
    </Card>
  )
}
