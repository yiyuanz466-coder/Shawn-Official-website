import type { CardSize } from '../../styles/tokens'
import { Card } from '../../ui/Card/Card'
import { Icon } from '../../ui/Icon/Icon'
import styles from './IntroCard.module.css'

type IntroCardProps = {
  size: CardSize
  href: string
  avatar?: string
  name: string
  greeting: string
  body: string
  cta: string
}

export function IntroCard({ size, href, avatar, name, greeting, body, cta }: IntroCardProps) {
  return (
    <Card size={size} href={href} className={styles.card}>
      {avatar && <img className={styles.avatar} src={avatar} alt={name} width={160} height={160} />}
      <div className={styles.text}>
        <p className={styles.greeting}>{greeting}</p>
        <p className={styles.body}>{body}</p>
        <span className={styles.cta}>
          {cta} <Icon name="arrowRight" size={16} />
        </span>
      </div>
    </Card>
  )
}
