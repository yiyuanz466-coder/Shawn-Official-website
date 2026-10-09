import { useProjectAsset } from '../../content/ProjectContext'
import { useI18n } from '../../i18n/useI18n'
import { cx } from '../../lib/cx'
import styles from './Figure.module.css'

type FigureProps = {
  /** 相對於案例資料夾的路徑，例如 "images/flow.jpg"；省略或找不到時顯示「待補圖片」框 */
  src?: string
  alt: string
  caption?: string
  /** 在內文欄中使用最大寬度（超過 720px） */
  wide?: boolean
  /** 固定長寬比，例如 "16 / 9"（圖片會裁切填滿） */
  ratio?: string
}

export function Figure({ src, alt, caption, wide, ratio }: FigureProps) {
  const { t } = useI18n()
  const url = useProjectAsset(src)
  return (
    <figure className={styles.figure} data-wide={wide || undefined}>
      {url ? (
        <img className={cx(styles.image, ratio && styles.fixed)} style={ratio ? { aspectRatio: ratio } : undefined} src={url} alt={alt} loading="lazy" decoding="async" />
      ) : (
        <div className={styles.placeholder} role="img" aria-label={alt}>
          {t.case.placeholderImage}
          {src ? `：${src}` : ''}
        </div>
      )}
      {caption && <figcaption className={styles.caption}>{caption}</figcaption>}
    </figure>
  )
}
