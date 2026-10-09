import type { CardSize } from '../../styles/tokens'
import { Card } from '../../ui/Card/Card'
import styles from './PhotoCard.module.css'

export function PhotoCard({ size, src, alt }: { size: CardSize; src?: string; alt: string }) {
  return (
    <Card size={size} className={styles.card}>
      {src && <img className={styles.image} src={src} alt={alt} loading="lazy" decoding="async" />}
    </Card>
  )
}
