import { FILTERS, type Filter } from '../../content/wall'
import { useI18n } from '../../i18n/useI18n'
import { Pill } from '../../ui/Pill/Pill'
import styles from './FilterNav.module.css'

/** 首頁卡片篩選。active 為 null 表示不在首頁（連結會帶使用者回首頁並套用篩選）。 */
export function FilterNav({ active }: { active: Filter | null }) {
  const { lang, t } = useI18n()
  return (
    <nav className={styles.nav} aria-label={t.nav.label}>
      <ul className={styles.list}>
        {FILTERS.map((filter) => (
          <li key={filter}>
            <Pill to={filter === 'all' ? `/${lang}` : `/${lang}?filter=${filter}`} active={active === filter}>
              {t.nav[filter]}
            </Pill>
          </li>
        ))}
      </ul>
    </nav>
  )
}
