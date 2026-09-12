import { Button } from '../ui/Button'

export function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-border px-6 py-20 text-center">
      <h2 className="text-lg font-semibold text-fg">No decks yet</h2>
      <p className="mt-2 max-w-sm text-sm text-fg-muted">
        Create your first deck to start adding cards and reviewing them.
      </p>
      <Button className="mt-6" onClick={onCreate}>
        New Deck
      </Button>
    </div>
  )
}
