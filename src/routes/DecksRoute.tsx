import { useState } from 'react'
import { CreateDeckDialog } from '../components/decks/CreateDeckDialog'
import { DeckGrid } from '../components/decks/DeckGrid'
import { EmptyState } from '../components/decks/EmptyState'
import { Button } from '../components/ui/Button'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { useFlashcardStore } from '../lib/store'
import type { Deck } from '../lib/types'

export function DecksRoute() {
  const decks = useFlashcardStore((state) => state.decks)
  const createDeck = useFlashcardStore((state) => state.createDeck)
  const renameDeck = useFlashcardStore((state) => state.renameDeck)
  const deleteDeck = useFlashcardStore((state) => state.deleteDeck)

  const [formOpen, setFormOpen] = useState(false)
  const [editingDeck, setEditingDeck] = useState<Deck | null>(null)
  const [deletingDeck, setDeletingDeck] = useState<Deck | null>(null)

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
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-title text-fg">Your decks</h1>
        <Button size="sm" onClick={openCreate}>
          New Deck
        </Button>
      </div>

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
