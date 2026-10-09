import { useEffect } from 'react'
import { Navigate, Outlet, ScrollRestoration, useParams } from 'react-router'
import { detectLang, HTML_LANG, isLang } from '../../i18n/langs'
import { useI18n } from '../../i18n/useI18n'
import { Footer } from '../Footer/Footer'
import { ScrollToTop } from '../ScrollToTop/ScrollToTop'
import { SiteHeader } from '../SiteHeader/SiteHeader'

export function LangLayout() {
  const { lang } = useParams()
  const { t } = useI18n()

  useEffect(() => {
    if (isLang(lang)) document.documentElement.lang = HTML_LANG[lang]
  }, [lang])

  if (!isLang(lang)) return <Navigate to={`/${detectLang()}/404`} replace />

  return (
    <>
      <a href="#main" className="skip-link">
        {t.a11y.skip}
      </a>
      <SiteHeader />
      <main id="main" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
      <ScrollToTop />
      {/* 整頁載入時 location.key 都是 "default"：改用路徑當 key，避免不同網址共用同一個捲動位置 */}
      <ScrollRestoration getKey={(location) => (location.key === 'default' ? location.pathname : location.key)} />
    </>
  )
}
