import { useEffect } from 'react'
import { Navigate, Outlet, Route, Routes } from 'react-router'
import { AppShell } from './components/layout/AppShell'
import { useAuthStore } from './lib/authStore'
import { useFlashcardStore } from './lib/store'
import { useSettingsStore } from './lib/settingsStore'
import { DeckDetailRoute } from './routes/DeckDetailRoute'
import { DecksRoute } from './routes/DecksRoute'
import { LoginRoute } from './routes/LoginRoute'
import { NotFoundRoute } from './routes/NotFoundRoute'
import { ReviewRoute } from './routes/ReviewRoute'
import { SettingsRoute } from './routes/SettingsRoute'

function RequireAuth() {
  const status = useAuthStore((state) => state.status)
  if (status !== 'authenticated') return <Navigate to="/login" replace />
  return <Outlet />
}

export function App() {
  const font = useSettingsStore((state) => state.font)
  const authStatus = useAuthStore((state) => state.status)
  const checkSession = useAuthStore((state) => state.checkSession)
  const fetchDecks = useFlashcardStore((state) => state.fetchDecks)
  const resetDecks = useFlashcardStore((state) => state.reset)

  useEffect(() => {
    checkSession()
  }, [checkSession])

  useEffect(() => {
    document.documentElement.dataset.font = font
  }, [font])

  useEffect(() => {
    if (authStatus === 'authenticated') {
      fetchDecks()
    } else if (authStatus === 'unauthenticated') {
      resetDecks()
    }
  }, [authStatus, fetchDecks, resetDecks])

  if (authStatus === 'loading') {
    return <div className="flex min-h-screen items-center justify-center bg-bg text-sm text-fg-muted">Loading…</div>
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginRoute />} />
      <Route element={<RequireAuth />}>
        <Route element={<AppShell />}>
          <Route path="/" element={<DecksRoute />} />
          <Route path="/decks" element={<Navigate to="/" replace />} />
          <Route path="/decks/:deckId" element={<DeckDetailRoute />} />
          <Route path="/decks/:deckId/review" element={<ReviewRoute />} />
          <Route path="/settings" element={<SettingsRoute />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFoundRoute />} />
    </Routes>
  )
}
