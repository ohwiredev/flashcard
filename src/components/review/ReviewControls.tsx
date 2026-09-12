import { Button } from '../ui/Button'

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
    <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
      <Button intent="secondary" size="sm" onClick={onPrev} disabled={!canPrev}>
        Previous
      </Button>
      <Button intent="secondary" size="sm" onClick={onFlip}>
        Flip
      </Button>
      <Button size="sm" onClick={onNext}>
        {isLast ? 'Finish' : 'Next'}
      </Button>
      <Button intent="ghost" size="sm" onClick={onShuffle}>
        Shuffle
      </Button>
    </div>
  )
}
