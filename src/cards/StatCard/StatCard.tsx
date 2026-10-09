import type { CardSize, CardTone } from '../../styles/tokens'
import { Card } from '../../ui/Card/Card'
import styles from './StatCard.module.css'

type StatCardProps = { size: CardSize; tone: CardTone; value: string; label: string }

export function StatCard({ size, tone, value, label }: StatCardProps) {
  return (
    <Card size={size} tone={tone} className={styles.card}>
      <p className={styles.value}>{value}</p>
      <p className={styles.label}>{label}</p>
    </Card>
  )
}
