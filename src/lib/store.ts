import { create } from 'zustand'
import { apiDelete, apiGet, apiPatch, apiPost } from './apiClient'
import type { Card, Deck, DeckAccent } from './types'

interface FlashcardState {
  decks: Deck[]
  status: 'idle' | 'loading' | 'loaded' | 'error'
  fetchDecks: () => Promise<void>
  reset: () => void
  createDeck: (name: string, description?: string, accent?: DeckAccent) => Promise<Deck>
  renameDeck: (deckId: string, name: string, description?: string) => Promise<void>
  deleteDeck: (deckId: string) => Promise<void>
  addCard: (deckId: string, front: string, back: string, frontImage?: string, backImage?: string) => Promise<void>
  updateCard: (
    deckId: string,
    cardId: string,
    patch: Partial<Pick<Card, 'front' | 'back' | 'frontImage' | 'backImage'>>,
  ) => Promise<void>
  deleteCard: (deckId: string, cardId: string) => Promise<void>
}

export const useFlashcardStore = create<FlashcardState>()((set) => ({
  decks: [],
  status: 'idle',

  fetchDecks: async () => {
    set({ status: 'loading' })
    try {
      const data = await apiGet<{ decks: Deck[] }>('/decks')
      set({ decks: data.decks, status: 'loaded' })
    } catch {
      set({ status: 'error' })
    }
  },

  reset: () => set({ decks: [], status: 'idle' }),

  createDeck: async (name, description, accent) => {
    const data = await apiPost<{ deck: Deck }>('/decks', { name, description, accent })
    set((state) => ({ decks: [...state.decks, data.deck] }))
    return data.deck
  },

  renameDeck: async (deckId, name, description) => {
    await apiPatch(`/decks/${deckId}`, { name, description })
    set((state) => ({
      decks: state.decks.map((deck) =>
        deck.id === deckId ? { ...deck, name, description, updatedAt: Date.now() } : deck,
      ),
    }))
  },

  deleteDeck: async (deckId) => {
    await apiDelete(`/decks/${deckId}`)
    set((state) => ({ decks: state.decks.filter((deck) => deck.id !== deckId) }))
  },

  addCard: async (deckId, front, back, frontImage, backImage) => {
    const data = await apiPost<{ card: Card }>(`/decks/${deckId}/cards`, { front, back, frontImage, backImage })
    set((state) => ({
      decks: state.decks.map((deck) =>
        deck.id === deckId ? { ...deck, cards: [...deck.cards, data.card], updatedAt: Date.now() } : deck,
      ),
    }))
  },

  updateCard: async (deckId, cardId, patch) => {
    await apiPatch(`/decks/${deckId}/cards/${cardId}`, patch)
    const now = Date.now()
    set((state) => ({
      decks: state.decks.map((deck) =>
        deck.id === deckId
          ? {
              ...deck,
              updatedAt: now,
              cards: deck.cards.map((card) => (card.id === cardId ? { ...card, ...patch, updatedAt: now } : card)),
            }
          : deck,
      ),
    }))
  },

  deleteCard: async (deckId, cardId) => {
    await apiDelete(`/decks/${deckId}/cards/${cardId}`)
    set((state) => ({
      decks: state.decks.map((deck) =>
        deck.id === deckId
          ? { ...deck, cards: deck.cards.filter((card) => card.id !== cardId), updatedAt: Date.now() }
          : deck,
      ),
    }))
  },
}))
