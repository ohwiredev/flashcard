import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createId } from './id'
import { createSeedDecks } from './seed'
import type { Card, Deck, DeckAccent } from './types'

interface FlashcardState {
  decks: Deck[]
  createDeck: (name: string, description?: string, accent?: DeckAccent) => Deck
  renameDeck: (deckId: string, name: string, description?: string) => void
  deleteDeck: (deckId: string) => void
  addCard: (deckId: string, front: string, back: string, frontImage?: string, backImage?: string) => void
  updateCard: (
    deckId: string,
    cardId: string,
    patch: Partial<Pick<Card, 'front' | 'back' | 'frontImage' | 'backImage'>>,
  ) => void
  deleteCard: (deckId: string, cardId: string) => void
}

const ACCENTS: DeckAccent[] = ['blue', 'violet', 'amber', 'teal', 'rose']

export const useFlashcardStore = create<FlashcardState>()(
  persist(
    (set, get) => ({
      decks: createSeedDecks(),

      createDeck: (name, description, accent) => {
        const now = Date.now()
        const deck: Deck = {
          id: createId(),
          name,
          description,
          accent: accent ?? ACCENTS[get().decks.length % ACCENTS.length],
          cards: [],
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({ decks: [...state.decks, deck] }))
        return deck
      },

      renameDeck: (deckId, name, description) => {
        set((state) => ({
          decks: state.decks.map((deck) =>
            deck.id === deckId ? { ...deck, name, description, updatedAt: Date.now() } : deck,
          ),
        }))
      },

      deleteDeck: (deckId) => {
        set((state) => ({ decks: state.decks.filter((deck) => deck.id !== deckId) }))
      },

      addCard: (deckId, front, back, frontImage, backImage) => {
        const now = Date.now()
        const card: Card = { id: createId(), front, back, frontImage, backImage, createdAt: now, updatedAt: now }
        set((state) => ({
          decks: state.decks.map((deck) =>
            deck.id === deckId ? { ...deck, cards: [...deck.cards, card], updatedAt: now } : deck,
          ),
        }))
      },

      updateCard: (deckId, cardId, patch) => {
        const now = Date.now()
        set((state) => ({
          decks: state.decks.map((deck) =>
            deck.id === deckId
              ? {
                  ...deck,
                  updatedAt: now,
                  cards: deck.cards.map((card) =>
                    card.id === cardId ? { ...card, ...patch, updatedAt: now } : card,
                  ),
                }
              : deck,
          ),
        }))
      },

      deleteCard: (deckId, cardId) => {
        set((state) => ({
          decks: state.decks.map((deck) =>
            deck.id === deckId
              ? { ...deck, cards: deck.cards.filter((card) => card.id !== cardId), updatedAt: Date.now() }
              : deck,
          ),
        }))
      },
    }),
    { name: 'flashcard-store-v1' },
  ),
)
