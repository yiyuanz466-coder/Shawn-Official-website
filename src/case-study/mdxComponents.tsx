import type { ImgHTMLAttributes } from 'react'
import type { MDXComponents } from 'mdx/types'
import { useProjectAsset } from '../content/ProjectContext'
import { BeforeAfter } from './BeforeAfter/BeforeAfter'
import { Callout } from './Callout/Callout'
import { Figure } from './Figure/Figure'
import { MetricRow } from './MetricRow/MetricRow'
import { Video } from './Video/Video'

/** Markdown 圖片 ![說明](images/x.jpg) 也支援相對路徑。 */
function MarkdownImage({ src, alt = '', ...rest }: ImgHTMLAttributes<HTMLImageElement>) {
  const url = useProjectAsset(typeof src === 'string' ? src : undefined)
  return <img {...rest} src={url ?? (typeof src === 'string' ? src : undefined)} alt={alt} loading="lazy" decoding="async" />
}

export const mdxComponents: MDXComponents = {
  Figure,
  BeforeAfter,
  MetricRow,
  Callout,
  Video,
  img: MarkdownImage,
}
