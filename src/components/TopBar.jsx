import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import clsx from 'clsx'
import { Pause, Play, Search } from 'lucide-react'
import { Button } from './Button.jsx'
import { Logo } from './Logo.jsx'

function LiveStatus({ paused }) {
  return (
    <span
      className={clsx(
        'inline-flex h-7 items-center gap-2 rounded-full border px-2.5 text-xs font-medium',
        paused ? 'border-border text-text-muted' : 'border-up/20 bg-up-soft text-up',
      )}
      aria-live="polite"
    >
      <span className={clsx('size-1.5 rounded-full', paused ? 'bg-text-faint' : 'animate-pulse-dot bg-up')} />
      {paused ? 'Paused' : 'Live'}
    </span>
  )
}

function SessionClock({ session, paused }) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (paused) return
    setNow(Date.now())
    const id = setInterval(() => setNow(Date.now()), 250)
    return () => clearInterval(id)
  }, [paused])

  const secs = Math.max(0, Math.ceil((session.closesAt - now) / 1000))
  const countdown = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`

  return (
    <span
      className="num inline-flex h-7 items-center rounded-full border border-border px-2.5 text-xs whitespace-nowrap text-text-faint"
      title="Prices tick every 5 seconds · each trading day lasts 2 minutes"
    >
      Day {session.day} <span aria-hidden>&nbsp;·&nbsp;</span> closes in&nbsp;<span className="text-text-muted">{countdown}</span>
      <span className="sr-only">. Prices tick every 5 seconds and each trading day lasts 2 minutes.</span>
    </span>
  )
}

export function TopBar({ query, onQueryChange, paused, onTogglePaused, session }) {
  const inputRef = useRef(null)

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-[1280px] items-center gap-4 px-4 sm:px-6">
        <Link to="/" className="shrink-0 rounded-control" aria-label="Stocksight home">
          <Logo />
        </Link>

        <label className="group relative ml-auto flex h-9 w-full max-w-xs items-center sm:ml-6">
          <Search size={16} strokeWidth={1.75} className="pointer-events-none absolute left-3 text-text-faint" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && e.currentTarget.blur()}
            placeholder="Search stocks"
            aria-label="Search stocks"
            className="h-full w-full rounded-control border border-border bg-bg-elevated pr-12 pl-9 text-body text-text transition-colors outline-none hover:border-border-strong focus:border-accent/60 focus:ring-2 focus:ring-accent/25 [&::-webkit-search-cancel-button]:hidden"
          />
          <kbd className="num pointer-events-none absolute right-2 hidden h-5 items-center rounded border border-border-strong px-1.5 text-[10px] text-text-faint sm:inline-flex">
            ⌘K
          </kbd>
        </label>

        <div className="flex shrink-0 items-center gap-2 sm:ml-auto">
          {session && (
            <span className="mr-1 hidden md:inline">
              <SessionClock session={session} paused={paused} />
            </span>
          )}
          <span className="hidden sm:inline-flex">
            <LiveStatus paused={paused} />
          </span>
          <Button
            variant="secondary"
            size="icon-sm"
            onClick={onTogglePaused}
            aria-label={paused ? 'Resume live updates' : 'Pause live updates'}
            title={paused ? 'Resume' : 'Pause'}
          >
            {paused ? <Play size={15} strokeWidth={1.75} /> : <Pause size={15} strokeWidth={1.75} />}
          </Button>
        </div>
      </div>
    </header>
  )
}
