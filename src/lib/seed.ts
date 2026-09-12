import type { Card, Deck } from './types'
import { createId } from './id'

function makeCard(front: string, back: string): Card {
  const now = Date.now()
  return { id: createId(), front, back, createdAt: now, updatedAt: now }
}

function makeDeck(name: string, description: string, accent: Deck['accent'], pairs: [string, string][]): Deck {
  const now = Date.now()
  return {
    id: createId(),
    name,
    description,
    accent,
    cards: pairs.map(([front, back]) => makeCard(front, back)),
    createdAt: now,
    updatedAt: now,
  }
}

export function createSeedDecks(): Deck[] {
  return [
    makeDeck('Spanish Basics', 'Everyday words to get you started', 'blue', [
      ['hola', 'hello'],
      ['gracias', 'thank you'],
      ['por favor', 'please'],
      ['buenos días', 'good morning'],
      ['¿cómo estás?', 'how are you?'],
      ['agua', 'water'],
      ['amigo', 'friend'],
      ['adiós', 'goodbye'],
    ]),
    makeDeck('World Capitals', 'Match each country to its capital', 'amber', [
      ['France', 'Paris'],
      ['Japan', 'Tokyo'],
      ['Australia', 'Canberra'],
      ['Canada', 'Ottawa'],
      ['Egypt', 'Cairo'],
      ['Brazil', 'Brasília'],
      ['Kenya', 'Nairobi'],
      ['Norway', 'Oslo'],
    ]),
  ]
}
