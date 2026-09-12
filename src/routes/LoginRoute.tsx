import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useAuthStore } from '../lib/authStore'

export function LoginRoute() {
  const status = useAuthStore((state) => state.status)
  const login = useAuthStore((state) => state.login)
  const error = useAuthStore((state) => state.error)
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (status === 'authenticated') {
    return <Navigate to="/" replace />
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    try {
      setSubmitting(true)
      await login(email, password)
      navigate('/')
    } catch {
      // Error message is already reflected via the auth store.
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-bg-elevated p-7 shadow-card">
        <h1 className="text-title text-fg">Welcome back</h1>
        <p className="mt-1.5 text-sm text-fg-muted">Sign in to your decks.</p>
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div>
            <label className="text-caption mb-1.5 block font-medium text-fg-muted">Email</label>
            <Input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoFocus
              required
            />
          </div>
          <div>
            <label className="text-caption mb-1.5 block font-medium text-fg-muted">Password</label>
            <Input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>
          {error ? <p className="text-caption text-red-600">{error}</p> : null}
          <Button type="submit" disabled={submitting} className="mt-2">
            {submitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      </div>
    </div>
  )
}
