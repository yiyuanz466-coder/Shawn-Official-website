import type { ReactNode } from 'react'
import type { CardSize } from '../../styles/tokens'
import { Card } from '../../ui/Card/Card'
import { Icon } from '../../ui/Icon/Icon'
import styles from './QuoteCard.module.css'

/** 把 "**強調**" 轉成強調色文字，其他部分保持原樣。 */
export function renderEmphasis(text: string): ReactNode[] {
  return text.split(/\*\*(.+?)\*\*/g).map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className={styles.highlight}>
        {part}
      </strong>
    ) : (
      part
    ),
  )
}

export function QuoteCard({ size, text, label }: { size: CardSize; text: string; label: string }) {
  return (
    <Card size={size} className={styles.card}>
      <span className={styles.mark}>
        <Icon name="quote" size={28} />
      </span>
      <blockquote className={styles.text}>{renderEmphasis(text)}</blockquote>
      <p className={styles.label}>{label}</p>
    </Card>
  )
}
