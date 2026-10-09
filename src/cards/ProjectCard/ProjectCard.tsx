import type { CardSize, CardTone } from '../../styles/tokens'
import { Card } from '../../ui/Card/Card'
import { Icon } from '../../ui/Icon/Icon'
import { Tag } from '../../ui/Tag/Tag'
import styles from './ProjectCard.module.css'

type ProjectCardProps = {
  size: CardSize
  tone: CardTone
  href: string
  title: string
  summary: string
  year: number
  tags: string[]
  cover?: string
  coverAlt: string
  locked: boolean
  lockedLabel: string
}

export function ProjectCard({ size, tone, href, title, summary, year, tags, cover, coverAlt, locked, lockedLabel }: ProjectCardProps) {
  return (
    <Card size={size} tone={tone} href={href} className={styles.card}>
      {cover ? (
        <img className={styles.cover} src={cover} alt={coverAlt} loading="lazy" decoding="async" />
      ) : (
        <span className={styles.placeholderTitle} aria-hidden="true">
          {title}
        </span>
      )}
      <div className={styles.info}>
        <div className={styles.meta}>
          <Tag tone="onTone">{year}</Tag>
          {locked && (
            <span className={styles.lock}>
              <Icon name="lock" size={14} /> {lockedLabel}
            </span>
          )}
          <span className={styles.extraTags}>
            {tags.slice(0, 2).map((tag) => (
              <Tag key={tag} tone="onTone">
                {tag}
              </Tag>
            ))}
          </span>
        </div>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.summary}>{summary}</p>
      </div>
    </Card>
  )
}
