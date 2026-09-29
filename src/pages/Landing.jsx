import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChartSpline, Gauge, Star, Zap } from 'lucide-react'
import { Button } from '../components/Button.jsx'
import { Card } from '../components/Card.jsx'
import { EngineeringTable } from '../components/EngineeringTable.jsx'
import { Logo } from '../components/Logo.jsx'
import { MarketOverview } from '../components/MarketOverview.jsx'
import { StockTable } from '../components/StockTable.jsx'
import { TopMovers } from '../components/TopMovers.jsx'
import { useMarket } from '../hooks/useMarket.js'

const FEATURES = [
  {
    icon: Zap,
    title: 'Top Movers',
    text: "The day's biggest gainers and losers, re-ranked the moment prices move.",
  },
  {
    icon: Gauge,
    title: 'Momentum',
    text: 'Spot breakouts at a glance, with how many days a stock has been setting highs.',
  },
  {
    icon: ChartSpline,
    title: 'Trend lines',
    text: '5- and 20-day moving averages on every chart, updated live.',
  },
  {
    icon: Star,
    title: 'Smart Watchlist',
    text: 'Your starred stocks, always ordered by what you looked at last.',
  },
]

const PIPELINE = ['Price tick', 'Simulator', 'Data structures', 'UI']

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-4 fill-current">
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.42-2.7 5.39-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  )
}

function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-bg/70 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" className="rounded-control" aria-label="Stocksight home">
          <Logo />
        </Link>
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-1 sm:flex">
            <Button as="a" href="#features" variant="ghost" size="sm">
              Features
            </Button>
            <Button as="a" href="#how-its-built" variant="ghost" size="sm">
              How it's built
            </Button>
          </div>
          <Button as={Link} to="/app" variant="primary" size="sm">
            Open dashboard
          </Button>
        </div>
      </nav>
    </header>
  )
}

/** The real dashboard components, rendered live inside a tilted browser frame. */
function LivePreview() {
  const market = useMarket({ loadingMs: 0 })

  // The mask fades the bottom of the preview into the page. Negative margin +
  // padding give the glow room so the mask doesn't clip it at the sides.
  return (
    <div className="relative mx-auto mt-16 max-w-6xl sm:mt-20">
      <div className="-mx-16 px-16 pb-16 [mask-image:linear-gradient(to_bottom,black_55%,transparent)] [perspective:2400px]">
        <div
          className="origin-top rounded-[16px] border border-border-strong bg-bg p-2 shadow-glow transition-transform duration-700 ease-out [transform:rotateX(10deg)] hover:[transform:rotateX(4deg)]"
          inert
          aria-hidden
        >
          <div className="overflow-hidden rounded-card border border-border bg-bg">
            <div className="flex h-9 items-center gap-1.5 border-b border-border px-4">
              <span className="size-2.5 rounded-full bg-border-strong" />
              <span className="size-2.5 rounded-full bg-border-strong" />
              <span className="size-2.5 rounded-full bg-border-strong" />
              <span className="num mx-auto rounded-md bg-bg-elevated px-3 py-0.5 text-[11px] text-text-faint">
                stocksight.app/app
              </span>
            </div>
            <div className="space-y-4 p-4">
              <div className="hidden md:block">
                <MarketOverview
                  advancers={market.advancers}
                  decliners={market.decliners}
                  gainers={market.gainers}
                  losers={market.losers}
                  avgChangePct={market.avgChangePct}
                  total={market.stocks.length}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                <Card className="overflow-hidden">
                  <StockTable stocks={market.stocks} limit={7} isWatched={(t) => t === 'NVDA'} />
                </Card>
                <div className="hidden lg:block">
                  <TopMovers gainers={market.gainers} losers={market.losers} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pt-20 pb-8 sm:px-6 sm:pt-28">
      <div aria-hidden className="bg-grid absolute inset-0" />
      <div
        aria-hidden
        className="absolute top-[-200px] left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(110,86,255,0.28),transparent)] blur-2xl"
      />

      <div className="relative mx-auto max-w-3xl text-center">
        <span className="inline-flex h-7 items-center gap-2 rounded-full border border-border-strong bg-bg-elevated/70 px-3 text-xs text-text-muted">
          <span className="size-1.5 animate-pulse-dot rounded-full bg-up" />
          Live market simulation
        </span>
        <h1 className="mt-6 text-[40px] leading-[1.05] font-bold tracking-[-0.02em] text-balance sm:text-[56px] lg:text-[64px]">
          See what's moving,
          <br />
          <span className="bg-gradient-to-r from-text via-accent-fg to-accent bg-clip-text text-transparent">and why.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base text-pretty text-text-muted sm:text-lg">
          Real-time tracking for the stocks you care about: top movers, momentum and trend lines, updated every
          few seconds.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button as={Link} to="/app" variant="primary" size="lg">
            Open dashboard
            <ArrowRight size={16} strokeWidth={1.75} />
          </Button>
          <Button as="a" href="#how-its-built" variant="ghost" size="lg">
            How it's built
          </Button>
        </div>
      </div>

      <LivePreview />
    </section>
  )
}

function Features() {
  return (
    <section id="features" className="scroll-mt-20 px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <p className="label-caps text-accent-fg">Features</p>
        <h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl">
          Everything that matters. Nothing that doesn't.
        </h2>
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <Card
              key={title}
              as="article"
              className="group p-6 transition-colors duration-150 hover:border-border-strong hover:bg-bg-hover"
            >
              <span className="flex size-10 items-center justify-center rounded-control border border-border-strong bg-accent-soft">
                <Icon size={18} strokeWidth={1.75} className="text-accent-fg" />
              </span>
              <h3 className="mt-5 text-base font-semibold tracking-tight">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">{text}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

function HowItsBuilt() {
  return (
    <section id="how-its-built" className="scroll-mt-20 border-t border-border px-4 py-24 sm:px-6">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <div>
          <p className="label-caps text-accent-fg">How it's built</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Built for every tick.</h2>
          <p className="mt-4 text-base leading-relaxed text-text-muted">
            Prices stream in every three seconds, and every panel recomputes on each one. So nothing re-sorts the
            whole market or rescans history. Each feature runs on a hand-written data structure picked for the
            exact update it has to handle.
          </p>
          <ol className="mt-8 flex flex-wrap items-center gap-2 text-xs">
            {PIPELINE.map((step, i) => (
              <li key={step} className="flex items-center gap-2">
                <span className="rounded-full border border-border-strong bg-bg-elevated px-3 py-1 text-text-muted">
                  {step}
                </span>
                {i < PIPELINE.length - 1 && <ArrowRight size={14} strokeWidth={1.75} className="text-text-faint" />}
              </li>
            ))}
          </ol>
        </div>
        <EngineeringTable showWhy />
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-border px-4 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Logo />
          <p className="mt-2 text-sm text-text-muted">See what's moving, and why.</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-text-faint">
          <span>Simulated market data · Built by Vaibhav</span>
          <a
            href="https://github.com/"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="rounded p-1 text-text-muted transition-colors hover:text-text"
          >
            <GitHubIcon />
          </a>
        </div>
      </div>
    </footer>
  )
}

export default function Landing() {
  useEffect(() => {
    document.title = "Stocksight — See what's moving, and why."
  }, [])

  return (
    <div className="min-h-screen">
      <Nav />
      <main>
        <Hero />
        <Features />
        <HowItsBuilt />
      </main>
      <Footer />
    </div>
  )
}
