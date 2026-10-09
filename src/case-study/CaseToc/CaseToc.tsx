import type { MouseEvent } from 'react'
import { scrollToElement } from '../../hooks/useSmoothScroll'
import { useI18n } from '../../i18n/useI18n'
import styles from './CaseToc.module.css'

export type Heading = { id: string; text: string }

type CaseTocProps = {
  headings: Heading[]
  activeId: string | null
  /** 點擊目錄項目時通知上層（用來立即高亮該項目） */
  onJump: (id: string) => void
}

/** 桌機（≥1024px）左側、跟著捲動的章節目錄；手機隱藏，改用 ReadingProgress。 */
export function CaseToc({ headings, activeId, onJump }: CaseTocProps) {
  const { t } = useI18n()
  if (!headings.length) return <div />

  const jump = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    const target = document.getElementById(id)
    if (!target) return
    event.preventDefault()
    onJump(id)
    scrollToElement(target)
  }

  return (
    <nav className={styles.toc} aria-label={t.case.toc}>
      <p className={styles.heading}>{t.case.toc}</p>
      <ol className={styles.list}>
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              className={styles.link}
              href={`#${heading.id}`}
              aria-current={activeId === heading.id ? 'location' : undefined}
              onClick={(event) => jump(event, heading.id)}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
