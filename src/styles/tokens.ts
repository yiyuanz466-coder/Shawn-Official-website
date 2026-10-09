export const CARD_SIZES = ['1x1', '2x1', '1x2', '2x2'] as const
export type CardSize = (typeof CARD_SIZES)[number]

export const CARD_TONES = ['surface', 'purple', 'violet-dark', 'coral', 'ink', 'lavender', 'teal'] as const
export type CardTone = (typeof CARD_TONES)[number]
