import Lenis from 'lenis'
import { useEffect, useState } from 'react'
import { readStorage, writeStorage } from '../lib/storage'
import { prefersReducedMotion, useReducedMotion } from './useReducedMotion'

const KEY = 'smooth-scroll'
let lenis: Lenis | null = null

/** 回到頂部：Lenis 開啟時交給 Lenis，否則用原生捲動（減少動態效果時直接跳）。 */
export function scrollToTop() {
  if (lenis) lenis.scrollTo(0)
  else window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
}

/** 捲動到頁內元素（尊重 CSS scroll-margin-top），並用 replaceState 更新網址 hash，避免路由把它當成新的導覽。 */
export function scrollToElement(el: HTMLElement) {
  const offset = parseFloat(getComputedStyle(el).scrollMarginTop) || 0
  if (lenis) lenis.scrollTo(el, { offset: -offset })
  else el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' })
  history.replaceState(history.state, '', `#${el.id}`)
}

/** 平滑捲動開關：預設關閉；系統設定減少動態效果時無法開啟。全站只能有一個使用者（HeaderControls）。 */
export function useSmoothScroll() {
  const reduced = useReducedMotion()
  const [wanted, setWanted] = useState(() => readStorage(KEY) === 'on')
  const enabled = wanted && !reduced

  useEffect(() => {
    if (!enabled) return
    lenis = new Lenis({ autoRaf: true })
    return () => {
      lenis?.destroy()
      lenis = null
    }
  }, [enabled])

  const toggle = () => {
    const next = !wanted
    writeStorage(KEY, next ? 'on' : 'off')
    setWanted(next)
  }

  return { enabled, available: !reduced, toggle }
}
