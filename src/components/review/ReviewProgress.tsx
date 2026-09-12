import { ProgressBar } from '../ui/ProgressBar'

export function ReviewProgress({
  current,
  total,
  onShowShortcuts,
}: {
  current: number
  total: number
  onShowShortcuts: () => void
}) {
  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="mb-2.5 flex items-center justify-between gap-3">
        <p className="nums-tabular text-sm font-medium text-fg">
          Card {current}
          <span className="text-fg-subtle"> of {total}</span>
        </p>
        <button
          type="button"
          onClick={onShowShortcuts}
          aria-label="Show keyboard shortcuts"
          className="focus-ring pressable flex h-7 w-7 items-center justify-center rounded-full border border-border bg-bg-elevated text-fg-muted shadow-card hover:border-border-strong hover:text-fg"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-3.5 w-3.5">
            <rect x="2.5" y="6" width="19" height="12" rx="2.5" />
            <path
              strokeLinecap="round"
              d="M6 10h.01M9.5 10h.01M13 10h.01M16.5 10h.01M6 14h.01M18 14h.01M9.5 14h5"
            />
          </svg>
        </button>
      </div>
      <ProgressBar value={current} max={total} />
    </div>
  )
}
