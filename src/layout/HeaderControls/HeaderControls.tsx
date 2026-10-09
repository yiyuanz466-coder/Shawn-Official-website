import { useLocation } from 'react-router'
import { useSmoothScroll } from '../../hooks/useSmoothScroll'
import { useTheme } from '../../hooks/useTheme'
import { LANG_STORAGE_KEY } from '../../i18n/langs'
import { useI18n } from '../../i18n/useI18n'
import { writeStorage } from '../../lib/storage'
import { Pill } from '../../ui/Pill/Pill'

/** 平滑捲動、語言、主題三個設定。全站只渲染一次（桌機橫排，手機放在下拉面板裡）。 */
export function HeaderControls() {
  const { lang, t } = useI18n()
  const { pathname, search } = useLocation()
  const { theme, toggle: toggleTheme } = useTheme()
  const smooth = useSmoothScroll()

  const otherLang = lang === 'zh' ? 'en' : 'zh'
  const otherPath = `/${otherLang}${pathname.slice(lang.length + 1)}${search}`

  return (
    <>
      <Pill
        variant="outlined"
        icon="wave"
        aria-pressed={smooth.enabled}
        onClick={smooth.toggle}
        disabled={!smooth.available}
        title={smooth.available ? undefined : t.header.smoothScrollUnavailable}
      >
        {t.header.smoothScroll}
      </Pill>
      <Pill variant="outlined" icon="globe" to={otherPath} aria-label={t.header.switchLang} onClick={() => writeStorage(LANG_STORAGE_KEY, otherLang)}>
        {t.header.langLabel}
      </Pill>
      <Pill variant="outlined" icon={theme === 'dark' ? 'moon' : 'sun'} onClick={toggleTheme} aria-label={theme === 'dark' ? t.header.toLight : t.header.toDark}>
        {theme === 'dark' ? t.header.themeDark : t.header.themeLight}
      </Pill>
    </>
  )
}
