import type { ComponentType } from 'react'
import type { MDXProps } from 'mdx/types'
import { LANGS, type Lang } from '../i18n/langs'
import { ContentError, formatIssues } from './errors'
import { frontmatterSchema, projectMetaSchema, type Frontmatter, type ProjectMeta } from './schema'

const metaFiles = import.meta.glob<unknown>('/content/projects/*/meta.json', { eager: true, import: 'default' })
const frontmatterFiles = import.meta.glob<unknown>('/content/projects/*/*.mdx', {
  eager: true,
  import: 'frontmatter',
})
const bodyFiles = import.meta.glob<{ default: ComponentType<MDXProps> }>('/content/projects/*/*.mdx')
const assetFiles = import.meta.glob<string>('/content/projects/*/images/*', {
  eager: true,
  import: 'default',
  query: '?url',
})

export type Project = {
  slug: string
  meta: ProjectMeta
  content: Partial<Record<Lang, Frontmatter>>
}

/** '/content/projects/<slug>/meta.json' → '<slug>' */
const slugOf = (file: string) => file.split('/')[3]

let cache: Project[] | null = null

export function getProjects(): Project[] {
  if (cache) return cache
  const errors: string[] = []
  const projects: Project[] = []

  for (const [file, raw] of Object.entries(metaFiles)) {
    const slug = slugOf(file)
    if (slug.startsWith('_')) continue // _template 等範本資料夾不上線

    const meta = projectMetaSchema.safeParse(raw)
    if (!meta.success) {
      errors.push(formatIssues(file, meta.error))
      continue
    }

    const content: Project['content'] = {}
    for (const lang of LANGS) {
      const mdxFile = `/content/projects/${slug}/${lang}.mdx`
      if (!(mdxFile in frontmatterFiles)) continue
      const frontmatter = frontmatterSchema.safeParse(frontmatterFiles[mdxFile])
      if (frontmatter.success) content[lang] = frontmatter.data
      else errors.push(formatIssues(mdxFile, frontmatter.error))
    }
    if (Object.keys(content).length === 0 && !errors.length) {
      errors.push(`/content/projects/${slug}/\n  - 至少需要 zh.mdx 或 en.mdx 其中一個`)
    }
    projects.push({ slug, meta: meta.data, content })
  }

  if (errors.length) throw new ContentError(`內容驗證失敗：\n\n${errors.join('\n\n')}`)
  cache = projects.sort((a, b) => a.meta.order - b.meta.order)
  return cache
}

export function getProject(slug: string): Project | undefined {
  return getProjects().find((project) => project.slug === slug)
}

/** 取得指定語言的內容；該語言尚未撰寫時改用另一個語言，並標記 isFallback。 */
export function resolveLang(project: Project, lang: Lang) {
  const own = project.content[lang]
  if (own) return { lang, frontmatter: own, isFallback: false }
  const other = LANGS.find((l) => project.content[l])!
  return { lang: other, frontmatter: project.content[other]!, isFallback: true }
}

export function loadBody(slug: string, lang: Lang) {
  return bodyFiles[`/content/projects/${slug}/${lang}.mdx`]()
}

/** 把案例內的相對路徑（例如 "images/cover.jpg"）轉成可用的網址；絕對路徑或外部網址原樣回傳。 */
export function resolveAsset(slug: string, path?: string): string | undefined {
  if (!path) return undefined
  if (/^(https?:)?\//.test(path)) return path
  return assetFiles[`/content/projects/${slug}/${path.replace(/^\.\//, '')}`]
}

export function getNextProject(slug: string): Project | undefined {
  const list = getProjects()
  if (list.length < 2) return undefined
  const index = list.findIndex((project) => project.slug === slug)
  return list[(index + 1) % list.length]
}
