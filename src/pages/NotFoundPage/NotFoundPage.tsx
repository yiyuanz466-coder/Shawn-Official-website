import { useDocumentMeta } from '../../hooks/useDocumentMeta'
import { useI18n } from '../../i18n/useI18n'
import { cx } from '../../lib/cx'
import { ButtonLink } from '../../ui/Button/Button'
import styles from './NotFoundPage.module.css'

export function NotFoundPage() {
  const { lang, t } = useI18n()
  useDocumentMeta({ title: t.notFound.title })
  return (
    <div className={cx('container', styles.page)}>
      <p className={styles.code} aria-hidden="true">404</p>
      <h1 className={styles.title}>{t.notFound.title}</h1>
      <p className={styles.desc}>{t.notFound.desc}</p>
      <ButtonLink className={styles.back} to={`/${lang}`} icon="arrowLeft">
        {t.notFound.back}
      </ButtonLink>
    </div>
  )
}
