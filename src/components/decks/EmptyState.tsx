import { Button } from '../ui/Button'

/** Three stacked cards, fanned — a wordless stand-in for the deck you don't have yet. */
function DeckIllustration() {
  return (
    <svg
      viewBox="0 0 120 80"
      fill="none"
      aria-hidden
      className="h-20 w-30 text-fg-subtle/40"
    >
      <rect
        x="18"
        y="14"
        width="84"
        height="52"
        rx="8"
        transform="rotate(-8 60 40)"
        stroke="currentColor"
        strokeWidth={2}
      />
      <rect
        x="18"
        y="14"
        width="84"
        height="52"
        rx="8"
        transform="rotate(4 60 40)"
        stroke="currentColor"
        strokeWidth={2}
      />
      <rect
        x="22"
        y="20"
        width="76"
        height="46"
        rx="8"
        className="fill-bg-elevated"
        stroke="currentColor"
        strokeWidth={2}
      />
      <path
        d="M44 38h32M44 48h20"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
      />
    </svg>
  )
}

export function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-bg-sunken/60 px-6 py-16 text-center sm:py-20">
      <DeckIllustration />
      <h2 className="mt-6 text-lg font-semibold tracking-tight text-fg">No decks yet</h2>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-fg-muted">
        Create your first deck to start adding cards and reviewing them.
      </p>
      <Button className="mt-7" onClick={onCreate}>
        Create your first deck
      </Button>
    </div>
  )
}
