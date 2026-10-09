import { createContext, useContext, type ReactNode } from 'react'
import { resolveAsset } from './projects'

const ProjectSlugContext = createContext('')

/** 讓案例 MDX 裡的元件知道目前是哪個案例，才能解析 "images/x.jpg" 這類相對路徑。 */
export function ProjectProvider({ slug, children }: { slug: string; children: ReactNode }) {
  return <ProjectSlugContext.Provider value={slug}>{children}</ProjectSlugContext.Provider>
}

export function useProjectAsset(src?: string): string | undefined {
  const slug = useContext(ProjectSlugContext)
  if (slug) return resolveAsset(slug, src)
  return src && /^(https?:)?\//.test(src) ? src : undefined
}
