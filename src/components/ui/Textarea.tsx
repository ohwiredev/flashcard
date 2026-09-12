import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'min-h-24 w-full resize-none rounded-xl border border-border bg-bg-elevated px-3.5 py-2.5 text-sm text-fg outline-none transition-colors',
        'focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/20',
        'placeholder:text-fg-muted',
        className,
      )}
      {...props}
    />
  ),
)
Textarea.displayName = 'Textarea'
