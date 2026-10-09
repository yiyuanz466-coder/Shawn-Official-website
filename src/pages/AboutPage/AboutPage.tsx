import { getProfile, getSiteAsset, getSiteText } from '../../content/site'
import { useDocumentMeta } from '../../hooks/useDocumentMeta'
import { useI18n } from '../../i18n/useI18n'
import { cx } from '../../lib/cx'
import { ButtonLink } from '../../ui/Button/Button'
import styles from './AboutPage.module.css'

export function AboutPage() {
  const { lang, t } = useI18n()
  const { about } = getSiteText(lang)
  const profile = getProfile()
  const avatar = getSiteAsset(profile.avatar)
  useDocumentMeta({ title: t.about.title })

  return (
    <div className={cx('container', styles.page)}>
      <header className={styles.header}>
        {avatar && <img className={styles.avatar} src={avatar} alt={profile.name} width={112} height={112} />}
        <div>
          <p className={styles.eyebrow}>{t.about.title}</p>
          <h1 className={styles.heading}>{about.heading}</h1>
        </div>
      </header>

      <div className={styles.body}>
        {about.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>

      <section className={styles.section} aria-labelledby="about-experience">
        <h2 id="about-experience" className={styles.sectionTitle}>
          {t.about.experience}
        </h2>
        <ol className={styles.timeline}>
          {about.experience.map((item) => (
            <li key={`${item.org}-${item.role}`} className={styles.item}>
              <span className={styles.period}>{item.period}</span>
              <div className={styles.withLogo}>
                {item.logo ? (
                  <img className={styles.logo} src={getSiteAsset(item.logo)} alt={item.logoAlt ?? ''} width={56} height={56} loading="lazy" />
                ) : (
                  <span className={styles.logo} aria-hidden="true" />
                )}
                <div>
                  <h3 className={styles.itemTitle}>{item.role}</h3>
                  <p className={styles.itemOrg}>{item.org}</p>
                  <p className={styles.itemDesc}>{item.description}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {about.clubs.length > 0 && (
        <section className={styles.section} aria-labelledby="about-clubs">
          <h2 id="about-clubs" className={styles.sectionTitle}>
            {t.about.clubs}
          </h2>
          <ul className={styles.clubs}>
            {about.clubs.map((club) => (
              <li key={club.name} className={styles.club}>
                <img className={styles.clubLogo} src={getSiteAsset(club.logo)} alt={club.logoAlt} width={72} height={72} loading="lazy" />
                <div>
                  <h3 className={styles.itemTitle}>{club.name}</h3>
                  <p className={styles.itemDesc}>{club.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className={styles.section} aria-labelledby="about-education">
        <h2 id="about-education" className={styles.sectionTitle}>
          {t.about.education}
        </h2>
        <ol className={styles.timeline}>
          {about.education.map((item) => (
            <li key={`${item.school}-${item.degree}`} className={styles.item}>
              <span className={styles.period}>{item.period}</span>
              <h3 className={styles.itemTitle}>
                {item.school} · {item.degree}
              </h3>
            </li>
          ))}
        </ol>
      </section>

      <div className={styles.actions}>
        <ButtonLink href={profile.resume[lang]} download icon="download">
          {t.about.resume}
        </ButtonLink>
        <ButtonLink href={`mailto:${profile.email}`} variant="secondary" icon="mail">
          {t.about.contact}
        </ButtonLink>
      </div>
    </div>
  )
}
