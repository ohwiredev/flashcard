import { Button } from '../ui/Button'

function ChevronLeft() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
    >
      <path d="M14 6l-6 6 6 6" />
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
    >
      <path d="M10 6l6 6-6 6" />
    </svg>
  )
}

function FlipIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
    >
      <path d="M4 9a8 8 0 0 1 13.5-3.5L20 8" />
      <path d="M20 4.5V8h-3.5" />
      <path d="M20 15a8 8 0 0 1-13.5 3.5L4 16" />
      <path d="M4 19.5V16h3.5" />
    </svg>
  )
}

function ShuffleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
    >
      <path d="M4 6h3.5L16 18h4" />
      <path d="M17 15l3 3-3 3" />
      <path d="M4 18h3.5l2.5-3.5" />
      <path d="M14 9l2-3h4" />
      <path d="M17 3l3 3-3 3" />
    </svg>
  )
}

export function ReviewControls({
  onPrev,
  onNext,
  onFlip,
  onShuffle,
  canPrev,
  isLast,
}: {
  onPrev: () => void
  onNext: () => void
  onFlip: () => void
  onShuffle: () => void
  canPrev: boolean
  isLast: boolean
}) {
  return (
    <div className="mt-9 flex flex-col items-center gap-4">
      <div className="flex items-center gap-2">
        <Button intent="secondary" size="sm" onClick={onPrev} disabled={!canPrev}>
          <ChevronLeft />
          Previous
        </Button>
        <Button intent="secondary" size="sm" onClick={onFlip}>
          <FlipIcon />
          Flip
        </Button>
        <Button size="sm" onClick={onNext}>
          {isLast ? 'Finish' : 'Next'}
          {isLast ? null : <ChevronRight />}
        </Button>
      </div>
      <Button intent="ghost" size="sm" onClick={onShuffle}>
        <ShuffleIcon />
        Shuffle deck
      </Button>
    </div>
  )
}
