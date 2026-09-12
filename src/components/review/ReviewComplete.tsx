import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useRef } from 'react'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { Button } from '../ui/Button'

function CheckBadge() {
  return (
    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-soft text-accent">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
        className="h-7 w-7"
      >
        <path d="M5 12.5l4.5 4.5L19 7.5" />
      </svg>
    </span>
  )
}

export function ReviewComplete({
  deckName,
  cardCount,
  onRestart,
  onBack,
}: {
  deckName: string
  cardCount: number
  onRestart: () => void
  onBack: () => void
}) {
  const rootRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useGSAP(
    () => {
      if (!rootRef.current) return
      gsap.fromTo(
        rootRef.current,
        { opacity: 0, y: reduced ? 0 : 12 },
        { opacity: 1, y: 0, duration: reduced ? 0.2 : 0.4, ease: 'power2.out' },
      )
    },
    { scope: rootRef },
  )

  return (
    <div
      ref={rootRef}
      className="surface-sheen relative mx-auto flex w-full max-w-md flex-col items-center rounded-2xl border border-border bg-bg-elevated px-6 py-12 text-center shadow-card sm:px-10"
    >
      <CheckBadge />
      <h2 className="text-title mt-6 text-fg">Nice work.</h2>
      <p className="mt-3 text-sm leading-relaxed text-fg-muted">
        You reviewed all{' '}
        <span className="nums-tabular font-medium text-fg">
          {cardCount} {cardCount === 1 ? 'card' : 'cards'}
        </span>{' '}
        in {deckName}.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        <Button intent="secondary" onClick={onBack}>
          Back to deck
        </Button>
        <Button onClick={onRestart}>Review again</Button>
      </div>
    </div>
  )
}
