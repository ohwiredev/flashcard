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
      <BaseMenu.Trigger className="pressable flex h-8 w-8 items-center justify-center rounded-full text-fg-muted hover:bg-fg/5">
        {trigger}
      </BaseMenu.Trigger>
      <BaseMenu.Portal>
        <BaseMenu.Positioner side="bottom" align="end" sideOffset={6} className="z-50 outline-none">
          <BaseMenu.Popup className="min-w-36 origin-[var(--transform-origin)] rounded-xl border border-border bg-bg-elevated p-1 shadow-xl outline-none transition-[opacity,transform] duration-150 ease-[var(--ease-out)] data-[ending-style]:duration-100 data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0">
            {items.map((item) => (
              <BaseMenu.Item
                key={item.label}
                onClick={item.onSelect}
                className={cn(
                  'cursor-pointer rounded-lg px-3 py-2 text-sm outline-none data-[highlighted]:bg-fg/5',
                  item.destructive ? 'text-red-600' : 'text-fg',
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
