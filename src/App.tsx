import { Navigate, Route, Routes } from 'react-router'
import { AppShell } from './components/layout/AppShell'
import { DeckDetailRoute } from './routes/DeckDetailRoute'
import { DecksRoute } from './routes/DecksRoute'
import { NotFoundRoute } from './routes/NotFoundRoute'
import { ReviewRoute } from './routes/ReviewRoute'

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<DecksRoute />} />
        <Route path="/decks" element={<Navigate to="/" replace />} />
        <Route path="/decks/:deckId" element={<DeckDetailRoute />} />
        <Route path="/decks/:deckId/review" element={<ReviewRoute />} />
      </Route>
      <Route path="*" element={<NotFoundRoute />} />
    </Routes>
  )
}
