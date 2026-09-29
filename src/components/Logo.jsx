import clsx from 'clsx'

export function LogoMark({ className }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden className={clsx('size-7', className)}>
      <defs>
        <linearGradient id="logo-g" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8b78ff" />
          <stop offset="1" stopColor="#5a41f0" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#logo-g)" />
      <rect x="0.5" y="0.5" width="31" height="31" rx="7.5" stroke="white" strokeOpacity="0.18" />
      <path
        d="M7 20.5l5.5-5.5 4 4L25 10.5"
        stroke="#fff"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="25" cy="10.5" r="2.2" fill="#fff" />
    </svg>
  )
}

export function Logo({ className }) {
  return (
    <span className={clsx('inline-flex items-center gap-2.5', className)}>
      <LogoMark />
      <span className="text-[15px] font-semibold tracking-tight">Stocksight</span>
    </span>
  )
}
