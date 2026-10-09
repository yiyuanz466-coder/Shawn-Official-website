import type { ReactNode } from 'react'
import { cx } from '../../lib/cx'
import styles from './Tag.module.css'

/** tone="onTone" 用於彩色卡片上（跟著 --tone-fg 變色）。 */
export function Tag({ children, tone = 'default' }: { children: ReactNode; tone?: 'default' | 'onTone' }) {
  return <span className={cx(styles.tag, styles[tone])}>{children}</span>
}
