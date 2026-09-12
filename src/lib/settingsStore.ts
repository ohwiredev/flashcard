import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type FontOption = 'general-sans' | 'inter' | 'system' | 'serif' | 'mono'

export const FONT_OPTIONS: { value: FontOption; label: string; description: string; stack: string }[] = [
  {
    value: 'general-sans',
    label: 'General Sans',
    description: 'Default',
    stack: "'General Sans', 'Inter var', 'Inter', system-ui, sans-serif",
  },
  {
    value: 'inter',
    label: 'Inter',
    description: 'Clean and neutral',
    stack: "'Inter var', 'Inter', system-ui, sans-serif",
  },
  {
    value: 'system',
    label: 'System UI',
    description: "Your device's default",
    stack: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
  },
  {
    value: 'serif',
    label: 'Serif',
    description: 'Classic and readable',
    stack: "ui-serif, Georgia, 'Times New Roman', serif",
  },
  {
    value: 'mono',
    label: 'Monospace',
    description: 'Fixed-width',
    stack: "ui-monospace, 'SFMono-Regular', 'JetBrains Mono', Menlo, monospace",
  },
]

interface SettingsState {
  font: FontOption
  setFont: (font: FontOption) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      font: 'general-sans',
      setFont: (font) => set({ font }),
    }),
    { name: 'flashcard-settings-v1' },
  ),
)
