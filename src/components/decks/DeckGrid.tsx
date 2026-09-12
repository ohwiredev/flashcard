import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import type { Deck } from '../../lib/types'
import { DeckCard } from './DeckCard'

const SESSION_KEY = 'decksGridAnimated'

export function DeckGrid({
  decks,
  onRename,
  onDelete,
}: {
  decks: Deck[]
  onRename: (deck: Deck) => void
  onDelete: (deck: Deck) => void
}) {
  const reduced = useReducedMotion()
  const containerRef = useRef<HTMLDivElement>(null)
  const seenIds = useRef<Set<string>>(new Set())

  const [alreadyAnimated] = useState(
    () => typeof window !== 'undefined' && sessionStorage.getItem(SESSION_KEY) === 'true',
  )

  useEffect(() => {
    sessionStorage.setItem(SESSION_KEY, 'true')
  }, [])

  useGSAP(
    () => {
      if (!containerRef.current || reduced) {
        seenIds.current = new Set(decks.map((deck) => deck.id))
        return
      }

      const isFirstRun = seenIds.current.size === 0
      const newIds = decks.filter((deck) => !seenIds.current.has(deck.id)).map((deck) => deck.id)
      seenIds.current = new Set(decks.map((deck) => deck.id))

      if (isFirstRun && !alreadyAnimated) {
        gsap.fromTo(
          containerRef.current.querySelectorAll('[data-deck-card]'),
          { opacity: 0, y: 8 },
          { opacity: 1, y: 0, duration: 0.18, ease: 'power2.out', stagger: 0.04 },
        )
      } else if (!isFirstRun && newIds.length > 0) {
        const selector = newIds.map((id) => `[data-deck-id="${id}"]`).join(',')
        gsap.fromTo(
          containerRef.current.querySelectorAll(selector),
          { opacity: 0, y: 8 },
          { opacity: 1, y: 0, duration: 0.18, ease: 'power2.out' },
        )
      }
    },
    { dependencies: [decks.map((deck) => deck.id).join(',')], scope: containerRef },
  )

  return (
    <div ref={containerRef} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {decks.map((deck) => (
        <div key={deck.id} data-deck-card data-deck-id={deck.id}>
          <DeckCard deck={deck} onRename={() => onRename(deck)} onDelete={() => onDelete(deck)} />
        </div>
      ))}
    </div>
  )
}
