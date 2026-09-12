import { useEffect, useState, type FormEvent } from 'react'
import type { Card } from '../../lib/types'
import { Button } from '../ui/Button'
import { Dialog } from '../ui/Dialog'
import { ImagePicker } from '../ui/ImagePicker'
import { Textarea } from '../ui/Textarea'

export function CardFormDialog({
  open,
  onOpenChange,
  card,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  card?: Card | null
  onSubmit: (front: string, back: string, frontImage?: string, backImage?: string) => void
}) {
  const [front, setFront] = useState('')
  const [back, setBack] = useState('')
  const [frontImage, setFrontImage] = useState<string | undefined>(undefined)
  const [backImage, setBackImage] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (open) {
      setFront(card?.front ?? '')
      setBack(card?.back ?? '')
      setFrontImage(card?.frontImage)
      setBackImage(card?.backImage)
    }
  }, [open, card])

  // An image on the question side carries the prompt on its own, so the front text
  // only has to be filled in when there is no front image.
  const frontFilled = Boolean(front.trim() || frontImage)
  const canSubmit = frontFilled && Boolean(back.trim())

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!canSubmit) return
    onSubmit(front.trim(), back.trim(), frontImage, backImage)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={card ? 'Edit card' : 'Add card'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-caption mb-1.5 block font-medium text-fg-muted">
            Front
            {frontImage ? <span className="ml-1.5 text-fg-subtle">optional with an image</span> : null}
          </label>
          <Textarea
            value={front}
            onChange={(event) => setFront(event.target.value)}
            placeholder={frontImage ? 'Add a prompt, or leave the image to speak for itself' : "What you'll be asked"}
            autoFocus
          />
          <div className="mt-2">
            <ImagePicker label="Front" value={frontImage} onChange={setFrontImage} />
          </div>
        </div>
        <div>
          <label className="text-caption mb-1.5 block font-medium text-fg-muted">Back</label>
          <Textarea
            value={back}
            onChange={(event) => setBack(event.target.value)}
            placeholder="The answer"
          />
          <div className="mt-2">
            <ImagePicker label="Back" value={backImage} onChange={setBackImage} />
          </div>
        </div>
        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" intent="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={!canSubmit}>
            {card ? 'Save' : 'Add card'}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
