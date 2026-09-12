export function ProgressBar({ value, max }: { value: number; max: number }) {
  const percent = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      className="h-1.5 w-full overflow-hidden rounded-full bg-border"
    >
      <div
        className="h-full rounded-full bg-gradient-to-r from-deck-accent/70 to-deck-accent transition-[width] duration-[var(--duration-lg)] ease-[var(--ease-out)]"
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}
