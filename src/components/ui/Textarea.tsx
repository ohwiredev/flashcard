import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'min-h-24 w-full resize-none rounded-xl border border-border bg-bg-sunken px-3.5 py-2.5 text-sm leading-relaxed text-fg outline-none transition-[border-color,box-shadow,background-color] duration-[var(--duration-sm)] ease-[var(--ease-out)]',
        'hover:border-border-strong',
        'focus-visible:border-accent focus-visible:bg-bg-elevated focus-visible:ring-4 focus-visible:ring-accent-soft',
        'placeholder:text-fg-subtle',
        className,
      )}
      {...props}
    />
  ),
)
Textarea.displayName = 'Textarea'
