import { Link } from 'react-router'
import { Button } from '../components/ui/Button'

export function NotFoundRoute() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-6 text-center">
      <h1 className="text-title text-fg">Page not found</h1>
      <p className="mt-2 text-sm text-fg-muted">The page you're looking for doesn't exist.</p>
      <Link to="/" className="mt-6">
        <Button>Back to your decks</Button>
      </Link>
    </div>
  )
}
