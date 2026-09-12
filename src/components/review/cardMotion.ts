/**
 * Resting pose of the peek card behind the active one. Shared by CardPeek (initial inline
 * style) and Flashcard (which lifts the peek toward the front during a forward drag), so the
 * two can't drift apart — the swipe only looks seamless if the fully-lifted peek lands exactly
 * where the next active card renders.
 */
export const PEEK_SCALE = 0.94
export const PEEK_Y = 16
export const PEEK_OPACITY = 0.6
