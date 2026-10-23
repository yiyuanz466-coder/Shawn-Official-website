import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { getSiteAsset } from '../../content/site'
import { parseFilter } from '../../content/wall'
import { useI18n } from '../../i18n/useI18n'
import { Icon } from '../../ui/Icon/Icon'
import { FilterNav } from '../FilterNav/FilterNav'
import { HeaderControls } from '../HeaderControls/HeaderControls'
import styles from './SiteHeader.module.css'

export function SiteHeader() {
  const { lang, t } = useI18n()
  const { pathname, search } = useLocation()
  const [open, setOpen] = useState(false)

  const isHome = pathname.replace(/\/$/, '') === `/${lang}`
  const activeFilter = isHome ? parseFilter(new URLSearchParams(search).get('filter')) : null

  useEffect(() => setOpen(false), [pathname, search])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to={`/${lang}`} className={styles.logo} aria-label={t.header.home}>
          <img src={getSiteAsset('logo.png')} alt="" className={styles.logoImage} />
        </Link>
        <div className={styles.nav}>
          <FilterNav active={activeFilter} />
        </div>
        <button type="button" className={styles.menuButton} aria-expanded={open} aria-controls="site-controls" onClick={() => setOpen((v) => !v)}>
          <Icon name={open ? 'close' : 'sliders'} />
          <span className="visually-hidden">{t.header.settings}</span>
        </button>
        <div id="site-controls" className={styles.controls} data-open={open || undefined}>
          <HeaderControls />
        </div>
      </div>
    </header>
  )
}
