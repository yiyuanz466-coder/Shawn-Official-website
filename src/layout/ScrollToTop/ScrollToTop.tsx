import { useEffect, useState } from 'react'
import { scrollToTop } from '../../hooks/useSmoothScroll'
import { useI18n } from '../../i18n/useI18n'
import { cx } from '../../lib/cx'
import { Icon } from '../../ui/Icon/Icon'
import styles from './ScrollToTop.module.css'

export function ScrollToTop() {
  const { t } = useI18n()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <button type="button" className={cx(styles.button, visible && styles.visible)} onClick={scrollToTop} aria-label={t.scrollTop} tabIndex={visible ? 0 : -1} aria-hidden={!visible}>
      <Icon name="arrowUp" />
    </button>
  )
}
