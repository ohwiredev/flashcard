import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useEffect, useRef, useState } from 'react'
import { Link, Outlet, useLocation, useParams } from 'react-router'
import { useDeck } from '../../hooks/useDeck'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { cn } from '../../lib/utils'
import { ThemeToggle } from '../theme/ThemeToggle'

const SESSION_KEY = 'appShellEntered'

function SettingsIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4.5 w-4.5"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </svg>
  )
}

function Separator() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-4 w-4 shrink-0 text-fg-subtle">
      <path
        d="M10 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function AppShell() {
  const { deckId } = useParams()
  const deck = useDeck(deckId)
  const location = useLocation()
  const isReview = location.pathname.endsWith('/review')
  const reduced = useReducedMotion()
  const mainRef = useRef<HTMLElement>(null)
  const [scrolled, setScrolled] = useState(false)

  const [alreadyEntered] = useState(
    () => typeof window !== 'undefined' && sessionStorage.getItem(SESSION_KEY) === 'true',
  )

  useEffect(() => {
    sessionStorage.setItem(SESSION_KEY, 'true')
  }, [])

  // The header sits flush with the page until you scroll, then earns its edge and shadow.
  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 4)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
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
    <div className="flex min-h-screen flex-col bg-bg text-fg">
      <header
        className={cn(
          'sticky top-0 z-30 bg-surface-translucent backdrop-blur-xl transition-[box-shadow,border-color] duration-[var(--duration-md)] ease-[var(--ease-out)]',
          scrolled ? 'border-b border-border shadow-card' : 'border-b border-transparent',
        )}
      >
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
          <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-sm">
            <Link
              to="/"
              className="focus-ring pressable flex shrink-0 items-center gap-2 rounded-lg font-semibold tracking-tight text-fg"
            >
              <span>Flashcard</span>
            </Link>
            {deck ? (
              <>
                <Separator />
                {isReview ? (
                  <Link
                    to={`/decks/${deck.id}`}
                    className="focus-ring truncate rounded-lg text-fg-muted transition-colors hover:text-fg"
                  >
                    {deck.name}
                  </Link>
                ) : (
                  <span className="truncate font-medium text-fg" aria-current="page">
                    {deck.name}
                  </span>
                )}
                {isReview ? (
                  <>
                    <Separator />
                    <span className="shrink-0 font-medium text-fg" aria-current="page">
                      Review
                    </span>
                  </>
                ) : null}
              </>
            ) : null}
          </nav>
          <div className="flex shrink-0 items-center gap-1">
            <Link
              to="/settings"
              aria-label="Settings"
              className="focus-ring pressable flex h-9 w-9 items-center justify-center rounded-full border border-transparent text-fg-muted hover:border-border hover:bg-bg-elevated hover:text-fg"
            >
              <SettingsIcon />
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main ref={mainRef} className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
