import type { Card } from '../../lib/types'

/** The next card, showing just behind the active one to hint that the deck continues. */
export function CardPeek({ card }: { card: Card }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 mx-auto flex aspect-[3/2] w-full max-w-xl translate-y-4 scale-[0.94] items-center justify-center overflow-hidden rounded-3xl border border-border bg-bg-elevated p-8 text-center opacity-60 shadow-card"
    >
      <div className="flex flex-col items-center gap-4 blur-[1px]">
        {card.frontImage ? (
          <img
            src={card.frontImage}
            alt=""
            className="max-h-[28vh] w-auto max-w-full rounded-xl object-contain"
          />
        ) : null}
        {card.front ? <p className="text-title text-fg-subtle">{card.front}</p> : null}
      </div>
    </div>
  )
}
