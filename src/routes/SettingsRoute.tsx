import { useNavigate } from 'react-router'
import { Button } from '../components/ui/Button'
import { useAuthStore } from '../lib/authStore'
import { FONT_OPTIONS, useSettingsStore } from '../lib/settingsStore'
import { cn } from '../lib/utils'

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
    >
      <path d="M5 12.5l4.5 4.5L19 7" />
    </svg>
  )
}

export function SettingsRoute() {
  const font = useSettingsStore((state) => state.font)
  const setFont = useSettingsStore((state) => state.setFont)
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-10">
        <p className="text-eyebrow text-fg-subtle">Preferences</p>
        <h1 className="text-title mt-2 text-fg">Settings</h1>
        <p className="mt-2 text-sm text-fg-muted">Customize how Flashcard looks for you.</p>
      </header>

      <section>
        <h2 className="text-sm font-semibold text-fg">Font</h2>
        <p className="mt-1 text-sm text-fg-muted">Choose the typeface used throughout the app.</p>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {FONT_OPTIONS.map((option) => {
            const selected = option.value === font
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setFont(option.value)}
                aria-pressed={selected}
                className={cn(
                  'focus-ring pressable relative flex flex-col items-start gap-3 rounded-2xl border bg-bg-elevated p-4 text-left shadow-card transition-colors hover:border-border-strong',
                  selected ? 'border-accent' : 'border-border',
                )}
              >
                {selected ? (
                  <span className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-accent-fg">
                    <CheckIcon />
                  </span>
                ) : null}
                <span className="text-2xl" style={{ fontFamily: option.stack }}>
                  Aa
                </span>
                <span>
                  <span className="block text-sm font-semibold text-fg">{option.label}</span>
                  <span className="block text-xs text-fg-muted">{option.description}</span>
                </span>
              </button>
            )
          })}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-semibold text-fg">Account</h2>
        <p className="mt-1 text-sm text-fg-muted">{user?.email}</p>
        <Button intent="secondary" size="sm" className="mt-4" onClick={handleLogout}>
          Sign out
        </Button>
      </section>
    </div>
  )
}
