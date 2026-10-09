import { useEffect } from 'react'
import { getSiteText } from '../content/site'
import { useLang } from '../i18n/useI18n'

/** 設定每頁的 <title> 與 meta description；沒有 title 時使用網站標題。 */
export function useDocumentMeta({ title, description }: { title?: string; description?: string } = {}) {
  const lang = useLang()
  const site = getSiteText(lang)
  useEffect(() => {
    document.title = title ? `${title} — ${site.meta.title}` : site.meta.title
    document.querySelector('meta[name="description"]')?.setAttribute('content', description ?? site.meta.description)
  }, [title, description, site])
}
