import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type FontOption = 'system' | 'general-sans' | 'space-grotesk' | 'jetbrains-mono-nerd'

export const FONT_OPTIONS: { value: FontOption; label: string; description: string; stack: string }[] = [
  {
    value: 'system',
    label: 'System UI',
    description: 'Default',
    stack: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
  },
  {
    value: 'general-sans',
    label: 'General Sans',
    description: 'Clean and neutral',
    stack: "'General Sans', system-ui, sans-serif",
  },
  {
    value: 'space-grotesk',
    label: 'Space Grotesk',
    description: 'Geometric and modern',
    stack: "'Space Grotesk', system-ui, sans-serif",
  },
  {
    value: 'jetbrains-mono-nerd',
    label: 'JetBrains Mono Nerd Font',
    description: 'Fixed-width, with icon glyphs',
    stack: "'JetBrainsMono Nerd Font', 'JetBrains Mono', ui-monospace, monospace",
  },
]

interface SettingsState {
  font: FontOption
  setFont: (font: FontOption) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      font: 'system',
      setFont: (font) => set({ font }),
    }),
    { name: 'flashcard-settings-v1' },
  ),
)
