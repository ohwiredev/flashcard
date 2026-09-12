import { cva, type VariantProps } from 'class-variance-authority'
import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '../../lib/utils'

const button = cva(
  'focus-ring pressable pressable-hover inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full font-medium whitespace-nowrap disabled:pointer-events-none disabled:opacity-40',
  {
    variants: {
      intent: {
        primary: 'bg-accent text-accent-fg shadow-card hover:brightness-110 hover:shadow-card-hover',
        secondary:
          'border border-border bg-bg-elevated text-fg shadow-card hover:border-border-strong hover:shadow-card-hover',
        ghost: 'bg-transparent text-fg-muted hover:bg-fg/5 hover:text-fg',
        destructive: 'bg-red-600 text-white shadow-card hover:bg-red-500 hover:shadow-card-hover',
      },
      size: {
        sm: 'h-8 px-3.5 text-sm',
        md: 'h-10 px-5 text-sm',
        lg: 'h-12 px-7 text-base',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      intent: 'primary',
      size: 'md',
    },
  },
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof button> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, intent, size, ...props }, ref) => (
    <button ref={ref} className={cn(button({ intent, size }), className)} {...props} />
  ),
)
Button.displayName = 'Button'
