import { z } from 'zod'
import { CARD_SIZES, CARD_TONES } from '../styles/tokens'

export const CATEGORIES = ['about', 'work', 'side'] as const

const cardSize = z.enum(CARD_SIZES)
const cardTone = z.enum(CARD_TONES)
const category = z.enum(CATEGORIES)
const localized = z.object({ zh: z.string().min(1), en: z.string().min(1) })

export const projectMetaSchema = z
  .object({
    order: z.number().int(),
    year: z.number().int().min(2000).max(2100),
    category: category.default('work'),
    cardSize: cardSize.default('2x2'),
    cardTone: cardTone.default('violet-dark'),
    cover: z.string().optional(),
    coverAlt: localized.optional(),
    tags: z.array(z.string()).default([]),
    protected: z.boolean().default(false),
  })
  .refine((meta) => !meta.cover || meta.coverAlt, {
    message: '有 cover 時必須提供 coverAlt（中英文的圖片替代文字）',
    path: ['coverAlt'],
  })

export const frontmatterSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  role: z.string().min(1),
  timeline: z.string().min(1),
  team: z.string().optional(),
  tools: z.array(z.string()).default([]),
  highlights: z.array(z.object({ value: z.string(), label: z.string() })).max(3).default([]),
})

export const siteTextSchema = z.object({
  meta: z.object({ title: z.string(), description: z.string() }),
  intro: z.object({ greeting: z.string(), body: z.string() }),
  quotes: z.array(z.string()),
  stats: z.array(z.object({ value: z.string(), label: z.string() })),
  about: z.object({
    heading: z.string(),
    paragraphs: z.array(z.string()),
    experience: z.array(
      z.object({
        period: z.string(),
        org: z.string(),
        role: z.string(),
        description: z.string(),
        /** 選填：content/site/ 內的 Logo 圖片檔名（建議正方形） */
        logo: z.string().min(1).optional(),
        logoAlt: z.string().min(1).optional(),
      }),
    ),
    education: z.array(z.object({ period: z.string(), school: z.string(), degree: z.string() })),
    /** 社團經歷；logo 為 content/site/ 內的圖片檔名 */
    clubs: z
      .array(z.object({ name: z.string().min(1), logo: z.string().min(1), logoAlt: z.string().min(1), description: z.string() }))
      .default([]),
  }),
})

export const profileSchema = z.object({
  name: z.string().min(1),
  avatar: z.string().min(1),
  email: z.email(),
  linkedin: z.url(),
  resume: localized,
})

const cardBase = z.object({
  id: z.string().min(1),
  position: z.number().int().min(0),
  size: cardSize,
  category,
})

export const homeCardSchema = z.discriminatedUnion('type', [
  cardBase.extend({ type: z.literal('intro') }),
  cardBase.extend({ type: z.literal('contact'), contact: z.enum(['email', 'linkedin']) }),
  cardBase.extend({ type: z.literal('quote'), index: z.number().int().min(0) }),
  cardBase.extend({ type: z.literal('stat'), index: z.number().int().min(0), tone: cardTone.default('surface') }),
  cardBase.extend({ type: z.literal('photo'), src: z.string().min(1), alt: localized }),
])

export const homeSchema = z.object({ cards: z.array(homeCardSchema) })

export type Category = (typeof CATEGORIES)[number]
export type ProjectMeta = z.infer<typeof projectMetaSchema>
export type Frontmatter = z.infer<typeof frontmatterSchema>
export type SiteText = z.infer<typeof siteTextSchema>
export type Profile = z.infer<typeof profileSchema>
export type HomeCard = z.infer<typeof homeCardSchema>
