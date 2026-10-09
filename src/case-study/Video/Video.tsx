import type { CSSProperties } from 'react'
import { useProjectAsset } from '../../content/ProjectContext'
import { Figure } from '../Figure/Figure'
import styles from './Video.module.css'

type VideoProps = {
  /** 相對於案例資料夾的路徑，例如 "images/demo.mp4"（建議先壓縮到 10 MB 以內） */
  src: string
  /** 播放前顯示的封面影格 */
  poster?: string
  /** 影片內容的文字說明（給螢幕閱讀器，也是找不到影片時的替代文字） */
  alt: string
  caption?: string
  wide?: boolean
  /** 長寬比，預設 "16 / 9" */
  ratio?: string
}

/** 案例中的示範影片：不自動播放，使用者按下才播放，只預先載入影片資訊。 */
export function Video({ src, poster, alt, caption, wide, ratio }: VideoProps) {
  const url = useProjectAsset(src)
  const posterUrl = useProjectAsset(poster)
  if (!url) return <Figure src={src} alt={alt} caption={caption} wide={wide} />

  return (
    <figure className={styles.figure} data-wide={wide || undefined}>
      <video
        className={styles.video}
        style={ratio ? ({ '--video-ratio': ratio } as CSSProperties) : undefined}
        src={url}
        poster={posterUrl}
        controls
        playsInline
        preload="metadata"
        aria-label={alt}
      />
      {caption && <figcaption className={styles.caption}>{caption}</figcaption>}
    </figure>
  )
}
