import type { ReactNode } from 'react'
import { cx } from '../../lib/cx'
import styles from './Callout.module.css'

type CalloutProps = { type?: 'insight' | 'note'; title?: string; children: ReactNode }

/** insight：重點洞察、問題陳述；note：補充說明。 */
export function Callout({ type = 'insight', title, children }: CalloutProps) {
  return (
    <aside className={cx(styles.callout, type === 'note' && styles.note)}>
      {title && <p className={styles.title}>{title}</p>}
      <div className={styles.body}>{children}</div>
    </aside>
  )
}
