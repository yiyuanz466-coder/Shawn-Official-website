import type { ReactNode, Ref } from 'react'
import { Link } from 'react-router'
import { useReveal } from '../../hooks/useReveal'
import { cx } from '../../lib/cx'
import type { CardSize, CardTone } from '../../styles/tokens'
import styles from './Card.module.css'

type CardProps = {
  size?: CardSize
  tone?: CardTone
  /** 有值時整張卡片可點擊：站內路徑用 Link，http / mailto 用 <a>。 */
  href?: string
  /** 可點擊卡片的無障礙名稱（卡片內容不足以說明去向時使用）。 */
  label?: string
  className?: string
  children: ReactNode
}

const isExternal = (href: string) => /^(https?:|mailto:)/.test(href)

export function Card({ size = '1x1', tone = 'surface', href, label, className, children }: CardProps) {
  const { ref, shown } = useReveal<HTMLElement>()
  const common = {
    className: cx(styles.card, href && styles.interactive, className),
    'data-size': size,
    'data-tone': tone,
    'data-shown': shown || undefined,
    'aria-label': label,
  }

  if (!href) {
    return (
      <div ref={ref as Ref<HTMLDivElement>} {...common}>
        {children}
      </div>
    )
  }
  if (isExternal(href)) {
    const newTab = href.startsWith('http')
    return (
      <a ref={ref as Ref<HTMLAnchorElement>} href={href} target={newTab ? '_blank' : undefined} rel={newTab ? 'noreferrer' : undefined} {...common}>
        {children}
      </a>
    )
  }
  return (
    <Link ref={ref as Ref<HTMLAnchorElement>} to={href} {...common}>
      {children}
    </Link>
  )
}
