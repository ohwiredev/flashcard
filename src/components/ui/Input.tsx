import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'h-10 w-full rounded-xl border border-border bg-bg-sunken px-3.5 text-sm text-fg shadow-none outline-none transition-[border-color,box-shadow,background-color] duration-[var(--duration-sm)] ease-[var(--ease-out)]',
        'hover:border-border-strong',
        'focus-visible:border-accent focus-visible:bg-bg-elevated focus-visible:ring-4 focus-visible:ring-accent-soft',
        'placeholder:text-fg-subtle',
        className,
      )}
      {...props}
    />
  ),
)
Input.displayName = 'Input'
