import { useRef, useState, type ChangeEvent } from 'react'
import { uploadCardImage } from '../../lib/image'
import { Button } from './Button'

export function ImagePicker({
  label,
  value,
  onChange,
}: {
  label: string
  value?: string
  onChange: (url: string | undefined) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    try {
      setError(null)
      setUploading(true)
      const url = await uploadCardImage(file)
      onChange(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add that image.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      {value ? (
        <div className="relative shrink-0">
          <img
            src={value}
            alt=""
            className="h-16 w-16 rounded-xl border border-border object-cover shadow-card"
          />
          <button
            type="button"
            onClick={() => onChange(undefined)}
            aria-label={`Remove ${label.toLowerCase()} image`}
            className="focus-ring pressable absolute -top-1.5 -right-1.5 flex h-5.5 w-5.5 items-center justify-center rounded-full border-2 border-bg-elevated bg-fg text-xs leading-none text-bg shadow-card"
          >
            ×
          </button>
        </div>
      ) : null}
      <div className="flex flex-col gap-1">
        <Button
          type="button"
          intent="secondary"
          size="sm"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? 'Uploading…' : value ? 'Change image' : 'Add image'}
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
