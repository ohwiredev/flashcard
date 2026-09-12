import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return <div className="h-9 w-9" aria-hidden />
  }

  const isDark = resolvedTheme === 'dark'

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="focus-ring pressable relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-transparent text-fg-muted hover:border-border hover:bg-bg-elevated hover:text-fg"
    >
      {/* Both icons stay mounted and cross-fade, so the swap reads as one motion. */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        aria-hidden
        className="absolute h-4.5 w-4.5 transition-[opacity,transform] duration-[var(--duration-md)] ease-[var(--ease-out)]"
        style={{
          opacity: isDark ? 1 : 0,
          transform: isDark ? 'rotate(0deg) scale(1)' : 'rotate(-90deg) scale(0.6)',
        }}
      >
        <circle cx="12" cy="12" r="4.5" />
        <path
          strokeLinecap="round"
          d="M12 2.5v2M12 19.5v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2.5 12h2M19.5 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"
        />
      </svg>
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden
        className="absolute h-4.5 w-4.5 transition-[opacity,transform] duration-[var(--duration-md)] ease-[var(--ease-out)]"
        style={{
          opacity: isDark ? 0 : 1,
          transform: isDark ? 'rotate(90deg) scale(0.6)' : 'rotate(0deg) scale(1)',
        }}
      >
        <path d="M20.5 14.5a8.5 8.5 0 1 1-9-13 7 7 0 0 0 9 13Z" />
      </svg>
    </button>
  )
}
