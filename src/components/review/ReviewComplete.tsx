import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useRef } from 'react'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { Button } from '../ui/Button'

export function ReviewComplete({
  deckName,
  onRestart,
  onBack,
}: {
  deckName: string
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
    <div ref={rootRef} className="flex flex-col items-center text-center">
      <h2 className="text-title text-fg">Nice work.</h2>
      <p className="mt-2 text-sm text-fg-muted">You reviewed every card in {deckName}.</p>
      <div className="mt-8 flex gap-3">
        <Button intent="secondary" onClick={onBack}>
          Back to deck
        </Button>
        <Button onClick={onRestart}>Restart</Button>
      </div>
    </div>
  )
}
