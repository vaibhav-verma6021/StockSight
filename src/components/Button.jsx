import clsx from 'clsx'

const base =
  'inline-flex shrink-0 items-center justify-center gap-2 rounded-control font-medium whitespace-nowrap ' +
  'transition-[background-color,color,border-color,transform] duration-150 select-none ' +
  'active:translate-y-px disabled:pointer-events-none disabled:opacity-50'

const variants = {
  primary:
    'bg-accent text-white hover:bg-accent-hover shadow-[inset_0_1px_0_rgb(255_255_255/0.2),0_1px_2px_rgb(0_0_0/0.4)]',
  secondary: 'border border-border-strong bg-transparent text-text hover:bg-bg-hover',
  ghost: 'text-text-muted hover:bg-bg-hover hover:text-text',
}

const sizes = {
  lg: 'h-10 px-5 text-sm',
  md: 'h-9 px-4 text-sm',
  sm: 'h-8 px-3 text-body',
  icon: 'size-9',
  'icon-sm': 'size-8',
}

// Pass `as={Link}` or `as="a"` to render a link styled as a button.
export function Button({ as: Component = 'button', variant = 'secondary', size = 'md', className, ...props }) {
  const extra = Component === 'button' && !props.type ? { type: 'button' } : null
  return (
    <Component className={clsx(base, variants[variant], sizes[size], className)} {...extra} {...props} />
  )
}
