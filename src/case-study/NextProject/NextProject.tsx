import { Link } from 'react-router'
import type { CardTone } from '../../styles/tokens'
import { Icon } from '../../ui/Icon/Icon'
import styles from './NextProject.module.css'

type NextProjectProps = { to: string; label: string; title: string; tone: CardTone }

export function NextProject({ to, label, title, tone }: NextProjectProps) {
  return (
    <Link to={to} className={styles.next} data-tone={tone}>
      <div>
        <p className={styles.label}>{label}</p>
        <p className={styles.title}>{title}</p>
      </div>
      <span className={styles.arrow}>
        <Icon name="arrowRight" />
      </span>
    </Link>
  )
}
