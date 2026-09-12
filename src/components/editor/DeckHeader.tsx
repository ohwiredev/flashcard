import type { Deck } from '../../lib/types'
import { Button } from '../ui/Button'

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
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-title text-fg">{deck.name}</h1>
        {deck.description ? (
          <p className="mt-2 max-w-xl text-sm text-fg-muted">{deck.description}</p>
        ) : null}
        <p className="text-caption mt-3 text-fg-muted">
          {deck.cards.length} {deck.cards.length === 1 ? 'card' : 'cards'}
        </p>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">
        <Button intent="ghost" size="sm" onClick={onEdit}>
          Edit
        </Button>
        <Button intent="ghost" size="sm" onClick={onDeleteDeck}>
          Delete
        </Button>
        <Button size="sm" disabled={deck.cards.length === 0} onClick={onStartReview}>
          Start Review
        </Button>
      </div>
    </div>
  )
}
