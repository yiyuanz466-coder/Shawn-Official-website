import type { ReactNode } from 'react'
import styles from './BentoGrid.module.css'

/** Bento 卡片牆：桌機 4 欄、平板 2 欄、手機 1 欄；子元素通常是 <Card>。 */
export function BentoGrid({ children }: { children: ReactNode }) {
  return <div className={styles.grid}>{children}</div>
}
