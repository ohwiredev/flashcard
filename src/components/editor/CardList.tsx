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
      <div className="rounded-xl border border-dashed border-border bg-bg-sunken/60 px-4 py-12 text-center">
        <p className="text-sm font-medium text-fg">No cards yet</p>
        <p className="mt-1 text-sm text-fg-muted">
          Use “Add card” above to create the first one.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Column labels for the front/back pair, so the two-column rows read unambiguously. */}
      <div className="text-eyebrow hidden items-center gap-x-4 px-4 text-fg-subtle sm:flex">
        <span className="w-5 shrink-0" aria-hidden />
        <span className="grid flex-1 grid-cols-2 gap-x-4">
          <span>Front</span>
          <span>Back</span>
        </span>
        <span className="w-[4.25rem] shrink-0" aria-hidden />
      </div>
      {cards.map((card, index) => (
        <CardListItem
          key={card.id}
          card={card}
          index={index}
          onEdit={() => onEdit(card)}
          onDelete={() => onDelete(card)}
        />
      ))}
    </div>
  )
}
