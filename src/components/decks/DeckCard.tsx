import { cva } from 'class-variance-authority'
import { Link } from 'react-router'
import type { Deck } from '../../lib/types'
import { Menu } from '../ui/Menu'

const accentBar = cva('h-1.5 w-10 rounded-full', {
  variants: {
    accent: {
      blue: 'bg-blue-500',
      violet: 'bg-violet-500',
      amber: 'bg-amber-500',
      teal: 'bg-teal-500',
      rose: 'bg-rose-500',
    },
  },
})

function KebabIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4.5 w-4.5">
      <circle cx="12" cy="5.5" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="12" cy="18.5" r="1.6" />
    </svg>
  )
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
      <path d="M8 5.5v13l11-6.5-11-6.5Z" />
    </svg>
  )
}

export function DeckCard({
  deck,
  onRename,
  onDelete,
}: {
  deck: Deck
  onRename: () => void
  onDelete: () => void
}) {
  return (
    <div className="pressable-hover group relative flex flex-col rounded-2xl border border-border bg-bg-elevated p-5 transition-transform">
      <div className="flex items-start justify-between">
        <div className={accentBar({ accent: deck.accent })} />
        <Menu
          trigger={<KebabIcon />}
          items={[
            { label: 'Rename', onSelect: onRename },
            { label: 'Delete', onSelect: onDelete, destructive: true },
          ]}
        />
      </div>
      <Link to={`/decks/${deck.id}`} className="mt-4 flex flex-1 flex-col">
        <h3 className="text-lg font-semibold text-fg">{deck.name}</h3>
        {deck.description ? (
          <p className="mt-1 line-clamp-2 text-sm text-fg-muted">{deck.description}</p>
        ) : null}
      </Link>
      <div className="mt-4 flex items-center justify-between">
        <p className="text-caption text-fg-muted">
          {deck.cards.length} {deck.cards.length === 1 ? 'card' : 'cards'}
        </p>
        {deck.cards.length > 0 ? (
          <Link
            to={`/decks/${deck.id}/review`}
            className="pressable pressable-hover inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-fg"
          >
            <PlayIcon />
            Review
          </Link>
        ) : null}
      </div>
    </div>
  )
}
