import { Link } from 'react-router'
import type { Frontmatter, ProjectMeta } from '../../content/schema'
import { useI18n } from '../../i18n/useI18n'
import { Icon } from '../../ui/Icon/Icon'
import { Tag } from '../../ui/Tag/Tag'
import { MetricRow } from '../MetricRow/MetricRow'
import styles from './CaseHero.module.css'

type CaseHeroProps = { frontmatter: Frontmatter; meta: ProjectMeta; cover?: string; coverAlt: string }

/** 案例開頭的 TL;DR：讓讀者 30 秒內知道角色、時程、成果。 */
export function CaseHero({ frontmatter, meta, cover, coverAlt }: CaseHeroProps) {
  const { lang, t } = useI18n()
  const facts = [
    { label: t.case.role, value: frontmatter.role },
    { label: t.case.timeline, value: frontmatter.timeline },
    frontmatter.team ? { label: t.case.team, value: frontmatter.team } : null,
    frontmatter.tools.length ? { label: t.case.tools, value: frontmatter.tools.join(', ') } : null,
  ].filter((fact): fact is { label: string; value: string } => fact !== null)

  return (
    <header className={styles.hero}>
      <Link to={`/${lang}?filter=work`} className={styles.back}>
        <Icon name="arrowLeft" size={16} /> {t.case.back}
      </Link>
      <div className={styles.tags}>
        <Tag>{meta.year}</Tag>
        {meta.tags.map((tag) => (
          <Tag key={tag}>{tag}</Tag>
        ))}
      </div>
      <h1 className={styles.title}>{frontmatter.title}</h1>
      <p className={styles.summary}>{frontmatter.summary}</p>
      <dl className={styles.facts}>
        {facts.map((fact) => (
          <div key={fact.label} className={styles.fact}>
            <dt>{fact.label}</dt>
            <dd>{fact.value}</dd>
          </div>
        ))}
      </dl>
      {frontmatter.highlights.length > 0 && <MetricRow items={frontmatter.highlights} label={t.case.highlights} />}
      <div className={styles.cover} data-tone={meta.cardTone}>
        {cover ? (
          <img className={styles.coverImage} src={cover} alt={coverAlt} />
        ) : (
          <span className={styles.coverTitle} aria-hidden="true">
            {frontmatter.title}
          </span>
        )}
      </div>
    </header>
  )
}
