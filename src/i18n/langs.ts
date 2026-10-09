import { readStorage } from '../lib/storage'

export const LANGS = ['zh', 'en'] as const
export type Lang = (typeof LANGS)[number]

export const HTML_LANG: Record<Lang, string> = { zh: 'zh-Hant', en: 'en' }
export const LANG_STORAGE_KEY = 'lang'

export function isLang(value: unknown): value is Lang {
  return LANGS.includes(value as Lang)
}

/** 語言偵測順序：使用者手動選過的 → 瀏覽器語言（中文系為 zh，其餘為 en）。 */
export function detectLang(): Lang {
  const saved = readStorage(LANG_STORAGE_KEY)
  if (isLang(saved)) return saved
  return navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en'
}
