import { useRouteError } from 'react-router'
import { useI18n } from '../../i18n/useI18n'
import { cx } from '../../lib/cx'
import styles from './RouteError.module.css'

/** 路由層級的錯誤畫面。開發模式下會顯示完整訊息（例如內容驗證失敗的檔案與欄位）。 */
export function RouteError() {
  const error = useRouteError()
  const { t } = useI18n()
  const message = error instanceof Error ? error.message : String(error)
  return (
    <div className={cx('container', styles.page)} role="alert">
      <h1 className={styles.title}>{t.error.title}</h1>
      <p className={styles.desc}>{t.error.desc}</p>
      {import.meta.env.DEV && <pre className={styles.details}>{message}</pre>}
    </div>
  )
}
