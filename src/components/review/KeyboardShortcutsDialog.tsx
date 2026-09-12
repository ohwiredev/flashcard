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
      <ul className="-my-1 flex flex-col">
        {SHORTCUTS.map(({ keys, description }) => (
          <li
            key={description}
            className="flex items-center justify-between gap-4 border-b border-border py-2.5 text-sm last:border-b-0"
          >
            <span className="text-fg-muted">{description}</span>
            <span className="flex gap-1">
              {keys.map((key) => (
                <kbd
                  key={key}
                  className="min-w-7 rounded-md border border-border bg-bg-sunken px-2 py-1 text-center font-sans text-xs font-medium text-fg shadow-card"
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
