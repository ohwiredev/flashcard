import { useFlashcardStore } from '../lib/store'

export function useDeck(deckId: string | undefined) {
  return useFlashcardStore((state) => state.decks.find((deck) => deck.id === deckId))
}
