import { forwardRef } from 'react'
import type { Card } from '../../lib/types'
import { PEEK_OPACITY, PEEK_SCALE, PEEK_Y } from './cardMotion'

/**
 * The next card, showing just behind the active one to hint that the deck continues.
 * Its transform/opacity are handed to GSAP after mount (see Flashcard), which lifts it
 * toward the front as the active card is dragged away.
 */
export const CardPeek = forwardRef<HTMLDivElement, { card: Card }>(function CardPeek({ card }, ref) {
  return (
    <div
      ref={ref}
      aria-hidden
      style={{ transform: `translateY(${PEEK_Y}px) scale(${PEEK_SCALE})`, opacity: PEEK_OPACITY }}
      className="card-peek pointer-events-none absolute inset-0 z-0 mx-auto flex aspect-[3/2] w-full max-w-xl items-center justify-center overflow-hidden rounded-3xl border border-border bg-bg-elevated p-8 text-center shadow-flash"
    >
      {/* Mirrors the Flashcard front face, so once lifted into place it's indistinguishable from it. */}
      <span className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-deck-accent/8 to-transparent" />
      <span className="text-eyebrow absolute top-6 left-1/2 -translate-x-1/2 text-fg-subtle">Question</span>
      <div className="relative flex flex-col items-center gap-4">
        {card.frontImage ? (
          <img
            src={card.frontImage}
            alt=""
            draggable={false}
            className="max-h-[28vh] w-auto max-w-full rounded-xl object-contain"
          />
        ) : null}
        {card.front ? <p className="text-title text-fg">{card.front}</p> : null}
      </div>
    </div>
  )
})
