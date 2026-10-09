import type { z } from 'zod'
import zhText from '../../content/site/zh.json'
import enText from '../../content/site/en.json'
import profileJson from '../../content/site/profile.json'
import homeJson from '../../content/site/home.json'
import type { Lang } from '../i18n/langs'
import { ContentError, formatIssues } from './errors'
import { homeSchema, profileSchema, siteTextSchema, type HomeCard, type Profile, type SiteText } from './schema'

const siteAssets = import.meta.glob<string>('/content/site/*.{jpg,jpeg,png,webp,svg}', {
  eager: true,
  import: 'default',
  query: '?url',
})

function parse<T>(schema: z.ZodType<T>, data: unknown, file: string): T {
  const result = schema.safeParse(data)
  if (!result.success) throw new ContentError(`內容驗證失敗：\n\n${formatIssues(file, result.error)}`)
  return result.data
}

type SiteContent = { text: Record<Lang, SiteText>; profile: Profile; home: HomeCard[] }
let cache: SiteContent | null = null

function load(): SiteContent {
  cache ??= {
    text: {
      zh: parse(siteTextSchema, zhText, '/content/site/zh.json'),
      en: parse(siteTextSchema, enText, '/content/site/en.json'),
    },
    profile: parse(profileSchema, profileJson, '/content/site/profile.json'),
    home: parse(homeSchema, homeJson, '/content/site/home.json').cards,
  }
  return cache
}

export const getSiteText = (lang: Lang): SiteText => load().text[lang]
export const getProfile = (): Profile => load().profile
export const getHomeCards = (): HomeCard[] => load().home

/** `content/site/` 內的圖片，例如 profile.avatar = "avatar.jpg"。 */
export function getSiteAsset(path: string): string | undefined {
  return siteAssets[`/content/site/${path.replace(/^\.\//, '')}`]
}
