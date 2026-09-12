import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router'
import { CreateDeckDialog } from '../components/decks/CreateDeckDialog'
import { CardFormDialog } from '../components/editor/CardFormDialog'
import { CardList } from '../components/editor/CardList'
import { DeckHeader } from '../components/editor/DeckHeader'
import { Button } from '../components/ui/Button'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { useDeck } from '../hooks/useDeck'
import { useFlashcardStore } from '../lib/store'
import type { Card } from '../lib/types'

export function DeckDetailRoute() {
  const { deckId } = useParams()
  const deck = useDeck(deckId)
  const navigate = useNavigate()

  const renameDeck = useFlashcardStore((state) => state.renameDeck)
  const deleteDeck = useFlashcardStore((state) => state.deleteDeck)
  const addCard = useFlashcardStore((state) => state.addCard)
  const updateCard = useFlashcardStore((state) => state.updateCard)
  const deleteCard = useFlashcardStore((state) => state.deleteCard)

  const [editDeckOpen, setEditDeckOpen] = useState(false)
  const [deleteDeckOpen, setDeleteDeckOpen] = useState(false)
  const [cardFormOpen, setCardFormOpen] = useState(false)
  const [editingCard, setEditingCard] = useState<Card | null>(null)
  const [deletingCard, setDeletingCard] = useState<Card | null>(null)

  if (!deck) {
    return <Navigate to="/" replace />
  }

  const currentDeckId = deck.id

  function openAddCard() {
    setEditingCard(null)
    setCardFormOpen(true)
  }

  function openEditCard(card: Card) {
    setEditingCard(card)
    setCardFormOpen(true)
  }

  function handleCardSubmit(front: string, back: string, frontImage?: string, backImage?: string) {
    if (editingCard) {
      updateCard(currentDeckId, editingCard.id, { front, back, frontImage, backImage })
    } else {
      addCard(currentDeckId, front, back, frontImage, backImage)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <DeckHeader
        deck={deck}
        onEdit={() => setEditDeckOpen(true)}
        onDeleteDeck={() => setDeleteDeckOpen(true)}
        onStartReview={() => navigate(`/decks/${deck.id}/review`)}
      />

      <div className="mt-12 flex items-center justify-between gap-3">
        <h2 className="text-eyebrow text-fg-subtle">Cards</h2>
        <Button size="sm" intent="secondary" onClick={openAddCard}>
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
          Add card
        </Button>
      </div>
      <div className="mt-4">
        <CardList cards={deck.cards} onEdit={openEditCard} onDelete={setDeletingCard} />
      </div>

      <CreateDeckDialog
        open={editDeckOpen}
        onOpenChange={setEditDeckOpen}
        deck={deck}
        onSubmit={(name, description) => renameDeck(deck.id, name, description || undefined)}
      />
      <ConfirmDialog
        open={deleteDeckOpen}
        onOpenChange={setDeleteDeckOpen}
        title="Delete deck?"
        description={`"${deck.name}" and all its cards will be permanently removed.`}
        onConfirm={() => {
          deleteDeck(deck.id)
          navigate('/')
        }}
      />
      <CardFormDialog
        open={cardFormOpen}
        onOpenChange={setCardFormOpen}
        card={editingCard}
        onSubmit={handleCardSubmit}
      />
      <ConfirmDialog
        open={deletingCard !== null}
        onOpenChange={(open) => !open && setDeletingCard(null)}
        title="Delete card?"
        description="This card will be permanently removed from the deck."
        onConfirm={() => deletingCard && deleteCard(deck.id, deletingCard.id)}
      />
    </div>
  )
}
