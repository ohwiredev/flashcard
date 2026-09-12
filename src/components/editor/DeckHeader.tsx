import type { Deck } from '../../lib/types'
import { Button } from '../ui/Button'

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3">
      <path d="M8 5.5v13l11-6.5-11-6.5Z" />
    </svg>
  )
}

export function DeckHeader({
  deck,
  onEdit,
  onDeleteDeck,
  onStartReview,
}: {
  deck: Deck
  onEdit: () => void
  onDeleteDeck: () => void
  onStartReview: () => void
}) {
  const cardCount = deck.cards.length

  return (
    <div
      data-accent={deck.accent}
      className="surface-sheen relative overflow-hidden rounded-2xl border border-border bg-bg-elevated p-6 shadow-card sm:p-8"
    >
      <span aria-hidden className="absolute inset-x-0 top-0 h-1 bg-deck-accent" />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-deck-accent/10 to-transparent"
      />

      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-eyebrow nums-tabular text-deck-accent">
            {cardCount} {cardCount === 1 ? 'card' : 'cards'}
          </p>
          <h1 className="text-title mt-2 text-fg">{deck.name}</h1>
          {deck.description ? (
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-fg-muted">
              {deck.description}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button intent="ghost" size="sm" onClick={onEdit}>
            Edit
          </Button>
          <Button intent="ghost" size="sm" onClick={onDeleteDeck}>
            Delete
          </Button>
          <Button size="sm" disabled={cardCount === 0} onClick={onStartReview}>
            <PlayIcon />
            Start review
          </Button>
        </div>
      </div>
    </div>
  )
}
