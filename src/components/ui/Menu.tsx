import { Menu as BaseMenu } from '@base-ui/react/menu'
import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

export interface MenuAction {
  label: string
  onSelect: () => void
  destructive?: boolean
}

export function Menu({ trigger, items }: { trigger: ReactNode; items: MenuAction[] }) {
  return (
    <BaseMenu.Root>
      <BaseMenu.Trigger
        aria-label="Deck actions"
        className="focus-ring pressable flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-fg-subtle hover:bg-fg/5 hover:text-fg data-[popup-open]:bg-fg/5 data-[popup-open]:text-fg"
      >
        {trigger}
      </BaseMenu.Trigger>
      <BaseMenu.Portal>
        <BaseMenu.Positioner side="bottom" align="end" sideOffset={6} className="z-50 outline-none">
          <BaseMenu.Popup className="min-w-40 origin-[var(--transform-origin)] rounded-xl border border-border bg-bg-elevated p-1 shadow-pop outline-none transition-[opacity,transform] duration-150 ease-[var(--ease-out)] data-[ending-style]:duration-100 data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0">
            {items.map((item) => (
              <BaseMenu.Item
                key={item.label}
                onClick={item.onSelect}
                className={cn(
                  'cursor-pointer rounded-lg px-3 py-2 text-sm font-medium outline-none transition-colors duration-[var(--duration-sm)]',
                  item.destructive
                    ? 'text-red-600 data-[highlighted]:bg-red-500/10 dark:text-red-400'
                    : 'text-fg data-[highlighted]:bg-fg/5',
                )}
              >
                {item.label}
              </BaseMenu.Item>
            ))}
          </BaseMenu.Popup>
        </BaseMenu.Positioner>
      </BaseMenu.Portal>
    </BaseMenu.Root>
  )
}
