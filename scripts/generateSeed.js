// Generates src/data/seed.json: 60 trading days of closing prices for each of
// 65 US-listed stocks, tagged with a sector and a daily volatility.
// Run with: npm run seed
//
// A seeded PRNG keeps the output identical on every run. Each stock follows a
// random walk whose drift changes every couple of weeks ("regimes"), so the
// charts show real trends and pullbacks instead of flat noise.

import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const DAYS = 60
const END_DATE = '2026-09-25'

// Daily volatility (std dev of returns) by kind of stock. Staples, telecoms
// and big banks move least; small or speculative tech and crypto-linked names
// move most.
const VOL = {
  defensive: 0.008, // staples, telecom, big pharma
  steady: 0.011, // banks, payment networks, industrial blue chips
  large: 0.014, // mega-cap tech and large growth
  growth: 0.021, // high-multiple growth, semis, energy services
  volatile: 0.033, // speculative, crypto-linked, small-float names
}

// Live tick size tier (see TICK_MOVE in src/data/simulator.js). NVDA and AMD
// have large-cap history but trade like momentum names intraday.
const VOLATILE_INTRADAY = new Set(['NVDA', 'AMD'])
function tierOf({ ticker, vol }) {
  if (vol >= VOL.volatile || VOLATILE_INTRADAY.has(ticker)) return 'volatile'
  return vol <= VOL.steady ? 'calm' : 'normal'
}

const STOCKS = [
  // Tech
  { ticker: 'AAPL', name: 'Apple Inc.', sector: 'Tech', start: 228, vol: VOL.large },
  { ticker: 'MSFT', name: 'Microsoft Corp.', sector: 'Tech', start: 505, vol: VOL.large },
  { ticker: 'ORCL', name: 'Oracle Corp.', sector: 'Tech', start: 245, vol: VOL.growth },
  { ticker: 'CRM', name: 'Salesforce, Inc.', sector: 'Tech', start: 250, vol: VOL.large },
  { ticker: 'ADBE', name: 'Adobe Inc.', sector: 'Tech', start: 355, vol: VOL.large },
  { ticker: 'NOW', name: 'ServiceNow, Inc.', sector: 'Tech', start: 178, vol: VOL.growth },
  { ticker: 'INTU', name: 'Intuit Inc.', sector: 'Tech', start: 660, vol: VOL.large },
  { ticker: 'PLTR', name: 'Palantir Technologies', sector: 'Tech', start: 180, vol: VOL.volatile },
  { ticker: 'SNOW', name: 'Snowflake Inc.', sector: 'Tech', start: 225, vol: VOL.volatile },
  { ticker: 'CRWD', name: 'CrowdStrike Holdings', sector: 'Tech', start: 470, vol: VOL.growth },
  { ticker: 'SHOP', name: 'Shopify Inc.', sector: 'Tech', start: 150, vol: VOL.volatile },

  // Semiconductors
  { ticker: 'NVDA', name: 'NVIDIA Corp.', sector: 'Semiconductors', start: 176, vol: VOL.growth },
  { ticker: 'AMD', name: 'Advanced Micro Devices', sector: 'Semiconductors', start: 162, vol: VOL.growth },
  { ticker: 'INTC', name: 'Intel Corp.', sector: 'Semiconductors', start: 36.5, vol: VOL.growth },
  { ticker: 'AVGO', name: 'Broadcom Inc.', sector: 'Semiconductors', start: 340, vol: VOL.growth },
  { ticker: 'TSM', name: 'Taiwan Semiconductor', sector: 'Semiconductors', start: 290, vol: VOL.large },
  { ticker: 'QCOM', name: 'Qualcomm Inc.', sector: 'Semiconductors', start: 165, vol: VOL.large },
  { ticker: 'MU', name: 'Micron Technology', sector: 'Semiconductors', start: 190, vol: VOL.volatile },
  { ticker: 'ARM', name: 'Arm Holdings', sector: 'Semiconductors', start: 150, vol: VOL.volatile },
  { ticker: 'AMAT', name: 'Applied Materials', sector: 'Semiconductors', start: 205, vol: VOL.growth },
  { ticker: 'SMCI', name: 'Super Micro Computer', sector: 'Semiconductors', start: 45, vol: VOL.volatile },

  // Finance
  { ticker: 'JPM', name: 'JPMorgan Chase & Co.', sector: 'Finance', start: 296, vol: VOL.steady },
  { ticker: 'V', name: 'Visa Inc.', sector: 'Finance', start: 344, vol: VOL.steady },
  { ticker: 'COIN', name: 'Coinbase Global', sector: 'Finance', start: 305, vol: VOL.volatile },
  { ticker: 'BAC', name: 'Bank of America', sector: 'Finance', start: 50, vol: VOL.steady },
  { ticker: 'WFC', name: 'Wells Fargo & Co.', sector: 'Finance', start: 82, vol: VOL.steady },
  { ticker: 'GS', name: 'Goldman Sachs Group', sector: 'Finance', start: 790, vol: VOL.steady },
  { ticker: 'MS', name: 'Morgan Stanley', sector: 'Finance', start: 155, vol: VOL.steady },
  { ticker: 'MA', name: 'Mastercard Inc.', sector: 'Finance', start: 570, vol: VOL.steady },
  { ticker: 'AXP', name: 'American Express', sector: 'Finance', start: 330, vol: VOL.steady },
  { ticker: 'BLK', name: 'BlackRock, Inc.', sector: 'Finance', start: 1120, vol: VOL.steady },
  { ticker: 'PYPL', name: 'PayPal Holdings', sector: 'Finance', start: 68, vol: VOL.growth },
  { ticker: 'HOOD', name: 'Robinhood Markets', sector: 'Finance', start: 120, vol: VOL.volatile },

  // Healthcare
  { ticker: 'UNH', name: 'UnitedHealth Group', sector: 'Healthcare', start: 330, vol: VOL.large },
  { ticker: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare', start: 190, vol: VOL.defensive },
  { ticker: 'LLY', name: 'Eli Lilly and Co.', sector: 'Healthcare', start: 780, vol: VOL.large },
  { ticker: 'PFE', name: 'Pfizer Inc.', sector: 'Healthcare', start: 25, vol: VOL.defensive },
  { ticker: 'MRK', name: 'Merck & Co.', sector: 'Healthcare', start: 85, vol: VOL.defensive },
  { ticker: 'ABBV', name: 'AbbVie Inc.', sector: 'Healthcare', start: 225, vol: VOL.steady },
  { ticker: 'MRNA', name: 'Moderna, Inc.', sector: 'Healthcare', start: 26, vol: VOL.volatile },

  // Consumer
  { ticker: 'TSLA', name: 'Tesla, Inc.', sector: 'Consumer', start: 410, vol: VOL.volatile },
  { ticker: 'AMZN', name: 'Amazon.com, Inc.', sector: 'Consumer', start: 222, vol: VOL.large },
  { ticker: 'WMT', name: 'Walmart Inc.', sector: 'Consumer', start: 102, vol: VOL.defensive },
  { ticker: 'COST', name: 'Costco Wholesale', sector: 'Consumer', start: 930, vol: VOL.defensive },
  { ticker: 'KO', name: 'The Coca-Cola Co.', sector: 'Consumer', start: 68, vol: VOL.defensive },
  { ticker: 'PEP', name: 'PepsiCo, Inc.', sector: 'Consumer', start: 145, vol: VOL.defensive },
  { ticker: 'MCD', name: "McDonald's Corp.", sector: 'Consumer', start: 305, vol: VOL.defensive },
  { ticker: 'NKE', name: 'Nike, Inc.', sector: 'Consumer', start: 72, vol: VOL.large },

  // Energy
  { ticker: 'XOM', name: 'Exxon Mobil Corp.', sector: 'Energy', start: 115, vol: VOL.steady },
  { ticker: 'CVX', name: 'Chevron Corp.', sector: 'Energy', start: 158, vol: VOL.steady },
  { ticker: 'COP', name: 'ConocoPhillips', sector: 'Energy', start: 95, vol: VOL.large },
  { ticker: 'SLB', name: 'SLB N.V.', sector: 'Energy', start: 36, vol: VOL.growth },

  // Industrials
  { ticker: 'UBER', name: 'Uber Technologies', sector: 'Industrials', start: 92, vol: VOL.growth },
  { ticker: 'CAT', name: 'Caterpillar Inc.', sector: 'Industrials', start: 470, vol: VOL.large },
  { ticker: 'BA', name: 'The Boeing Co.', sector: 'Industrials', start: 220, vol: VOL.growth },
  { ticker: 'GE', name: 'GE Aerospace', sector: 'Industrials', start: 290, vol: VOL.large },
  { ticker: 'UPS', name: 'United Parcel Service', sector: 'Industrials', start: 85, vol: VOL.steady },
  { ticker: 'LMT', name: 'Lockheed Martin', sector: 'Industrials', start: 470, vol: VOL.steady },

  // Communication
  { ticker: 'GOOGL', name: 'Alphabet Inc.', sector: 'Communication', start: 238, vol: VOL.large },
  { ticker: 'META', name: 'Meta Platforms, Inc.', sector: 'Communication', start: 735, vol: VOL.large },
  { ticker: 'NFLX', name: 'Netflix, Inc.', sector: 'Communication', start: 98, vol: VOL.large },
  { ticker: 'DIS', name: 'The Walt Disney Co.', sector: 'Communication', start: 113, vol: VOL.large },
  { ticker: 'T', name: 'AT&T Inc.', sector: 'Communication', start: 28, vol: VOL.defensive },
  { ticker: 'VZ', name: 'Verizon Communications', sector: 'Communication', start: 41, vol: VOL.defensive },
  { ticker: 'SPOT', name: 'Spotify Technology', sector: 'Communication', start: 700, vol: VOL.volatile },
]

// mulberry32: a tiny deterministic PRNG returning floats in [0, 1).
function mulberry32(seed) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Standard normal sample via Box-Muller.
function gaussian(rand) {
  const u = 1 - rand()
  const v = rand()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

// Last `count` weekdays ending on `endDate`, oldest first, as YYYY-MM-DD.
function tradingDays(endDate, count) {
  const dates = []
  const d = new Date(`${endDate}T00:00:00Z`)
  while (dates.length < count) {
    const day = d.getUTCDay()
    if (day !== 0 && day !== 6) dates.push(d.toISOString().slice(0, 10))
    d.setUTCDate(d.getUTCDate() - 1)
  }
  return dates.reverse()
}

function walk(rand, start, vol) {
  const prices = [start]
  let drift = 0
  for (let i = 1; i < DAYS; i++) {
    // Every ~12 days pick a new trend (up, down or sideways), centered on zero
    // so the market as a whole doesn't just grind upward.
    if (i % 12 === 1) drift = (rand() - 0.5) * vol * 0.6
    // A weak pull back toward the start keeps 60-day net drift small.
    const pull = -0.04 * (prices[i - 1] / start - 1)
    // The last point is today's live price, only partway through the session.
    const scale = i === DAYS - 1 ? 0.35 : 1
    const ret = (drift + pull + gaussian(rand) * vol) * scale
    prices.push(prices[i - 1] * (1 + ret))
  }
  return prices.map((p) => Math.round(p * 100) / 100)
}

const rand = mulberry32(20260925)
const seed = {
  dates: tradingDays(END_DATE, DAYS),
  stocks: STOCKS.map((s) => ({
    ticker: s.ticker,
    name: s.name,
    sector: s.sector,
    tier: tierOf(s),
    prices: walk(rand, s.start, s.vol),
  })),
}

const out = fileURLToPath(new URL('../src/data/seed.json', import.meta.url))
writeFileSync(out, JSON.stringify(seed, null, 2) + '\n')
console.log(`Wrote ${seed.stocks.length} stocks x ${DAYS} days to ${out}`)
