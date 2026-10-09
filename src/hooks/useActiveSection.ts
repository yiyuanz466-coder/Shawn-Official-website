import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * 回傳目前在畫面上方區域（sticky header 下緣到視窗 35% 之間）的章節 id，用於目錄高亮。
 * pin(id)：使用者點目錄時直接指定，並在捲動動畫期間忽略自動偵測。
 */
export function useActiveSection(ids: string[]) {
  const [active, setActive] = useState<string | null>(null)
  const pinnedUntil = useRef(0)
  const key = ids.join('|')

  const pin = useCallback((id: string) => {
    pinnedUntil.current = Date.now() + 1200
    setActive(id)
  }, [])

  useEffect(() => {
    const elements = key
      .split('|')
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)
    if (!elements.length) return

    const update = (id: string) => {
      if (Date.now() > pinnedUntil.current) setActive(id)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) update(visible[0].target.id)
      },
      // 上緣略低於 header（標題捲動後停在 header + 24px 的位置，要落在偵測區內）
      { rootMargin: '-88px 0px -65% 0px' },
    )
    elements.forEach((el) => observer.observe(el))

    // 最後一節通常捲不到偵測區：捲到頁面底部時直接視為最後一節
    const last = elements[elements.length - 1]
    const onScroll = () => {
      const atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4
      if (atBottom && last.getBoundingClientRect().top < window.innerHeight) update(last.id)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
  }, [key])

  return { activeId: active, pin }
}
