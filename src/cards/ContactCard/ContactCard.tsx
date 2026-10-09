import { cx } from '../../lib/cx'
import type { CardSize } from '../../styles/tokens'
import { Card } from '../../ui/Card/Card'
import { Icon } from '../../ui/Icon/Icon'
import styles from './ContactCard.module.css'

type ContactCardProps = { size: CardSize; kind: 'email' | 'linkedin'; href: string; label: string }

export function ContactCard({ size, kind, href, label }: ContactCardProps) {
  return (
    <Card size={size} href={href} className={styles.card}>
      <span className={cx(styles.icon, styles[kind])}>
        <Icon name={kind === 'email' ? 'mail' : 'linkedin'} size={32} />
      </span>
      <span className={styles.label}>{label}</span>
    </Card>
  )
}
