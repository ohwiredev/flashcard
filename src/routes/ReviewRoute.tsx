import { useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router'
import { CardPeek } from '../components/review/CardPeek'
import { Flashcard, type FlashcardHandle } from '../components/review/Flashcard'
import { KeyboardShortcutsDialog } from '../components/review/KeyboardShortcutsDialog'
import { ReviewComplete } from '../components/review/ReviewComplete'
import { ReviewControls } from '../components/review/ReviewControls'
import { ReviewProgress } from '../components/review/ReviewProgress'
import { useDeck } from '../hooks/useDeck'
import { useFlashcardStore } from '../lib/store'
import type { Deck } from '../lib/types'
import { shuffle } from '../lib/utils'

export function ReviewRoute() {
  const { deckId } = useParams()
  const deck = useDeck(deckId)
  const status = useFlashcardStore((state) => state.status)
  const navigate = useNavigate()

  if (!deck) {
    if (status === 'loading' || status === 'idle') {
      return <div className="mx-auto max-w-3xl px-4 py-10 text-sm text-fg-muted sm:px-6 sm:py-14">Loading…</div>
    }
    return <Navigate to="/" replace />
  }

  if (deck.cards.length === 0) {
    return <Navigate to={`/decks/${deck.id}`} replace />
  }

  // Keyed by deck.id so navigating directly between two decks' review pages
  // (no route remount otherwise) starts a fresh session instead of reusing stale state.
  return <ReviewSession key={deck.id} deck={deck} onExit={() => navigate(`/decks/${deck.id}`)} />
}

function ReviewSession({ deck, onExit }: { deck: Deck; onExit: () => void }) {
  const [order, setOrder] = useState(deck.cards)
  const [index, setIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [completed, setCompleted] = useState(false)
  const flashcardRef = useRef<FlashcardHandle>(null)
  const peekRef = useRef<HTMLDivElement>(null)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)

  const canPrev = index > 0
  const isLast = index >= order.length - 1

  function handleFlip() {
    setIsFlipped((flipped) => !flipped)
  }

  function handleNext() {
    if (!isLast) {
      setIndex((i) => i + 1)
      setIsFlipped(false)
    } else {
      setCompleted(true)
    }
  }

  function handlePrev() {
    if (canPrev) {
      setIndex((i) => i - 1)
      setIsFlipped(false)
    }
  }

  function handleSwipe(direction: 'left' | 'right') {
    if (direction === 'right') {
      handleNext()
    } else {
      handlePrev()
    }
  }

  function handleShuffle() {
    setOrder((current) => shuffle(current))
    setIndex(0)
    setIsFlipped(false)
  }

  function handleRestart() {
    setIndex(0)
    setIsFlipped(false)
    setCompleted(false)
  }

  // Space/Enter-to-flip is handled by the Flashcard itself (it keeps keyboard focus).
  // Arrow keys navigate regardless of focus (page-level, not card-level), and trigger the
  // same fly-off swipe animation as a drag release rather than an instant jump.
  useEffect(() => {
    if (completed) return

    function onKeyDown(event: KeyboardEvent) {
      if (event.code === 'ArrowLeft') {
        flashcardRef.current?.swipe('left')
      } else if (event.code === 'ArrowRight') {
        flashcardRef.current?.swipe('right')
      } else if (event.key === '?') {
        setShortcutsOpen((open) => !open)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  const currentCard = order[index]
  const peekCard = order[index + 1]

  return (
    <div
      data-accent={deck.accent}
      className="mx-auto flex max-w-3xl flex-col items-center px-4 py-10 sm:px-6 sm:py-14"
    >
      {completed ? (
        <ReviewComplete
          deckName={deck.name}
          cardCount={order.length}
          onRestart={handleRestart}
          onBack={onExit}
        />
      ) : (
        <>
          <ReviewProgress
            current={index + 1}
            total={order.length}
            onShowShortcuts={() => setShortcutsOpen(true)}
          />
          <div className="relative mt-8 w-full">
            {peekCard ? <CardPeek ref={peekRef} card={peekCard} /> : null}
            <Flashcard
              ref={flashcardRef}
              card={currentCard}
              isFlipped={isFlipped}
              onFlip={handleFlip}
              onSwipe={handleSwipe}
              canSwipeBack={canPrev}
              peekRef={peekRef}
            />
          </div>
          <p className="text-caption mt-5 flex flex-wrap items-center justify-center gap-1.5 text-fg-subtle">
            <span>Tap to flip</span>
            <span aria-hidden>·</span>
            <span>Swipe or press</span>
            <kbd className="rounded-md border border-border bg-bg-elevated px-1.5 py-0.5 font-sans text-[0.6875rem] font-medium text-fg-muted shadow-card">
              ←
            </kbd>
            <kbd className="rounded-md border border-border bg-bg-elevated px-1.5 py-0.5 font-sans text-[0.6875rem] font-medium text-fg-muted shadow-card">
              →
            </kbd>
            <span>to move</span>
          </p>
          {/* Buttons play the same swipe as a drag or arrow key, rather than jumping instantly. */}
          <ReviewControls
            onPrev={() => flashcardRef.current?.swipe('left')}
            onNext={() => flashcardRef.current?.swipe('right')}
            onFlip={handleFlip}
            onShuffle={handleShuffle}
            canPrev={canPrev}
            isLast={isLast}
          />
        </>
      )}
      <KeyboardShortcutsDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
    </div>
  )
}
