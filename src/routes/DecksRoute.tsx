import { useState } from 'react'
import { CreateDeckDialog } from '../components/decks/CreateDeckDialog'
import { DeckGrid } from '../components/decks/DeckGrid'
import { EmptyState } from '../components/decks/EmptyState'
import { Button } from '../components/ui/Button'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { useFlashcardStore } from '../lib/store'
import type { Deck } from '../lib/types'

function PlusIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      className="h-3.5 w-3.5"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

export function DecksRoute() {
  const decks = useFlashcardStore((state) => state.decks)
  const createDeck = useFlashcardStore((state) => state.createDeck)
  const renameDeck = useFlashcardStore((state) => state.renameDeck)
  const deleteDeck = useFlashcardStore((state) => state.deleteDeck)

  const [formOpen, setFormOpen] = useState(false)
  const [editingDeck, setEditingDeck] = useState<Deck | null>(null)
  const [deletingDeck, setDeletingDeck] = useState<Deck | null>(null)

  const cardTotal = decks.reduce((total, deck) => total + deck.cards.length, 0)

  function openCreate() {
    setEditingDeck(null)
    setFormOpen(true)
  }

  function openRename(deck: Deck) {
    setEditingDeck(deck)
    setFormOpen(true)
  }

  function handleSubmit(name: string, description: string) {
    if (editingDeck) {
      renameDeck(editingDeck.id, name, description || undefined)
    } else {
      createDeck(name, description || undefined)
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-eyebrow text-fg-subtle">Library</p>
          <h1 className="text-title mt-2 text-fg">Your decks</h1>
          {decks.length > 0 ? (
            <p className="nums-tabular mt-2 text-sm text-fg-muted">
              {decks.length} {decks.length === 1 ? 'deck' : 'decks'} · {cardTotal}{' '}
              {cardTotal === 1 ? 'card' : 'cards'}
            </p>
          ) : (
            <p className="mt-2 text-sm text-fg-muted">
              Everything you're studying, in one place.
            </p>
          )}
        </div>
        <Button onClick={openCreate} className="self-start sm:self-auto">
          <PlusIcon />
          New deck
        </Button>
      </header>

      {decks.length === 0 ? (
        <EmptyState onCreate={openCreate} />
      ) : (
        <DeckGrid decks={decks} onRename={openRename} onDelete={setDeletingDeck} />
      )}

      <CreateDeckDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        deck={editingDeck}
        onSubmit={handleSubmit}
      />
      <ConfirmDialog
        open={deletingDeck !== null}
        onOpenChange={(open) => !open && setDeletingDeck(null)}
        title="Delete deck?"
        description={
          deletingDeck ? `"${deletingDeck.name}" and all its cards will be permanently removed.` : ''
        }
        onConfirm={() => deletingDeck && deleteDeck(deletingDeck.id)}
      />
    </div>
  )
}
