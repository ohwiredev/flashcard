import { Link } from 'react-router'
import { Button } from '../components/ui/Button'

export function NotFoundRoute() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
      <p className="text-display-2 text-fg-subtle/50">404</p>
      <h1 className="text-title mt-4 text-fg">Page not found</h1>
      <p className="mt-3 text-sm leading-relaxed text-fg-muted">
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <Link to="/" className="focus-ring mt-8 rounded-full">
        <Button tabIndex={-1}>Back to your decks</Button>
      </Link>
    </div>
  )
}
