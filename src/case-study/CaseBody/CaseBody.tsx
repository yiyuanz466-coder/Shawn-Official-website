import { useEffect, useRef, useState, type ComponentType } from 'react'
import type { MDXProps } from 'mdx/types'
import { useActiveSection } from '../../hooks/useActiveSection'
import { CaseToc, type Heading } from '../CaseToc/CaseToc'
import { mdxComponents } from '../mdxComponents'
import styles from './CaseBody.module.css'
import prose from './Prose.module.css'

/** 必須放在 <Suspense> 內：掛載時 MDX 已載入完成，才能讀出 h2 產生目錄。 */
export function CaseBody({ Body }: { Body: ComponentType<MDXProps> }) {
  const ref = useRef<HTMLDivElement>(null)
  const [headings, setHeadings] = useState<Heading[]>([])

  useEffect(() => {
    const nodes = ref.current?.querySelectorAll<HTMLHeadingElement>('h2[id]') ?? []
    setHeadings([...nodes].map((node) => ({ id: node.id, text: node.textContent ?? '' })))

    // 分享的章節連結（#成果）：內文是 lazy 載入，路由捲動時標題還不存在，所以在這裡補捲。
    // 下一個 frame 再捲（讓路由的捲動還原先跑完），字體載入完成後再對齊一次（避免版面位移）。
    const hash = decodeURIComponent(window.location.hash.slice(1))
    const target = hash ? document.getElementById(hash) : null
    if (!target || !ref.current?.contains(target)) return
    let cancelled = false
    const jump = () => !cancelled && target.scrollIntoView({ block: 'start' })
    const frame = requestAnimationFrame(jump)
    document.fonts?.ready.then(jump)
    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
    }
  }, [Body])

  const { activeId, pin } = useActiveSection(headings.map((heading) => heading.id))

  return (
    <div className={styles.layout}>
      <CaseToc headings={headings} activeId={activeId} onJump={pin} />
      <div ref={ref} className={prose.prose}>
        <Body components={mdxComponents} />
      </div>
    </div>
  )
}
