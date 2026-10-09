import { lazy, Suspense, useMemo, useState } from 'react'
import { useParams } from 'react-router'
import { CaseBody } from '../../case-study/CaseBody/CaseBody'
import { CaseHero } from '../../case-study/CaseHero/CaseHero'
import { Callout } from '../../case-study/Callout/Callout'
import { NextProject } from '../../case-study/NextProject/NextProject'
import { PasswordGate } from '../../case-study/PasswordGate/PasswordGate'
import { ReadingProgress } from '../../case-study/ReadingProgress/ReadingProgress'
import { ProjectProvider } from '../../content/ProjectContext'
import { getNextProject, getProject, loadBody, resolveAsset, resolveLang, type Project } from '../../content/projects'
import { useDocumentMeta } from '../../hooks/useDocumentMeta'
import type { Lang } from '../../i18n/langs'
import { useI18n } from '../../i18n/useI18n'
import { isUnlocked } from '../../lib/password'
import { NotFoundPage } from '../NotFoundPage/NotFoundPage'
import styles from './CaseStudyPage.module.css'

export function CaseStudyPage() {
  const { slug = '' } = useParams()
  const { lang } = useI18n()
  const project = getProject(slug)
  if (!project) return <NotFoundPage />
  // key：切換案例或語言時重設所有狀態（密碼、目錄、lazy 元件）
  return <CaseStudy key={`${slug}-${lang}`} project={project} lang={lang} />
}

function CaseStudy({ project, lang }: { project: Project; lang: Lang }) {
  const { t } = useI18n()
  const resolved = resolveLang(project, lang)
  const [unlocked, setUnlocked] = useState(() => !project.meta.protected || isUnlocked())
  const Body = useMemo(() => lazy(() => loadBody(project.slug, resolved.lang)), [project.slug, resolved.lang])
  useDocumentMeta({ title: resolved.frontmatter.title, description: resolved.frontmatter.summary })

  if (!unlocked) return <PasswordGate onUnlock={() => setUnlocked(true)} />

  const next = getNextProject(project.slug)
  const nextTitle = next ? resolveLang(next, lang).frontmatter.title : ''

  return (
    <ProjectProvider slug={project.slug}>
      <ReadingProgress />
      <article className="container">
        <CaseHero
          frontmatter={resolved.frontmatter}
          meta={project.meta}
          cover={resolveAsset(project.slug, project.meta.cover)}
          coverAlt={project.meta.coverAlt?.[lang] ?? ''}
        />
        {resolved.isFallback && (
          <div className={styles.notice}>
            <Callout type="note">{t.case.missingTranslation}</Callout>
          </div>
        )}
        <Suspense fallback={<p className={styles.loading} aria-busy="true">{t.case.loading}</p>}>
          <CaseBody Body={Body} />
        </Suspense>
        {next && <NextProject to={`/${lang}/work/${next.slug}`} label={t.case.next} title={nextTitle} tone={next.meta.cardTone} />}
      </article>
    </ProjectProvider>
  )
}
