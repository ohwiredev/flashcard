import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'h-10 w-full rounded-xl border border-border bg-bg-elevated px-3.5 text-sm text-fg outline-none transition-colors',
        'focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/20',
        'placeholder:text-fg-muted',
        className,
      )}
      {...props}
    />
  ),
)
Input.displayName = 'Input'
