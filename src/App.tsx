import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router'
import { AppShell } from './components/layout/AppShell'
import { useSettingsStore } from './lib/settingsStore'
import { DeckDetailRoute } from './routes/DeckDetailRoute'
import { DecksRoute } from './routes/DecksRoute'
import { NotFoundRoute } from './routes/NotFoundRoute'
import { ReviewRoute } from './routes/ReviewRoute'
import { SettingsRoute } from './routes/SettingsRoute'

export function App() {
  const font = useSettingsStore((state) => state.font)

  useEffect(() => {
    document.documentElement.dataset.font = font
  }, [font])

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<DecksRoute />} />
        <Route path="/decks" element={<Navigate to="/" replace />} />
        <Route path="/decks/:deckId" element={<DeckDetailRoute />} />
        <Route path="/decks/:deckId/review" element={<ReviewRoute />} />
        <Route path="/settings" element={<SettingsRoute />} />
      </Route>
      <Route path="*" element={<NotFoundRoute />} />
    </Routes>
  )
}
