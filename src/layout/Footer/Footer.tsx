import { Link } from 'react-router'
import { getProfile } from '../../content/site'
import { useI18n } from '../../i18n/useI18n'
import { cx } from '../../lib/cx'
import styles from './Footer.module.css'

export function Footer() {
  const { lang, t } = useI18n()
  const profile = getProfile()
  return (
    <footer className={styles.footer}>
      <div className={cx('container', styles.inner)}>
        <p>
          © {new Date().getFullYear()} {profile.name}. {t.footer.rights}.
        </p>
        <ul className={styles.links}>
          <li>
            <a href={`mailto:${profile.email}`}>Email</a>
          </li>
          <li>
            <a href={profile.linkedin} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
          </li>
          <li>
            <Link to={`/${lang}/design-system`}>{t.footer.designSystem}</Link>
          </li>
        </ul>
      </div>
    </footer>
  )
}
