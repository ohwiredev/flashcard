import type { Card } from '../../lib/types'
import { CardListItem } from './CardListItem'

export function CardList({
  cards,
  onEdit,
  onDelete,
}: {
  cards: Card[]
  onEdit: (card: Card) => void
  onDelete: (card: Card) => void
}) {
  if (cards.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-fg-muted">
        No cards yet. Add your first one below.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {cards.map((card) => (
        <CardListItem
          key={card.id}
          card={card}
          onEdit={() => onEdit(card)}
          onDelete={() => onDelete(card)}
        />
      ))}
    </div>
  )
}
