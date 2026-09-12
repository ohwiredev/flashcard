export const ACCENTS = ['blue', 'violet', 'amber', 'teal', 'rose'] as const

export type DeckAccent = (typeof ACCENTS)[number]

export function isDeckAccent(value: unknown): value is DeckAccent {
  return typeof value === 'string' && (ACCENTS as readonly string[]).includes(value)
}
