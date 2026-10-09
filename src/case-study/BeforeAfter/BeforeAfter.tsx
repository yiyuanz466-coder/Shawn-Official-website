import { useI18n } from '../../i18n/useI18n'
import { Figure } from '../Figure/Figure'
import styles from './BeforeAfter.module.css'

type BeforeAfterProps = { before?: string; after?: string; beforeAlt: string; afterAlt: string; caption?: string }

export function BeforeAfter({ before, after, beforeAlt, afterAlt, caption }: BeforeAfterProps) {
  const { t } = useI18n()
  return (
    <figure className={styles.wrapper} data-wide>
      <div className={styles.grid}>
        <div className={styles.side}>
          <span className={styles.label}>{t.case.before}</span>
          <Figure src={before} alt={beforeAlt} />
        </div>
        <div className={styles.side}>
          <span className={styles.label}>{t.case.after}</span>
          <Figure src={after} alt={afterAlt} />
        </div>
      </div>
      {caption && <figcaption className={styles.caption}>{caption}</figcaption>}
    </figure>
  )
}
