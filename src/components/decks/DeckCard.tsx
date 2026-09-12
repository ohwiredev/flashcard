import { Link } from 'react-router'
import type { Deck } from '../../lib/types'
import { Menu } from '../ui/Menu'

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
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3">
      <path d="M8 5.5v13l11-6.5-11-6.5Z" />
    </svg>
  )
}

function StackIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
    >
      <rect x="3" y="7" width="14" height="10" rx="2" />
      <path d="M7 4.5h10a2 2 0 0 1 2 2v8" />
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
  const cardCount = deck.cards.length

  return (
    <div
      data-accent={deck.accent}
      className="group surface-sheen relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-bg-elevated shadow-card transition-[transform,box-shadow,border-color] duration-[var(--duration-md)] ease-[var(--ease-out)] hover:-translate-y-0.5 hover:border-border-strong hover:shadow-card-hover"
    >
      {/* Deck colour: a full-width hairline at the top plus a wash that warms on hover. */}
      <span aria-hidden className="h-1 w-full shrink-0 bg-deck-accent" />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-deck-accent/8 to-transparent opacity-70 transition-opacity duration-[var(--duration-md)] group-hover:opacity-100"
      />

      <div className="relative flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <span className="text-eyebrow inline-flex items-center gap-1.5 rounded-full bg-deck-accent/10 px-2.5 py-1 text-deck-accent">
            <StackIcon />
            {cardCount} {cardCount === 1 ? 'card' : 'cards'}
          </span>
          <Menu
            trigger={<KebabIcon />}
            items={[
              { label: 'Rename', onSelect: onRename },
              { label: 'Delete', onSelect: onDelete, destructive: true },
            ]}
          />
        </div>

        <Link
          to={`/decks/${deck.id}`}
          className="focus-ring mt-4 flex flex-1 flex-col rounded-lg"
          aria-label={`Open ${deck.name}`}
        >
          <h3 className="text-lg font-semibold tracking-tight text-fg">{deck.name}</h3>
          {deck.description ? (
            <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-fg-muted">
              {deck.description}
            </p>
          ) : null}
        </Link>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-4">
          <Link
            to={`/decks/${deck.id}`}
            className="focus-ring rounded-lg text-sm font-medium text-fg-muted transition-colors hover:text-fg"
          >
            Edit cards
          </Link>
          {cardCount > 0 ? (
            <Link
              to={`/decks/${deck.id}/review`}
              className="focus-ring pressable inline-flex items-center gap-1.5 rounded-full bg-deck-accent px-3.5 py-1.5 text-xs font-semibold text-deck-accent-fg shadow-card transition-[filter,box-shadow] hover:brightness-110 hover:shadow-card-hover"
            >
              <PlayIcon />
              Review
            </Link>
          ) : (
            <span className="text-xs font-medium text-fg-subtle">No cards yet</span>
          )}
        </div>
      </div>
    </div>
  )
}
