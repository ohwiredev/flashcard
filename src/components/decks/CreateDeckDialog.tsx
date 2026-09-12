import { useEffect, useState, type FormEvent } from 'react'
import type { Deck } from '../../lib/types'
import { Button } from '../ui/Button'
import { Dialog } from '../ui/Dialog'
import { Input } from '../ui/Input'
import { Textarea } from '../ui/Textarea'

export function CreateDeckDialog({
  open,
  onOpenChange,
  deck,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  deck?: Deck | null
  onSubmit: (name: string, description: string) => Promise<void>
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setName(deck?.name ?? '')
      setDescription(deck?.description ?? '')
    }
  }, [open, deck])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!name.trim()) return
    try {
      setSubmitting(true)
      await onSubmit(name.trim(), description.trim())
      onOpenChange(false)
    } catch {
      // Error is surfaced to the user via the shared toast; keep the dialog open to retry.
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={deck ? 'Rename deck' : 'New deck'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-caption mb-1.5 block font-medium text-fg-muted">Name</label>
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. French Vocabulary"
            autoFocus
          />
        </div>
        <div>
          <label className="text-caption mb-1.5 block font-medium text-fg-muted">
            Description (optional)
          </label>
          <Textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="What's this deck for?"
          />
        </div>
        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" intent="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={!name.trim() || submitting}>
            {submitting ? 'Saving…' : deck ? 'Save' : 'Create deck'}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
