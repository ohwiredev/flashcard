import type { Card } from '../../lib/types'

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19 3 20l1-4Z"
      />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M9 6V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V6m2 0-.7 13.3a2 2 0 0 1-2 1.7H9.7a2 2 0 0 1-2-1.7L7 6" />
    </svg>
  )
}

export function CardListItem({
  card,
  onEdit,
  onDelete,
}: {
  card: Card
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-bg-elevated px-4 py-3">
      {card.frontImage ? (
        <img
          src={card.frontImage}
          alt=""
          className="h-10 w-10 shrink-0 rounded-lg border border-border object-cover"
        />
      ) : null}
      <div className="grid min-w-0 flex-1 grid-cols-2 gap-4">
        <p className="truncate text-sm text-fg">{card.front}</p>
        <p className="truncate text-sm text-fg-muted">{card.back}</p>
      </div>
      <div className="flex shrink-0 gap-1">
        <button
          type="button"
          onClick={onEdit}
          aria-label="Edit card"
          className="pressable flex h-8 w-8 items-center justify-center rounded-full text-fg-muted hover:bg-fg/5"
        >
          <EditIcon />
        </button>
        <button
          type="button"
          onClick={onDelete}
          aria-label="Delete card"
          className="pressable flex h-8 w-8 items-center justify-center rounded-full text-fg-muted hover:bg-red-500/10 hover:text-red-600"
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  )
}
