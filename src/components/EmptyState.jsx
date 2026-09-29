export function EmptyState({ icon: Icon, title, hint, children }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
      <span className="mb-3 flex size-10 items-center justify-center rounded-full border border-border bg-bg-hover">
        <Icon size={18} strokeWidth={1.75} className="text-text-muted" />
      </span>
      <p className="text-sm font-medium text-text">{title}</p>
      {hint && <p className="mt-1 text-body text-text-faint">{hint}</p>}
      {children}
    </div>
  )
}
