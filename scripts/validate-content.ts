/**
 * 建置前的內容驗證：檢查 content/ 內所有 JSON 與 MDX 是否符合 schema、圖片是否存在、圖片是否都有 alt。
 * 執行：npm run validate（npm run build 也會先執行它）
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import matter from 'gray-matter'
import type { z } from 'zod'
import {
  frontmatterSchema,
  homeSchema,
  profileSchema,
  projectMetaSchema,
  siteTextSchema,
  type SiteText,
} from '../src/content/schema'

const projectRoot = join(import.meta.dirname, '..')
const contentRoot = join(projectRoot, 'content')
const LANGS = ['zh', 'en'] as const

const errors: string[] = []
const warnings: string[] = []
const rel = (path: string) => relative(projectRoot, path).replaceAll('\\', '/')

// 必須和網站載入圖片的規則一致（src/content/projects.ts、site.ts 的 import.meta.glob）
const isExternal = (path: string) => /^(https?:)?\//.test(path)
const PROJECT_IMAGE = /^(\.\/)?images\/[^/]+$/
const SITE_IMAGE = /^(\.\/)?[^/]+\.(jpg|jpeg|png|webp|svg)$/

/** 回傳圖片路徑的問題描述；沒問題時回傳 null。 */
function projectImageProblem(dir: string, path: string): string | null {
  if (isExternal(path)) return null
  if (!PROJECT_IMAGE.test(path)) return `圖片必須直接放在案例的 images/ 資料夾內（例如 images/cover.jpg），目前是 ${path}`
  if (!existsSync(join(dir, path))) return `找不到圖片 ${path}`
  return null
}

function siteImageProblem(path: string): string | null {
  if (!SITE_IMAGE.test(path)) return `圖片必須直接放在 content/site/，副檔名為小寫的 jpg / jpeg / png / webp / svg，目前是 ${path}`
  if (!existsSync(join(contentRoot, 'site', path))) return `找不到圖片 content/site/${path}`
  return null
}

function readJson(file: string): unknown {
  if (!existsSync(file)) {
    errors.push(`${rel(file)}\n  - 找不到檔案`)
    return undefined
  }
  try {
    return JSON.parse(readFileSync(file, 'utf8'))
  } catch (error) {
    errors.push(`${rel(file)}\n  - JSON 格式錯誤：${(error as Error).message}`)
    return undefined
  }
}

function check<T>(file: string, schema: z.ZodType<T>, data: unknown): T | undefined {
  if (data === undefined) return undefined
  const result = schema.safeParse(data)
  if (result.success) return result.data
  const lines = result.error.issues.map((i) => `  - ${i.path.join('.') || '(root)'}: ${i.message}`)
  errors.push(`${rel(file)}\n${lines.join('\n')}`)
  return undefined
}

// ---- 網站文字、個人資料、首頁卡片 ----
const siteDir = join(contentRoot, 'site')
const siteText: Partial<Record<(typeof LANGS)[number], SiteText>> = {}
for (const lang of LANGS) {
  const file = join(siteDir, `${lang}.json`)
  siteText[lang] = check(file, siteTextSchema, readJson(file))
  for (const [i, job] of (siteText[lang]?.about.experience ?? []).entries()) {
    if (!job.logo) continue
    const problem = siteImageProblem(job.logo)
    if (problem) errors.push(`${rel(file)}\n  - about.experience.${i}.logo: ${problem}`)
    if (!job.logoAlt) errors.push(`${rel(file)}\n  - about.experience.${i}.logoAlt: 有 logo 時必須提供 logoAlt（圖片替代文字）`)
  }
  for (const [i, club] of (siteText[lang]?.about.clubs ?? []).entries()) {
    const problem = siteImageProblem(club.logo)
    if (problem) errors.push(`${rel(file)}\n  - about.clubs.${i}.logo: ${problem}`)
  }
}

const profileFile = join(siteDir, 'profile.json')
const profile = check(profileFile, profileSchema, readJson(profileFile))
const avatarProblem = profile && siteImageProblem(profile.avatar)
if (avatarProblem) errors.push(`${rel(profileFile)}\n  - avatar: ${avatarProblem}`)
if (profile) {
  for (const lang of LANGS) {
    const resume = join(projectRoot, 'public', profile.resume[lang])
    if (!existsSync(resume)) errors.push(`${rel(profileFile)}\n  - resume.${lang}: 找不到 public${profile.resume[lang]}`)
  }
}

const homeFile = join(siteDir, 'home.json')
const home = check(homeFile, homeSchema, readJson(homeFile))
for (const card of home?.cards ?? []) {
  for (const lang of LANGS) {
    const text = siteText[lang]
    if (!text) continue
    if (card.type === 'quote' && !text.quotes[card.index]) {
      errors.push(`${rel(homeFile)}\n  - ${card.id}: ${lang}.json 的 quotes 沒有第 ${card.index} 項（從 0 開始算）`)
    }
    if (card.type === 'stat' && !text.stats[card.index]) {
      errors.push(`${rel(homeFile)}\n  - ${card.id}: ${lang}.json 的 stats 沒有第 ${card.index} 項（從 0 開始算）`)
    }
  }
  const photoProblem = card.type === 'photo' && siteImageProblem(card.src)
  if (photoProblem) errors.push(`${rel(homeFile)}\n  - ${card.id}: ${photoProblem}`)
}

// ---- 案例 ----
const projectsDir = join(contentRoot, 'projects')
let projectCount = 0
for (const slug of readdirSync(projectsDir)) {
  const dir = join(projectsDir, slug)
  if (!statSync(dir).isDirectory()) continue
  if (!slug.startsWith('_')) projectCount++

  const metaFile = join(dir, 'meta.json')
  const meta = check(metaFile, projectMetaSchema, readJson(metaFile))
  const coverProblem = meta?.cover && projectImageProblem(dir, meta.cover)
  if (coverProblem) errors.push(`${rel(metaFile)}\n  - cover: ${coverProblem}`)

  const available = LANGS.filter((lang) => existsSync(join(dir, `${lang}.mdx`)))
  if (available.length === 0) errors.push(`${rel(dir)}\n  - 至少需要 zh.mdx 或 en.mdx 其中一個`)

  for (const lang of LANGS) {
    const file = join(dir, `${lang}.mdx`)
    if (!available.includes(lang)) {
      if (available.length) warnings.push(`${rel(dir)}：尚未提供 ${lang}.mdx（網站會顯示另一種語言的內容）`)
      continue
    }
    let parsed: matter.GrayMatterFile<string>
    try {
      parsed = matter(readFileSync(file, 'utf8'))
    } catch (error) {
      const message = (error as Error).message.split('\n')[0]
      errors.push(`${rel(file)}\n  - frontmatter（最上方 --- 之間）的 YAML 格式錯誤：${message}\n  - 提示：內容含有「: 」或「#」時，請用雙引號把整段文字包起來`)
      continue
    }
    const { data, content } = parsed
    check(file, frontmatterSchema, data)

    for (const [tag, name] of content.matchAll(/<(Figure|Video)\b[^>]*>/g)) {
      if (!/\balt=/.test(tag)) errors.push(`${rel(file)}\n  - <${name}> 缺少 alt：${tag.slice(0, 80)}`)
    }
    // JSX 屬性字串不支援反斜線跳脫：caption="…\"…\"…" 會讓整頁 MDX 編譯失敗
    for (const [attr] of content.matchAll(/\b\w+="[^"\n]*\\"/g)) {
      errors.push(`${rel(file)}\n  - 元件屬性裡不能用 \\" 跳脫引號：${attr.slice(0, 60)}…\n  - 提示：改用中文引號「」或彎引號 “ ”`)
    }
    if (/!\[\]\(/.test(content)) errors.push(`${rel(file)}\n  - Markdown 圖片缺少替代文字，請寫成 ![說明](路徑)`)
    const imagePaths = [
      ...[...content.matchAll(/(?:src|before|after|poster)="([^"]+)"/g)].map((m) => m[1]),
      ...[...content.matchAll(/!\[[^\]]*\]\(([^)\s]+)/g)].map((m) => m[1]),
    ]
    for (const src of imagePaths) {
      const problem = projectImageProblem(dir, src)
      if (problem) errors.push(`${rel(file)}\n  - ${problem}`)
    }
  }
}

for (const warning of warnings) console.warn(`⚠ ${warning}`)
if (errors.length) {
  console.error(`\n✗ 內容驗證失敗（${errors.length} 個問題）：\n\n${errors.join('\n\n')}\n`)
  process.exit(1)
}
console.log(`✓ 內容驗證通過（${projectCount} 個案例）`)
