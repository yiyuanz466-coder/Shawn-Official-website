import { ContactCard } from '../../cards/ContactCard/ContactCard'
import { IntroCard } from '../../cards/IntroCard/IntroCard'
import { PhotoCard } from '../../cards/PhotoCard/PhotoCard'
import { ProjectCard } from '../../cards/ProjectCard/ProjectCard'
import { QuoteCard } from '../../cards/QuoteCard/QuoteCard'
import { StatCard } from '../../cards/StatCard/StatCard'
import { resolveAsset, resolveLang } from '../../content/projects'
import { getProfile, getSiteAsset, getSiteText } from '../../content/site'
import type { WallItem } from '../../content/wall'
import { useI18n } from '../../i18n/useI18n'

/** 把首頁卡片牆的一個項目（作品或 home.json 卡片）轉成對應的卡片元件。 */
export function WallCard({ item }: { item: WallItem }) {
  const { lang, t } = useI18n()

  if (item.kind === 'project') {
    const { project } = item
    const { frontmatter } = resolveLang(project, lang)
    return (
      <ProjectCard
        size={project.meta.cardSize}
        tone={project.meta.cardTone}
        href={`/${lang}/work/${project.slug}`}
        title={frontmatter.title}
        summary={frontmatter.summary}
        year={project.meta.year}
        tags={project.meta.tags}
        cover={resolveAsset(project.slug, project.meta.cover)}
        coverAlt={project.meta.coverAlt?.[lang] ?? ''}
        locked={project.meta.protected}
        lockedLabel={t.card.protected}
      />
    )
  }

  const { card } = item
  const site = getSiteText(lang)
  const profile = getProfile()

  switch (card.type) {
    case 'intro':
      return (
        <IntroCard
          size={card.size}
          href={`/${lang}/about`}
          avatar={getSiteAsset(profile.avatar)}
          name={profile.name}
          greeting={site.intro.greeting}
          body={site.intro.body}
          cta={t.card.aboutMe}
        />
      )
    case 'contact':
      return card.contact === 'email' ? (
        <ContactCard size={card.size} kind="email" href={`mailto:${profile.email}`} label="Email" />
      ) : (
        <ContactCard size={card.size} kind="linkedin" href={profile.linkedin} label="LinkedIn" />
      )
    case 'quote': {
      const text = site.quotes[card.index]
      return text ? <QuoteCard size={card.size} text={text} label={t.quote.label} /> : null
    }
    case 'stat': {
      const stat = site.stats[card.index]
      return stat ? <StatCard size={card.size} tone={card.tone} value={stat.value} label={stat.label} /> : null
    }
    case 'photo':
      return <PhotoCard size={card.size} src={getSiteAsset(card.src)} alt={card.alt[lang]} />
  }
}
