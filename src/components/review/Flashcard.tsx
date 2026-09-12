import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import Draggable from 'gsap/Draggable'
import InertiaPlugin from 'gsap/InertiaPlugin'
import {
  forwardRef,
  type KeyboardEvent,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import type { Card } from '../../lib/types'
import { cn } from '../../lib/utils'

gsap.registerPlugin(Draggable, InertiaPlugin)

const SWIPE_DISTANCE_RATIO = 0.32
const SWIPE_VELOCITY_THRESHOLD = 500
const MAX_TILT_DEG = 16

export interface FlashcardHandle {
  /** Plays the same fly-off swipe animation as a drag release, e.g. for arrow-key navigation. */
  swipe: (direction: 'left' | 'right') => void
}

export const Flashcard = forwardRef<
  FlashcardHandle,
  {
    card: Card
    isFlipped: boolean
    onFlip: () => void
    onSwipe: (direction: 'left' | 'right') => void
    canSwipeBack: boolean
  }
>(function Flashcard({ card, isFlipped, onFlip, onSwipe, canSwipeBack }, ref) {
  const reduced = useReducedMotion()
  const rootRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const frontFaceRef = useRef<HTMLDivElement>(null)
  const backFaceRef = useRef<HTMLDivElement>(null)
  const frontContentRef = useRef<HTMLDivElement>(null)
  const backContentRef = useRef<HTMLDivElement>(null)
  const nextStampRef = useRef<HTMLDivElement>(null)
  const backStampRef = useRef<HTMLDivElement>(null)
  const draggableRef = useRef<Draggable | null>(null)
  const isLeavingRef = useRef(false)
  const canSwipeBackRef = useRef(canSwipeBack)
  const flyOffRef = useRef<(direction: 'left' | 'right', releaseY?: number) => void>(() => {})

  // Keep the card focused as it changes so keyboard flipping works without re-tabbing.
  useEffect(() => {
    rootRef.current?.focus({ preventScroll: true })
  }, [card.id])

  // Mirror the latest prop into a ref so the Draggable callbacks (created once per card,
  // not per render) always read the current value without needing to be recreated.
  useEffect(() => {
    canSwipeBackRef.current = canSwipeBack
  })

  // Snap the card (position, tilt, stamps) back to rest whenever a new card arrives.
  useGSAP(
    () => {
      isLeavingRef.current = false
      draggableRef.current?.enable()
      gsap.set(rootRef.current, { x: 0, y: 0, rotation: 0 })
      gsap.set([nextStampRef.current, backStampRef.current], { opacity: 0 })
    },
    { dependencies: [card.id], scope: rootRef },
  )

  useGSAP(
    () => {
      if (!innerRef.current || !frontFaceRef.current || !backFaceRef.current) return

      if (reduced) {
        gsap.set(innerRef.current, { rotationY: 0 })
        gsap.to(frontFaceRef.current, {
          opacity: isFlipped ? 0 : 1,
          duration: 0.2,
          ease: 'power1.out',
          overwrite: 'auto',
        })
        gsap.to(backFaceRef.current, {
          opacity: isFlipped ? 1 : 0,
          duration: 0.2,
          ease: 'power1.out',
          overwrite: 'auto',
        })
      } else {
        gsap.set([frontFaceRef.current, backFaceRef.current], { opacity: 1 })
        gsap.to(innerRef.current, {
          rotationY: isFlipped ? 180 : 0,
          duration: 0.22,
          ease: 'power2.inOut',
          overwrite: 'auto',
        })
      }
    },
    { dependencies: [isFlipped, reduced], scope: rootRef },
  )

  useGSAP(
    () => {
      const targets = [frontContentRef.current, backContentRef.current].filter(Boolean)
      if (targets.length === 0) return
      gsap.fromTo(
        targets,
        { opacity: 0, y: reduced ? 0 : 4 },
        { opacity: 1, y: 0, duration: 0.16, ease: 'power2.out', overwrite: 'auto' },
      )
    },
    { dependencies: [card.id], scope: rootRef },
  )

  // Tinder-style drag: track the gesture, tilt and stamp proportionally to progress,
  // then on release either fling the card off-screen (past a distance/velocity threshold
  // in an allowed direction) or spring it back to center. flyOff()/snapBack() are shared
  // with the imperative `swipe()` handle so arrow-key navigation plays the same animation.
  useGSAP(
    () => {
      const el = rootRef.current
      if (!el) return

      function flyOff(direction: 'left' | 'right', releaseY = 0): void {
        if (!el || isLeavingRef.current) return
        isLeavingRef.current = true
        draggableRef.current?.disable()

        const width = el.offsetWidth || 1
        const flyX = direction === 'right' ? width * 1.6 : -width * 1.6
        const leadingStamp = direction === 'right' ? nextStampRef.current : backStampRef.current
        const trailingStamp = direction === 'right' ? backStampRef.current : nextStampRef.current

        gsap.set(trailingStamp, { opacity: 0 })
        gsap.to(leadingStamp, { opacity: 1, duration: 0.1 })
        gsap.to(el, {
          x: flyX,
          y: releaseY,
          rotation: reduced ? 0 : direction === 'right' ? MAX_TILT_DEG * 1.5 : -MAX_TILT_DEG * 1.5,
          duration: reduced ? 0.12 : 0.32,
          ease: 'power1.in',
          onComplete: () => onSwipe(direction),
        })
      }

      function snapBack() {
        if (!el) return
        gsap.to(el, {
          x: 0,
          y: 0,
          rotation: 0,
          duration: reduced ? 0.18 : 0.45,
          ease: reduced ? 'power1.out' : 'elastic.out(1, 0.65)',
        })
        gsap.to([nextStampRef.current, backStampRef.current], { opacity: 0, duration: 0.2 })
      }

      const [draggable] = Draggable.create(el, {
        type: 'x,y',
        inertia: true,
        allowContextMenu: true,
        onClick() {
          if (isLeavingRef.current) return
          onFlip()
        },
        onDrag() {
          const width = el.offsetWidth || 1
          const progress = gsap.utils.clamp(-1, 1, this.x / (width / 2))
          if (!reduced) {
            gsap.set(el, { rotation: progress * MAX_TILT_DEG })
          }
          gsap.set(nextStampRef.current, { opacity: Math.max(0, progress) })
          gsap.set(backStampRef.current, { opacity: Math.max(0, -progress) })
        },
        onDragEnd() {
          const width = el.offsetWidth || 1
          const distance = this.x
          const velocity = InertiaPlugin.getVelocity(el, 'x')
          const direction: 'left' | 'right' = distance + velocity * 0.1 >= 0 ? 'right' : 'left'
          const allowed = direction === 'right' || canSwipeBackRef.current

          const pastThreshold = Math.abs(distance) > width * SWIPE_DISTANCE_RATIO
          const flicked = Math.abs(velocity) > SWIPE_VELOCITY_THRESHOLD

          if (allowed && (pastThreshold || flicked)) {
            flyOff(direction, this.y + velocity * 0.04)
          } else {
            snapBack()
          }
        },
      })

      draggableRef.current = draggable

      // Exposed for arrow-key navigation (see useImperativeHandle below), so it plays the
      // same fling animation as a drag-released swipe instead of an instant page-style jump.
      flyOffRef.current = flyOff

      return () => {
        draggable.kill()
        draggableRef.current = null
      }
    },
    { dependencies: [card.id, reduced], scope: rootRef },
  )

  useImperativeHandle(
    ref,
    () => ({
      swipe(direction) {
        if (direction === 'left' && !canSwipeBackRef.current) return
        flyOffRef.current(direction)
      },
    }),
    [],
  )

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.code === 'Space' || event.code === 'Enter') {
      event.preventDefault()
      onFlip()
    }
  }

  return (
    <div
      ref={rootRef}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-pressed={isFlipped}
      aria-label={
        isFlipped ? 'Showing answer. Press space to show question.' : 'Showing question. Press space to show answer.'
      }
      className={cn(
        'flip-card relative z-10 mx-auto block aspect-[3/2] w-full max-w-xl cursor-grab touch-none text-left outline-none select-none active:cursor-grabbing',
        'focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-bg rounded-3xl',
      )}
    >
      <div
        ref={nextStampRef}
        aria-hidden
        className="pointer-events-none absolute top-6 right-6 z-20 -rotate-12 rounded-lg border-2 border-accent px-3 py-1 text-sm font-bold tracking-wide text-accent opacity-0"
      >
        NEXT
      </div>
      <div
        ref={backStampRef}
        aria-hidden
        className="pointer-events-none absolute top-6 left-6 z-20 rotate-12 rounded-lg border-2 border-fg-muted px-3 py-1 text-sm font-bold tracking-wide text-fg-muted opacity-0"
      >
        BACK
      </div>
      <div ref={innerRef} className="flip-card-inner">
        <div
          ref={frontFaceRef}
          className="flip-card-front flex items-center justify-center overflow-hidden rounded-3xl border border-border bg-bg-elevated p-8 text-center shadow-sm"
        >
          <div ref={frontContentRef} className="flex flex-col items-center gap-4">
            {card.frontImage ? (
              <img
                src={card.frontImage}
                alt=""
                className="max-h-[28vh] w-auto max-w-full rounded-xl object-contain"
              />
            ) : null}
            <p className="text-title text-fg">{card.front}</p>
          </div>
        </div>
        <div
          ref={backFaceRef}
          className="flip-card-back flex items-center justify-center overflow-hidden rounded-3xl border border-border bg-accent p-8 text-center shadow-sm"
        >
          <div ref={backContentRef} className="flex flex-col items-center gap-4">
            {card.backImage ? (
              <img
                src={card.backImage}
                alt=""
                className="max-h-[28vh] w-auto max-w-full rounded-xl object-contain"
              />
            ) : null}
            <p className="text-title text-accent-fg">{card.back}</p>
          </div>
        </div>
      </div>
    </div>
  )
})
