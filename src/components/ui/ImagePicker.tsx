import { useRef, useState, type ChangeEvent } from 'react'
import { fileToResizedDataUrl } from '../../lib/image'
import { Button } from './Button'

export function ImagePicker({
  label,
  value,
  onChange,
}: {
  label: string
  value?: string
  onChange: (dataUrl: string | undefined) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    try {
      setError(null)
      const dataUrl = await fileToResizedDataUrl(file)
      onChange(dataUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add that image.')
    }
  }

  return (
    <div className="flex items-center gap-3">
      {value ? (
        <div className="relative shrink-0">
          <img src={value} alt="" className="h-16 w-16 rounded-lg border border-border object-cover" />
          <button
            type="button"
            onClick={() => onChange(undefined)}
            aria-label={`Remove ${label.toLowerCase()} image`}
            className="pressable absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-fg text-xs leading-none text-bg"
          >
            ×
          </button>
        </div>
      ) : null}
      <div className="flex flex-col gap-1">
        <Button type="button" intent="secondary" size="sm" onClick={() => inputRef.current?.click()}>
          {value ? 'Change image' : 'Add image'}
        </Button>
        {error ? <p className="text-caption text-red-600">{error}</p> : null}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        aria-label={`${label} image`}
      />
    </div>
  )
}
