import { useParams } from 'react-router'
import { isLang, type Lang } from './langs'
import { en } from './en'
import { zh, type Dict } from './zh'

const DICTS: Record<Lang, Dict> = { zh, en }

/** 網址的 :lang 是語言的唯一真實來源；不在語言路由底下時預設為 zh。 */
export function useLang(): Lang {
  const { lang } = useParams()
  return isLang(lang) ? lang : 'zh'
}

export function useI18n(): { lang: Lang; t: Dict } {
  const lang = useLang()
  return { lang, t: DICTS[lang] }
}
