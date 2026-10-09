import { ContactCard } from '../../cards/ContactCard/ContactCard'
import { QuoteCard } from '../../cards/QuoteCard/QuoteCard'
import { StatCard } from '../../cards/StatCard/StatCard'
import { Callout } from '../../case-study/Callout/Callout'
import { Figure } from '../../case-study/Figure/Figure'
import { MetricRow } from '../../case-study/MetricRow/MetricRow'
import { useDocumentMeta } from '../../hooks/useDocumentMeta'
import { useI18n } from '../../i18n/useI18n'
import { BentoGrid } from '../../layout/BentoGrid/BentoGrid'
import { cx } from '../../lib/cx'
import { CARD_SIZES, CARD_TONES } from '../../styles/tokens'
import { Button } from '../../ui/Button/Button'
import { Card } from '../../ui/Card/Card'
import { Pill } from '../../ui/Pill/Pill'
import { Tag } from '../../ui/Tag/Tag'
import styles from './DesignSystemPage.module.css'

const COLOR_TOKENS = [
  { token: '--color-bg', zh: '頁面底色', en: 'Page background' },
  { token: '--color-surface', zh: '卡片', en: 'Card surface' },
  { token: '--color-surface-raised', zh: '浮層、選中膠囊', en: 'Raised surface' },
  { token: '--color-text', zh: '主文字', en: 'Primary text' },
  { token: '--color-text-muted', zh: '次要文字', en: 'Muted text' },
  { token: '--color-accent', zh: '重點、焦點框', en: 'Accent, focus ring' },
  { token: '--color-highlight', zh: '引言強調字', en: 'Quote highlight' },
]
const TEXT_TOKENS = ['--text-display', '--text-xl', '--text-lg', '--text-base', '--text-sm', '--text-xs']
const SPACE_TOKENS = ['--space-1', '--space-2', '--space-3', '--space-4', '--space-6', '--space-8', '--space-12', '--space-16']
const RADIUS_TOKENS = ['--radius-sm', '--radius-md', '--radius-card', '--radius-pill']
const SHADOW_TOKENS = ['--shadow-card', '--shadow-card-hover']

/** Design Guideline 活文件：直接用真實的 tokens 與元件渲染，改 tokens 時這頁會同步更新。 */
export function DesignSystemPage() {
  const { lang, t } = useI18n()
  useDocumentMeta({ title: t.ds.title })
  const zh = lang === 'zh'

  return (
    <div className={cx('container', styles.page)}>
      <h1 className={styles.title}>{t.ds.title}</h1>
      <p className={styles.intro}>{t.ds.intro}</p>

      <section className={styles.section} aria-labelledby="ds-colors">
        <h2 id="ds-colors" className={styles.sectionTitle}>{t.ds.colors}</h2>
        <div className={styles.themes}>
          {(['light', 'dark'] as const).map((theme) => (
            <div key={theme} className={styles.themePanel} data-theme={theme}>
              <p className={styles.themeLabel}>{t.ds[theme]}</p>
              <div className={styles.swatches}>
                {COLOR_TOKENS.map((color) => (
                  <div key={color.token} className={styles.swatch}>
                    <div className={styles.chip} style={{ background: `var(${color.token})` }} />
                    <span className={styles.token}>{color.token}</span>
                    <span className={styles.muted}>{color[lang]}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="ds-tones">
        <h2 id="ds-tones" className={styles.sectionTitle}>{t.ds.tones}</h2>
        <div className={styles.swatches}>
          {CARD_TONES.map((tone) => (
            <div key={tone} className={styles.swatch} data-tone={tone}>
              <div className={cx(styles.chip, styles.toneChip)}>Aa 設計</div>
              <span className={styles.token}>tone=&quot;{tone}&quot;</span>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="ds-type">
        <h2 id="ds-type" className={styles.sectionTitle}>{t.ds.typography}</h2>
        <p className={cx(styles.token, styles.muted)}>--font-sans: &quot;Poppins&quot;, &quot;Noto Sans TC&quot;, system-ui, sans-serif</p>
        {TEXT_TOKENS.map((token) => (
          <div key={token} className={styles.typeRow}>
            <span className={cx(styles.token, styles.muted, styles.typeLabel)}>{token}</span>
            <span className={styles.typeSample} style={{ fontSize: `var(${token})` }}>{t.ds.sample}</span>
          </div>
        ))}
      </section>

      <section className={styles.section} aria-labelledby="ds-spacing">
        <h2 id="ds-spacing" className={styles.sectionTitle}>{t.ds.spacing}</h2>
        {SPACE_TOKENS.map((token) => (
          <div key={token} className={styles.scaleRow}>
            <span className={styles.token}>{token}</span>
            <div className={styles.bar} style={{ width: `var(${token})` }} />
          </div>
        ))}
      </section>

      <section className={styles.section} aria-labelledby="ds-radius">
        <h2 id="ds-radius" className={styles.sectionTitle}>{t.ds.radius} / {t.ds.elevation}</h2>
        <div className={styles.boxes}>
          {RADIUS_TOKENS.map((token) => (
            <div key={token} className={cx(styles.box, styles.token)} style={{ borderRadius: `var(${token})` }}>{token}</div>
          ))}
          {SHADOW_TOKENS.map((token) => (
            <div key={token} className={cx(styles.box, styles.token)} style={{ borderRadius: 'var(--radius-md)', boxShadow: `var(${token})` }}>{token}</div>
          ))}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="ds-grid">
        <h2 id="ds-grid" className={styles.sectionTitle}>{t.ds.grid}</h2>
        <BentoGrid>
          {CARD_SIZES.map((size) => (
            <Card key={size} size={size} className={styles.demoCard}>
              <span className={styles.token}>size=&quot;{size}&quot;</span>
            </Card>
          ))}
        </BentoGrid>
      </section>

      <section className={styles.section} aria-labelledby="ds-components">
        <h2 id="ds-components" className={styles.sectionTitle}>{t.ds.components}</h2>
        <div className={styles.row}>
          <Button>Primary</Button>
          <Button variant="secondary" icon="download">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button disabled>Disabled</Button>
        </div>
        <div className={styles.row}>
          <Pill active>{t.nav.all}</Pill>
          <Pill>{t.nav.work}</Pill>
          <Pill variant="outlined" icon="sun">{t.header.themeLight}</Pill>
          <Pill variant="outlined" icon="wave" aria-pressed>{t.header.smoothScroll}</Pill>
        </div>
        <div className={styles.row}>
          <Tag>2026</Tag>
          <Tag>UX Research</Tag>
        </div>
        <BentoGrid>
          <QuoteCard size="2x1" text={zh ? '好的設計，從**精準定義問題**開始。' : 'Good design starts with **defining the right problem**.'} label={t.quote.label} />
          <StatCard size="1x1" tone="teal" value="92%" label={zh ? '使用滿意度' : 'User satisfaction'} />
          <ContactCard size="1x1" kind="email" href="mailto:hello@example.com" label="Email" />
        </BentoGrid>
        <div className={styles.proseDemo}>
          <Callout title={zh ? '問題陳述' : 'Problem statement'}>
            {zh ? '我們如何讓 ___ 在 ___ 情境下能 ___？' : 'How might we help ___ to ___ when ___?'}
          </Callout>
          <MetricRow
            items={[
              { value: '+32%', label: zh ? '任務完成率' : 'Task success' },
              { value: '-45s', label: zh ? '平均完成時間' : 'Avg. time on task' },
            ]}
          />
          <Figure alt={zh ? '圖片佔位示意' : 'Image placeholder'} caption={zh ? '沒有圖片時會顯示佔位框。' : 'A placeholder appears when no image is set.'} />
        </div>
      </section>
    </div>
  )
}
