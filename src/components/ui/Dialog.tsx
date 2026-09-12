import { Dialog as BaseDialog } from '@base-ui/react/dialog'
import type { ReactNode } from 'react'

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <BaseDialog.Root open={open} onOpenChange={onOpenChange}>
      <BaseDialog.Portal>
        <BaseDialog.Backdrop className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity duration-200 ease-[var(--ease-out)] data-[ending-style]:duration-150 data-[starting-style]:opacity-0 data-[ending-style]:opacity-0" />
        <BaseDialog.Popup className="surface-sheen fixed top-1/2 left-1/2 z-50 w-[min(27rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-bg-elevated p-6 shadow-pop outline-none transition-[opacity,transform] duration-200 ease-[var(--ease-out)] data-[ending-style]:duration-150 data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 sm:p-7">
          <BaseDialog.Title className="text-lg font-semibold tracking-tight text-fg">
            {title}
          </BaseDialog.Title>
          {description ? (
            <BaseDialog.Description className="mt-1.5 text-sm leading-relaxed text-fg-muted">
              {description}
            </BaseDialog.Description>
          ) : null}
          <div className="mt-5">{children}</div>
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  )
}
