import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useEffect, useRef, useState } from 'react'
import { Link, Outlet, useLocation, useParams } from 'react-router'
import { useDeck } from '../../hooks/useDeck'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { ThemeToggle } from '../theme/ThemeToggle'

const SESSION_KEY = 'appShellEntered'

export function AppShell() {
  const { deckId } = useParams()
  const deck = useDeck(deckId)
  const location = useLocation()
  const isReview = location.pathname.endsWith('/review')
  const reduced = useReducedMotion()
  const mainRef = useRef<HTMLElement>(null)

  const [alreadyEntered] = useState(
    () => typeof window !== 'undefined' && sessionStorage.getItem(SESSION_KEY) === 'true',
  )

  useEffect(() => {
    sessionStorage.setItem(SESSION_KEY, 'true')
  }, [])

  useGSAP(
    () => {
      if (alreadyEntered || reduced || !mainRef.current) return
      gsap.fromTo(
        mainRef.current,
        { opacity: 0, scale: 0.98 },
        { opacity: 1, scale: 1, duration: 0.25, ease: 'power2.out' },
      )
    },
    { scope: mainRef },
  )

  return (
    <div className="min-h-screen bg-bg text-fg">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-surface-translucent backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-2 text-sm">
            <Link to="/" className="pressable font-semibold text-fg">
              Flashcard
            </Link>
            {deck ? (
              <>
                <span className="text-fg-muted">/</span>
                {isReview ? (
                  <Link to={`/decks/${deck.id}`} className="pressable truncate text-fg-muted hover:text-fg">
                    {deck.name}
                  </Link>
                ) : (
                  <span className="truncate text-fg-muted">{deck.name}</span>
                )}
                {isReview ? <span className="text-fg-muted">/ Review</span> : null}
              </>
            ) : null}
          </div>
          <ThemeToggle />
        </div>
      </header>
      <main ref={mainRef}>
        <Outlet />
      </main>
    </div>
  )
}
