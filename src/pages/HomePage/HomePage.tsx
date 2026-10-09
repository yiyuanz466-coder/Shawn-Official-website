import { useSearchParams } from 'react-router'
import { getProjects } from '../../content/projects'
import { getHomeCards, getSiteText } from '../../content/site'
import { buildWall, categoryOf, keyOf, parseFilter } from '../../content/wall'
import { useDocumentMeta } from '../../hooks/useDocumentMeta'
import { useI18n } from '../../i18n/useI18n'
import { BentoGrid } from '../../layout/BentoGrid/BentoGrid'
import { cx } from '../../lib/cx'
import styles from './HomePage.module.css'
import { WallCard } from './WallCard'

export function HomePage() {
  const { lang, t } = useI18n()
  const [params] = useSearchParams()
  const filter = parseFilter(params.get('filter'))
  const site = getSiteText(lang)
  useDocumentMeta()

  const items = buildWall(getProjects(), getHomeCards()).filter(
    (item) => filter === 'all' || categoryOf(item) === filter,
  )

  return (
    <div className={cx('container', styles.page)}>
      <h1 className="visually-hidden">{site.meta.title}</h1>
      {items.length === 0 ? (
        <p className={styles.empty}>{t.home.empty}</p>
      ) : (
        // key 綁定篩選條件：切換時整組重新掛載，播放一次進場動畫
        <BentoGrid key={filter}>
          {items.map((item) => (
            <WallCard key={keyOf(item)} item={item} />
          ))}
        </BentoGrid>
      )}
    </div>
  )
}
