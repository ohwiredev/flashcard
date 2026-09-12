import { Dialog } from '../ui/Dialog'

const SHORTCUTS: Array<{ keys: string[]; description: string }> = [
  { keys: ['Space'], description: 'Flip the card' },
  { keys: ['←'], description: 'Previous card' },
  { keys: ['→'], description: 'Next card' },
  { keys: ['?'], description: 'Show this list' },
]

export function KeyboardShortcutsDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Keyboard shortcuts">
      <ul className="flex flex-col gap-3">
        {SHORTCUTS.map(({ keys, description }) => (
          <li key={description} className="flex items-center justify-between gap-4 text-sm">
            <span className="text-fg-muted">{description}</span>
            <span className="flex gap-1">
              {keys.map((key) => (
                <kbd
                  key={key}
                  className="min-w-6 rounded-md border border-border bg-bg px-2 py-1 text-center text-xs font-medium text-fg"
                >
                  {key}
                </kbd>
              ))}
            </span>
          </li>
        ))}
      </ul>
    </Dialog>
  )
}
