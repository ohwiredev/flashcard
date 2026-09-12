export interface Card {
  id: string
  front: string
  back: string
  /** Data URL (resized/compressed client-side) — localStorage has no separate file storage. */
  frontImage?: string
  backImage?: string
  createdAt: number
  updatedAt: number
}

export type DeckAccent = 'blue' | 'violet' | 'amber' | 'teal' | 'rose'

export interface Deck {
  id: string
  name: string
  description?: string
  accent: DeckAccent
  cards: Card[]
  createdAt: number
  updatedAt: number
}
