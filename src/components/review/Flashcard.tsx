import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import Draggable from 'gsap/Draggable'
import InertiaPlugin from 'gsap/InertiaPlugin'
import {
  forwardRef,
  type KeyboardEvent,
  type RefObject,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import type { Card } from '../../lib/types'
import { cn } from '../../lib/utils'
import { PEEK_OPACITY, PEEK_SCALE, PEEK_Y } from './cardMotion'

gsap.registerPlugin(Draggable, InertiaPlugin)

/** Fraction of the card's width a release must (projected) travel to commit a swipe. */
const COMMIT_RATIO = 0.25
/** Floor for the commit distance, so a narrow phone card still needs a deliberate drag. */
const MIN_COMMIT_DISTANCE = 64
/** Decay for momentum projection — a flick commits based on where it's heading, not where it let go. */
const DECELERATION_RATE = 0.995
/** A flick only counts once the finger has really travelled, so a sloppy tap can't fling the card. */
const MIN_FLICK_DISTANCE = 24
/** Movement (px) before a press becomes a drag. Thumb taps wobble a few pixels; they should still flip. */
const TAP_SLOP = 8
const MAX_TILT_DEG = 12
/** Slight lift while held, so the card reads as picked up off the deck. */
const LIFT_SCALE = 1.02
/** Speed floor (px/s) for the fly-off, so a slow drag past the threshold still leaves briskly. */
const MIN_FLY_SPEED = 1100

type Direction = 'left' | 'right'

/** Where a release with this velocity would come to rest (Apple's scroll-deceleration projection). */
function projectMomentum(velocity: number): number {
  return ((velocity / 1000) * DECELERATION_RATE) / (1 - DECELERATION_RATE)
}

/** Progressive resistance past an edge: follows closely at first, then less and less the further it's pulled. */
function rubberband(overshoot: number, dimension: number, constant = 0.55): number {
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot))
}

function hapticTick() {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(8)
}

/** Horizontal distance that fully clears the viewport, however wide the card is relative to it. */
function offscreenX(el: HTMLElement): number {
  const width = el.offsetWidth || 1
  return (window.innerWidth + width) / 2 + width * 0.25
}

export interface FlashcardHandle {
  /** Plays the same fly-off swipe animation as a drag release, e.g. for arrow-key navigation. */
  swipe: (direction: Direction) => void
}

export const Flashcard = forwardRef<
  FlashcardHandle,
  {
    card: Card
    isFlipped: boolean
    onFlip: () => void
    onSwipe: (direction: Direction) => void
    canSwipeBack: boolean
    /** The card peeking out behind this one; lifted into place as this card is swiped forward. */
    peekRef: RefObject<HTMLDivElement | null>
  }
>(function Flashcard({ card, isFlipped, onFlip, onSwipe, canSwipeBack, peekRef }, ref) {
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
  const flyOffRef = useRef<(direction: Direction, velocity?: number) => void>(() => {})
  /** Direction of the swipe that replaced the previous card, so the new one can enter to match. */
  const arrivedViaRef = useRef<Direction | null>(null)

  // Keep the card focused as it changes so keyboard flipping works without re-tabbing.
  useEffect(() => {
    rootRef.current?.focus({ preventScroll: true })
  }, [card.id])

  // Mirror the latest prop into a ref so the imperative handle (created once) reads the current value.
  useEffect(() => {
    canSwipeBackRef.current = canSwipeBack
  })

  // Place the new card and refill the peek slot so the hand-off reads as one continuous deck:
  // - forward: the peek was already lifted into this card's exact pose during the swipe, so the
  //   new card simply takes its place; the peek slot refills from deeper in the deck.
  // - back: the previous card returns along the path it left by, and the card we were on settles
  //   back into the peek slot.
  useGSAP(
    () => {
      const el = rootRef.current
      if (!el) return
      const peek = peekRef.current
      const arrivedVia = reduced ? null : arrivedViaRef.current
      arrivedViaRef.current = null
      isLeavingRef.current = false

      const inner = innerRef.current
      const faces = [frontFaceRef.current, backFaceRef.current]
      gsap.killTweensOf([el, peek, inner, ...faces, nextStampRef.current, backStampRef.current].filter(Boolean))
      gsap.set([nextStampRef.current, backStampRef.current], { opacity: 0, scale: 0.9 })

      // Snap to the new card's flip state. Otherwise, swiping away a card showing its answer would
      // leave the flip effect to animate the new card from the answer side back to its question.
      if (reduced) {
        gsap.set(inner, { rotationY: 0 })
        gsap.set(faces[0], { opacity: isFlipped ? 0 : 1 })
        gsap.set(faces[1], { opacity: isFlipped ? 1 : 0 })
      } else {
        gsap.set(inner, { rotationY: isFlipped ? 180 : 0 })
        gsap.set(faces, { opacity: 1 })
      }
      gsap.set(el, { x: 0, y: 0, rotation: 0, scale: 1 })
      if (peek) gsap.set(peek, { y: PEEK_Y, scale: PEEK_SCALE, opacity: PEEK_OPACITY })

      if (arrivedVia === 'right') {
        if (peek) {
          gsap.from(peek, {
            y: PEEK_Y + 14,
            scale: PEEK_SCALE - 0.04,
            opacity: 0,
            duration: 0.36,
            ease: 'power3.out',
          })
        }
        // Content is already on screen via the lifted peek; fading it in again would flicker.
        return
      }

      if (arrivedVia === 'left') {
        gsap.from(el, { x: -offscreenX(el), rotation: -MAX_TILT_DEG, duration: 0.42, ease: 'power3.out' })
        if (peek) {
          gsap.from(peek, { y: 0, scale: 1, opacity: 1, duration: 0.42, ease: 'power3.out' })
        }
        return
      }

      const targets = [frontContentRef.current, backContentRef.current].filter(Boolean)
      gsap.fromTo(
        targets,
        { opacity: 0, y: reduced ? 0 : 4 },
        { opacity: 1, y: 0, duration: 0.16, ease: 'power2.out', overwrite: 'auto' },
      )
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

  // Swipe gesture. The card tracks the finger horizontally (vertical movement is left to native
  // page scrolling), tilts toward whichever end was grabbed, and lifts the peek card toward the
  // front as it goes. On release, momentum is projected forward: if the card is heading past the
  // commit distance in an allowed direction it flies off at the finger's speed, otherwise it
  // springs home. flyOff() is shared with the imperative `swipe()` handle so arrow keys and the
  // Previous/Next buttons play the same animation.
  useGSAP(
    () => {
      const el = rootRef.current
      if (!el) return

      let tiltSign = 1
      let dragged = false
      /** Which way the card is currently past the commit distance, if at all. */
      let armed: Direction | null = null

      const commitDistance = () => Math.max(MIN_COMMIT_DISTANCE, (el.offsetWidth || 1) * COMMIT_RATIO)

      /** 0 = peek at rest behind the deck, 1 = peek exactly in the active card's pose. */
      function liftPeek(t: number, tween?: gsap.TweenVars) {
        const peek = peekRef.current
        if (!peek) return
        const pose = {
          y: PEEK_Y * (1 - t),
          scale: PEEK_SCALE + (1 - PEEK_SCALE) * t,
          opacity: PEEK_OPACITY + (1 - PEEK_OPACITY) * t,
        }
        if (tween) gsap.to(peek, { ...pose, ...tween, overwrite: true })
        else gsap.set(peek, pose)
      }

      const stampFor = (direction: Direction) =>
        direction === 'right' ? nextStampRef.current : backStampRef.current

      // Crossing the commit distance is the moment a release would count, so mark it: the stamp
      // pops and (where supported) the device ticks. Dropping back under it quietly un-arms.
      function setArmed(next: Direction | null) {
        if (next === armed) return
        const previous = armed && stampFor(armed)
        if (previous) gsap.to(previous, { scale: 0.9, duration: 0.18, ease: 'power2.out' })
        armed = next
        const stamp = next && stampFor(next)
        if (!stamp) return
        hapticTick()
        gsap.to(stamp, { scale: 1.08, duration: 0.18, ease: 'back.out(3)' })
      }

      function flyOff(direction: Direction, velocity = 0): void {
        if (!el || isLeavingRef.current) return
        isLeavingRef.current = true
        draggableRef.current?.disable()
        gsap.killTweensOf(el)

        const sign = direction === 'right' ? 1 : -1
        const targetX = sign * offscreenX(el)
        const currentX = Number(gsap.getProperty(el, 'x')) || 0

        // Hand off the finger's velocity: the curve starts at exactly the release speed and accelerates
        // to cover the rest (p² for a keyboard swipe with no velocity, linear for a fast flick).
        const remaining = Math.abs(targetX - currentX) || 1
        const releaseSpeed = Math.max(0, velocity * sign)
        const speed = Math.max(releaseSpeed, MIN_FLY_SPEED)
        const duration = reduced ? 0.12 : gsap.utils.clamp(0.16, 0.4, remaining / speed)
        const initialSlope = gsap.utils.clamp(0, 1, (releaseSpeed * duration) / remaining)

        gsap.set(stampFor(direction === 'right' ? 'left' : 'right'), { opacity: 0 })
        gsap.to(stampFor(direction), { opacity: 1, duration: 0.1 })
        if (direction === 'right' && !reduced) liftPeek(1, { duration, ease: 'power2.out' })

        gsap.to(el, {
          x: targetX,
          y: reduced ? 0 : 24,
          rotation: reduced ? 0 : sign * tiltSign * MAX_TILT_DEG * 1.6,
          duration,
          ease: reduced ? 'none' : (p: number) => initialSlope * p + (1 - initialSlope) * p * p,
          onComplete: () => {
            arrivedViaRef.current = direction
            onSwipe(direction)
          },
        })
      }

      function snapBack() {
        if (!el) return
        const distance = Math.abs(Number(gsap.getProperty(el, 'x')) || 0)
        // A little overshoot, because the release carried momentum — but a settle, not a wobble.
        gsap.to(el, {
          x: 0,
          rotation: 0,
          scale: 1,
          duration: reduced ? 0.18 : gsap.utils.clamp(0.3, 0.5, 0.28 + distance / 900),
          ease: reduced ? 'power1.out' : 'back.out(1.15)',
          overwrite: true,
        })
        gsap.to([nextStampRef.current, backStampRef.current], { opacity: 0, scale: 0.9, duration: 0.2 })
        liftPeek(0, { duration: 0.3, ease: 'power2.out' })
        armed = null
      }

      // Draggable's own inertia is off (its throw tween would fight the release animation);
      // velocity is tracked directly instead.
      InertiaPlugin.track(el, 'x')

      const [draggable] = Draggable.create(el, {
        type: 'x',
        inertia: false,
        minimumMovement: TAP_SLOP,
        allowContextMenu: true,
        // Rubber-band against pulling back when there is no previous card to go to. (Done via
        // liveSnap rather than `bounds`, which Draggable hard-clamps on release without inertia.)
        liveSnap: canSwipeBack
          ? false
          : { x: (value: number) => (value < 0 ? rubberband(value, el.offsetWidth || 1) : value) },
        onPress() {
          if (isLeavingRef.current) return
          dragged = false
          // Grab it mid-flight: stop any settle or entrance so the drag starts from where it is.
          gsap.killTweensOf(el)
          if (peekRef.current) gsap.killTweensOf(peekRef.current)
          const rect = el.getBoundingClientRect()
          tiltSign = this.pointerY - window.scrollY < rect.top + rect.height / 2 ? 1 : -1
          if (!reduced) gsap.to(el, { scale: LIFT_SCALE, duration: 0.15, ease: 'power2.out' })
        },
        onDragStart() {
          dragged = true
        },
        onRelease() {
          // A tap never reaches onDragEnd. Settle the lift — and, if the tap caught the card
          // mid-settle (onPress stopped that), finish bringing it home.
          if (!dragged && !isLeavingRef.current) snapBack()
        },
        onClick() {
          if (isLeavingRef.current) return
          onFlip()
        },
        onDrag() {
          const commit = commitDistance()
          const x = this.x
          const progress = x / commit
          const forward = x >= 0
          const allowed = forward || canSwipeBack

          if (!reduced) {
            const tilt = gsap.utils.clamp(-1, 1, x / ((el.offsetWidth || 1) * 0.6))
            gsap.set(el, { rotation: tilt * MAX_TILT_DEG * tiltSign })
          }

          // Stamps stay hidden through small wobbles and are fully shown just past halfway.
          const stampOpacity = allowed ? gsap.utils.clamp(0, 1, (Math.abs(progress) - 0.12) / 0.45) : 0
          gsap.set(stampFor(forward ? 'right' : 'left'), { opacity: stampOpacity })
          gsap.set(stampFor(forward ? 'left' : 'right'), { opacity: 0 })

          // The peek reaches the active card's exact pose right at the commit distance, previewing
          // the outcome before the finger lifts.
          if (!reduced) liftPeek(forward ? gsap.utils.clamp(0, 1, progress) : 0)

          setArmed(allowed && Math.abs(x) >= commit ? (forward ? 'right' : 'left') : null)
        },
        onDragEnd() {
          const velocity = InertiaPlugin.getVelocity(el, 'x')
          const projected = Math.abs(this.x) >= MIN_FLICK_DISTANCE ? this.x + projectMomentum(velocity) : this.x
          const direction: Direction = projected >= 0 ? 'right' : 'left'
          const allowed = direction === 'right' || canSwipeBack

          if (allowed && Math.abs(projected) >= commitDistance()) {
            flyOff(direction, velocity)
          } else {
            snapBack()
          }
        },
      })

      draggableRef.current = draggable
      flyOffRef.current = flyOff

      return () => {
        draggable.kill()
        InertiaPlugin.untrack(el)
        draggableRef.current = null
      }
    },
    // revertOnUpdate: without it, useGSAP defers all cleanup to unmount and every card would stack
    // another Draggable (and its callbacks) onto the same element.
    { dependencies: [card.id, reduced, canSwipeBack], scope: rootRef, revertOnUpdate: true },
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
        'flip-card relative z-10 mx-auto block aspect-[3/2] w-full max-w-xl cursor-grab rounded-3xl text-left outline-none select-none active:cursor-grabbing',
        'focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-4 focus-visible:ring-offset-bg',
      )}
    >
      <div
        ref={nextStampRef}
        aria-hidden
        className="pointer-events-none absolute top-6 right-6 z-20 rounded-xl border-2 border-deck-accent bg-bg-elevated/80 px-3 py-1 text-sm font-bold tracking-[0.12em] text-deck-accent opacity-0 backdrop-blur-sm"
      >
        NEXT
      </div>
      <div
        ref={backStampRef}
        aria-hidden
        className="pointer-events-none absolute top-6 left-6 z-20 rounded-xl border-2 border-fg-muted bg-bg-elevated/80 px-3 py-1 text-sm font-bold tracking-[0.12em] text-fg-muted opacity-0 backdrop-blur-sm"
      >
        BACK
      </div>
      <div ref={innerRef} className="flip-card-inner">
        <div
          ref={frontFaceRef}
          className="flip-card-front flex flex-col items-center justify-center overflow-hidden rounded-3xl border border-border bg-bg-elevated p-8 text-center shadow-flash"
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-deck-accent/8 to-transparent"
          />
          <span className="text-eyebrow absolute top-6 left-1/2 -translate-x-1/2 text-fg-subtle">
            Question
          </span>
          <div ref={frontContentRef} className="relative flex flex-col items-center gap-4">
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
        <div
          ref={backFaceRef}
          className="flip-card-back flex flex-col items-center justify-center overflow-hidden rounded-3xl border border-deck-accent bg-deck-accent p-8 text-center shadow-flash"
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-black/10"
          />
          <span className="text-eyebrow absolute top-6 left-1/2 -translate-x-1/2 text-deck-accent-fg/70">
            Answer
          </span>
          <div ref={backContentRef} className="relative flex flex-col items-center gap-4">
            {card.backImage ? (
              <img
                src={card.backImage}
                alt=""
                draggable={false}
                className="max-h-[28vh] w-auto max-w-full rounded-xl object-contain"
              />
            ) : null}
            <p className="text-title text-deck-accent-fg">{card.back}</p>
          </div>
        </div>
      </div>
    </div>
  )
})
