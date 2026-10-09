# Shawn 作品集網站 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 以 Vite + React + TypeScript 建立 Shawn 的雙語 Bento 風格作品集網站，內含 Design System（tokens、元件）、內容驅動的案例頁與 Design Guideline 活文件。

**Architecture:** 內容（`content/`：JSON + MDX + 圖片）與程式（`src/`）完全分離；`import.meta.glob` 自動收集案例，Zod 驗證內容。樣式以 CSS 變數 tokens + CSS Modules 分層：tokens → ui → cards / case-study → layout → pages。路由以網址語言前綴（`/zh`、`/en`）為雙語的唯一真實來源。

**Tech Stack:** Vite 7、React 19、TypeScript、React Router 7、@mdx-js/rollup、remark-frontmatter、remark-mdx-frontmatter、remark-gfm、rehype-slug、Zod 4、Lenis、gray-matter + tsx（內容驗證腳本）。

**Spec:** `docs/superpowers/specs/2026-09-28-portfolio-design.md`

## Global Constraints

- 專案根目錄：`C:\Users\schang8\Desktop\離職前shawn 作品集\2026928 Shawn_Website`（以下路徑皆相對於此）。路徑含中文與空白，所有 shell 指令請加引號。
- **本版不寫自動化測試、不部署**（使用者明確要求，優先於 TDD）。每個任務的驗證方式為：`npm run typecheck`、`npm run validate`，以及在 `npm run dev` 下用瀏覽器（Playwright MCP）檢查 375px / 768px / 1280px 三種寬度。
- 專案不是 git repo，使用者沒有要求 commit → **不做 git 操作**。
- 英文字體 Poppins（400/500/600），中文 Noto Sans TC（400/500）：`--font-sans: "Poppins", "Noto Sans TC", system-ui, sans-serif`。
- 元件樣式只能引用 `src/styles/tokens.css` / `themes.css` / `tones.css` 的 CSS 變數，不寫死色碼與間距（唯一例外：tokens 檔本身）。
- 元件內不寫死任何中英文介面字串；一律來自 `src/i18n/zh.ts` / `en.ts` 或 `content/`。
- 依賴方向只能由上往下：`pages → layout / cards / case-study → ui → styles`；`content/`（loader）與 `i18n/`、`lib/`、`hooks/` 可被任何層使用，但它們不得 import 元件。
- 每個元件一個資料夾：`Component.tsx` + `Component.module.css`。
- 為了符合 WCAG AA 對比度，以下兩個色值和規格不同（規格 §3.1 的值對比度不足）：淺色 `--color-text-muted: #6b6862`、`--color-accent: #6b3ff0`，卡片珊瑚色 `--card-coral: #c9573c`。
- 案例保護密碼預設為 `shawn2026`（SHA-256：`4328710d5708c3045e234f9c23b49517ec0de2eb1a89c9aa112cb0933dcfb599`）。

## Review Focus

1. **內容作者打錯字或漏欄位**（JSON 語法錯、frontmatter 少 `title`、`timeline: 2025` 被 YAML 解析成數字）→ 應該顯示錯誤並指出檔案路徑與欄位，而不是白畫面。由 Task 3 的 `validate` 腳本與 Task 4 的 `RouteError` 負責；Task 3 Step 8 與 Task 4 Step 8 都有故意弄壞內容的檢查。
2. **某個案例只有一種語言** → 另一種語言的頁面應顯示現有內容並加上提示，首頁卡片也要正常。由 Task 8 負責；Task 8 Step 12 有刪除 en.mdx 的檢查。
3. **中英文字長度差異很大，卡片高度固定** → 桌機版卡片內文字不可溢出或被裁得不完整，應以 line-clamp 省略。由 Task 7 負責；Task 7 Step 9 有長文字檢查。
4. **localStorage / sessionStorage 無法使用**（無痕模式、被封鎖）→ 網站仍要正常，只是不記住偏好。所有存取都經過 `src/lib/storage.ts` 的 try/catch；Task 6 Step 9 有檢查。
5. **系統設定「減少動態效果」** → 不播放進場動畫、無法開啟 Lenis、回到頂部不做平滑捲動。由 Task 5 / Task 6 負責；Task 6 Step 9 用 `emulate_media reducedMotion` 檢查。

---

## File Structure

```
2026928 Shawn_Website/
  package.json, tsconfig.json, vite.config.ts, index.html
  README.md                         如何開發、如何新增作品
  DESIGN_GUIDELINE.md               設計規範文件
  public/
    favicon.svg
    resume/Shawn_Resume.pdf
  scripts/validate-content.ts       建置前的內容驗證
  content/
    site/  zh.json en.json profile.json home.json avatar.jpg
    projects/
      _template/  meta.json zh.mdx en.mdx images/.gitkeep
      openhci-2025/ openhci-2026/ kansei-engineering-2026/ logitech-anywhere-ui/ mental-health-app-testing-2024/
  src/
    main.tsx, config.ts
    styles/   tokens.css themes.css tones.css global.css tokens.ts
    lib/      storage.ts cx.ts password.ts
    i18n/     langs.ts zh.ts en.ts useI18n.ts
    content/  schema.ts errors.ts site.ts projects.ts wall.ts ProjectContext.tsx
    hooks/    useTheme.ts useReducedMotion.ts useSmoothScroll.ts useReveal.ts useActiveSection.ts useDocumentMeta.ts
    ui/       Icon/ Button/ Pill/ Tag/ Card/
    cards/    IntroCard/ ContactCard/ ProjectCard/ QuoteCard/ StatCard/ PhotoCard/
    layout/   LangLayout/ SiteHeader/ FilterNav/ HeaderControls/ Footer/ ScrollToTop/ BentoGrid/
    case-study/ CaseHero/ CaseBody/ CaseToc/ ReadingProgress/ MetricRow/ Figure/ BeforeAfter/ Callout/ NextProject/ PasswordGate/ mdxComponents.tsx
    pages/    HomePage/ CaseStudyPage/ AboutPage/ DesignSystemPage/ NotFoundPage/
    app/      App.tsx routes.tsx RootRedirect.tsx RouteError/
```

---

### Task 1: 專案骨架與相依套件

**Files:**
- Create: `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `public/favicon.svg`, `src/main.tsx`（暫時版）

**Interfaces:**
- Produces: npm scripts `dev`、`validate`、`typecheck`、`build`；Vite 能 import `.mdx`（匯出 `default` 元件與 `frontmatter`），標題自動加上 `id`。

- [ ] **Step 1: 建立 `package.json`**

```json
{
  "name": "shawn-portfolio",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "validate": "tsx scripts/validate-content.ts",
    "typecheck": "tsc --noEmit",
    "build": "npm run validate && npm run typecheck && vite build",
    "preview": "vite preview"
  }
}
```

- [ ] **Step 2: 安裝相依套件**

```bash
cd "/c/Users/schang8/Desktop/離職前shawn 作品集/2026928 Shawn_Website"
npm install react@^19 react-dom@^19 react-router@^7 zod@^4 lenis@^1.3
npm install -D vite@^7 @vitejs/plugin-react@^5 typescript@^5 @types/react@^19 @types/react-dom@^19 @types/node @types/mdx @mdx-js/rollup@^3 remark-frontmatter remark-mdx-frontmatter remark-gfm rehype-slug gray-matter tsx
```

Expected: 兩個指令都成功，沒有 `ERR!`。

- [ ] **Step 3: 建立 `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "types": ["vite/client", "node", "mdx"]
  },
  "include": ["src", "scripts", "vite.config.ts"]
}
```

- [ ] **Step 4: 建立 `vite.config.ts`**

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mdx from '@mdx-js/rollup'
import remarkFrontmatter from 'remark-frontmatter'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'

export default defineConfig({
  plugins: [
    {
      enforce: 'pre',
      ...mdx({
        remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter, remarkGfm],
        rehypePlugins: [rehypeSlug],
      }),
    },
    react({ include: /\.(mdx|tsx?|jsx?)$/ }),
  ],
})
```

- [ ] **Step 5: 建立 `index.html`**（包含渲染前套用主題的腳本，避免閃爍）

```html
<!doctype html>
<html lang="zh-Hant">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>張上元 Shawn｜產品設計與 UX 作品集</title>
    <meta name="description" content="張上元 Shawn 的作品集：產品設計、使用者經驗研究與服務設計。" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500&family=Poppins:wght@400;500;600&display=swap"
    />
    <script>
      (function () {
        var theme = 'light';
        try {
          var saved = localStorage.getItem('theme');
          theme = saved === 'light' || saved === 'dark'
            ? saved
            : matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        } catch (e) {}
        document.documentElement.dataset.theme = theme;
      })();
    </script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 6: 建立 `public/favicon.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="16" fill="#2a1640"/>
  <text x="29" y="41" text-anchor="middle" font-family="Poppins, Arial, sans-serif" font-size="24" font-weight="600" fill="#ffffff">SC</text>
  <circle cx="50" cy="40" r="3.5" fill="#a46cff"/>
</svg>
```

- [ ] **Step 7: 建立暫時版 `src/main.tsx`**（Task 4 會取代）

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <p>Hello Shawn</p>
  </StrictMode>,
)
```

- [ ] **Step 8: 驗證**

Run: `npm run typecheck` → Expected: 沒有輸出，exit 0。
Run: `npm run dev`（背景執行），用瀏覽器開 `http://localhost:5173/` → Expected: 顯示「Hello Shawn」，console 沒有錯誤。

---

### Task 2: Design Tokens 與全域樣式

**Files:**
- Create: `src/styles/tokens.css`, `src/styles/themes.css`, `src/styles/tones.css`, `src/styles/global.css`, `src/styles/tokens.ts`, `src/lib/cx.ts`

**Interfaces:**
- Produces: CSS 變數（見下方）；`[data-tone]` 屬性會設定 `--tone-bg`、`--tone-fg`；全域 class `.container`、`.visually-hidden`、`.skip-link`；TS 常數 `CARD_SIZES`、`CARD_TONES` 與型別 `CardSize`、`CardTone`；`cx(...classes)`。

- [ ] **Step 1: 建立 `src/styles/tokens.css`**

```css
/* Design Tokens：所有視覺數值的唯一來源。元件只能引用這裡的變數。 */
:root {
  /* 字體 */
  --font-sans: "Poppins", "Noto Sans TC", system-ui, -apple-system, "Segoe UI", sans-serif;
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: clamp(1rem, 0.96rem + 0.18vw, 1.0625rem);
  --text-lg: clamp(1.125rem, 1.06rem + 0.3vw, 1.25rem);
  --text-xl: clamp(1.5rem, 1.2rem + 1.4vw, 2.25rem);
  --text-display: clamp(2.25rem, 1.6rem + 3vw, 4rem);
  --leading-body-zh: 1.75;
  --leading-body-en: 1.6;
  --leading-tight: 1.2;
  --weight-regular: 400;
  --weight-medium: 500;
  --weight-semibold: 600;

  /* 間距（4px 基礎） */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;

  /* 圓角 */
  --radius-sm: 12px;
  --radius-md: 20px;
  --radius-card: 28px;
  --radius-pill: 999px;

  /* 動效 */
  --ease-out: cubic-bezier(0.2, 0.8, 0.2, 1);
  --duration-fast: 150ms;
  --duration-base: 300ms;

  /* 版面 */
  --container-max: 1080px;
  --prose-max: 720px;
  --gutter: 16px;
  --grid-gap: 12px;
  --header-height: 120px;

  /* 卡片主題色（深淺模式共用） */
  --card-purple: #a46cff;
  --card-violet-dark: #2a1640;
  --card-coral: #c9573c;
  --card-ink: #1a1a1a;
  --card-lavender: #d9d4ff;
  --card-teal: #2f8f83;
  --on-dark: #ffffff;
  --on-light: #2c2c2c;
}

@media (min-width: 640px) {
  :root {
    --gutter: 24px;
    --grid-gap: 20px;
  }
}

@media (min-width: 900px) {
  :root {
    --header-height: 72px;
  }
}

@media (prefers-reduced-motion: reduce) {
  :root {
    --duration-fast: 0ms;
    --duration-base: 0ms;
  }
}
```

- [ ] **Step 2: 建立 `src/styles/themes.css`**（`[data-theme]` 可以放在任何元素上，Design System 頁面會利用這點並排顯示兩種主題）

```css
:root,
[data-theme='light'] {
  color-scheme: light;
  --color-bg: #f0ede8;
  --color-surface: #f9f8f6;
  --color-surface-raised: #ffffff;
  --color-border: rgba(0, 0, 0, 0.06);
  --color-text: #2c2c2c;
  --color-text-muted: #6b6862;
  --color-accent: #6b3ff0;
  --color-highlight: #2b6cb0;
  --shadow-card: 0 1px 2px rgba(0, 0, 0, 0.04), 0 2px 8px rgba(0, 0, 0, 0.03);
  --shadow-card-hover: 0 12px 32px rgba(0, 0, 0, 0.1);
}

[data-theme='dark'] {
  color-scheme: dark;
  --color-bg: #141316;
  --color-surface: #1e1d21;
  --color-surface-raised: #26252a;
  --color-border: rgba(255, 255, 255, 0.08);
  --color-text: #edebe7;
  --color-text-muted: #9a978f;
  --color-accent: #a58bff;
  --color-highlight: #7fb3f0;
  --shadow-card: 0 1px 2px rgba(0, 0, 0, 0.4);
  --shadow-card-hover: 0 12px 32px rgba(0, 0, 0, 0.5);
}
```

- [ ] **Step 3: 建立 `src/styles/tones.css`**（卡片、案例封面、下一個案例共用）

```css
[data-tone='surface'] { --tone-bg: var(--color-surface); --tone-fg: var(--color-text); }
[data-tone='purple'] { --tone-bg: var(--card-purple); --tone-fg: var(--on-dark); }
[data-tone='violet-dark'] { --tone-bg: var(--card-violet-dark); --tone-fg: var(--on-dark); }
[data-tone='coral'] { --tone-bg: var(--card-coral); --tone-fg: var(--on-dark); }
[data-tone='ink'] { --tone-bg: var(--card-ink); --tone-fg: var(--on-dark); }
[data-tone='lavender'] { --tone-bg: var(--card-lavender); --tone-fg: var(--on-light); }
[data-tone='teal'] { --tone-bg: var(--card-teal); --tone-fg: var(--on-dark); }
```

- [ ] **Step 4: 建立 `src/styles/global.css`**

```css
*, *::before, *::after { box-sizing: border-box; }
* { margin: 0; }

html { -webkit-text-size-adjust: 100%; }

body {
  min-height: 100vh;
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-sans);
  font-size: var(--text-base);
  line-height: var(--leading-body-zh);
  -webkit-font-smoothing: antialiased;
  transition: background-color var(--duration-base) var(--ease-out), color var(--duration-base) var(--ease-out);
}

html[lang='en'] body { line-height: var(--leading-body-en); }

img, svg, video { display: block; max-width: 100%; }
img { height: auto; }
button, input { font: inherit; color: inherit; }
button { cursor: pointer; }
a { color: inherit; }

h1, h2, h3, h4 {
  line-height: var(--leading-tight);
  font-weight: var(--weight-semibold);
  text-wrap: balance;
}
p { text-wrap: pretty; }

:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 3px;
  border-radius: 4px;
}
main:focus { outline: none; }

::selection { background: var(--color-accent); color: #fff; }

.container {
  width: 100%;
  max-width: calc(var(--container-max) + 2 * var(--gutter));
  margin-inline: auto;
  padding-inline: var(--gutter);
}

.visually-hidden {
  position: absolute !important;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}

.skip-link {
  position: absolute;
  left: var(--space-4);
  top: -100px;
  z-index: 100;
  padding: var(--space-2) var(--space-4);
  background: var(--color-surface-raised);
  border-radius: var(--radius-pill);
  box-shadow: var(--shadow-card-hover);
}
.skip-link:focus { top: var(--space-4); }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

- [ ] **Step 5: 建立 `src/styles/tokens.ts`**（TS 與內容 schema 共用的尺寸和色調清單）

```ts
export const CARD_SIZES = ['1x1', '2x1', '1x2', '2x2'] as const
export type CardSize = (typeof CARD_SIZES)[number]

export const CARD_TONES = ['surface', 'purple', 'violet-dark', 'coral', 'ink', 'lavender', 'teal'] as const
export type CardTone = (typeof CARD_TONES)[number]
```

- [ ] **Step 6: 建立 `src/lib/cx.ts`**

```ts
/** 合併 className，忽略 falsy 值。 */
export function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}
```

- [ ] **Step 7: 驗證**

Run: `npm run typecheck` → Expected: exit 0。（CSS 在 Task 4 接上 main.tsx 後才會實際載入。）

---

### Task 3: 內容 Schema、載入器、驗證腳本與初始內容

**Files:**
- Create: `src/content/schema.ts`, `src/content/errors.ts`, `src/content/site.ts`, `src/content/projects.ts`, `src/content/wall.ts`, `src/config.ts`, `scripts/validate-content.ts`
- Create: `content/site/zh.json`, `content/site/en.json`, `content/site/profile.json`, `content/site/home.json`, `content/site/avatar.jpg`（複製）
- Create: `content/projects/_template/{meta.json,zh.mdx,en.mdx,images/.gitkeep}` 以及 5 個案例資料夾（由腳本產生）
- Create: `public/resume/Shawn_Resume.pdf`（複製）

**Interfaces:**
- Consumes: `CARD_SIZES`、`CARD_TONES`（Task 2）
- Produces:
  - `schema.ts`：`projectMetaSchema`、`frontmatterSchema`、`siteTextSchema`、`profileSchema`、`homeSchema`、`CATEGORIES`；型別 `ProjectMeta`、`Frontmatter`、`SiteText`、`Profile`、`HomeCard`、`Category`
  - `errors.ts`：`class ContentError extends Error`、`formatIssues(file: string, error: z.ZodError): string`
  - `site.ts`：`getSiteText(lang: Lang): SiteText`、`getProfile(): Profile`、`getHomeCards(): HomeCard[]`、`getSiteAsset(path: string): string | undefined`
  - `projects.ts`：`type Project = { slug: string; meta: ProjectMeta; content: Partial<Record<Lang, Frontmatter>> }`、`getProjects(): Project[]`、`getProject(slug: string): Project | undefined`、`resolveLang(project: Project, lang: Lang): { lang: Lang; frontmatter: Frontmatter; isFallback: boolean }`、`loadBody(slug: string, lang: Lang): Promise<{ default: ComponentType<MDXProps> }>`、`resolveAsset(slug: string, path?: string): string | undefined`、`getNextProject(slug: string): Project | undefined`
  - `wall.ts`：`FILTERS`、`type Filter = 'all' | Category`、`parseFilter(value: string | null): Filter`、`type WallItem`、`buildWall(projects, cards): WallItem[]`、`categoryOf(item): Category`、`keyOf(item): string`
  - `config.ts`：`PROTECTED_PASSWORD_SHA256`
- 注意：`site.ts` 和 `projects.ts` 需要 `Lang`，它定義在 Task 4 的 `src/i18n/langs.ts`。**本任務的 Step 1 先建立 `langs.ts`**（Task 4 會使用同一個檔案，不重複建立）。

- [ ] **Step 1: 建立 `src/lib/storage.ts` 與 `src/i18n/langs.ts`**

`src/lib/storage.ts`：
```ts
type StoreName = 'local' | 'session'

function store(name: StoreName): Storage {
  return name === 'local' ? window.localStorage : window.sessionStorage
}

/** 無痕模式或瀏覽器封鎖儲存空間時會丟錯，這裡一律吞掉，讓網站照常運作。 */
export function readStorage(key: string, name: StoreName = 'local'): string | null {
  try {
    return store(name).getItem(key)
  } catch {
    return null
  }
}

export function writeStorage(key: string, value: string, name: StoreName = 'local'): void {
  try {
    store(name).setItem(key, value)
  } catch {
    // 無法儲存時就不記住偏好
  }
}
```

`src/i18n/langs.ts`：
```ts
import { readStorage } from '../lib/storage'

export const LANGS = ['zh', 'en'] as const
export type Lang = (typeof LANGS)[number]

export const HTML_LANG: Record<Lang, string> = { zh: 'zh-Hant', en: 'en' }
export const LANG_STORAGE_KEY = 'lang'

export function isLang(value: unknown): value is Lang {
  return LANGS.includes(value as Lang)
}

/** 語言偵測順序：使用者手動選過的 → 瀏覽器語言（中文系為 zh，其餘為 en）。 */
export function detectLang(): Lang {
  const saved = readStorage(LANG_STORAGE_KEY)
  if (isLang(saved)) return saved
  return navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en'
}
```

- [ ] **Step 2: 建立 `src/content/schema.ts` 與 `src/content/errors.ts`**

`src/content/schema.ts`：
```ts
import { z } from 'zod'
import { CARD_SIZES, CARD_TONES } from '../styles/tokens'

export const CATEGORIES = ['about', 'work', 'side'] as const

const cardSize = z.enum(CARD_SIZES)
const cardTone = z.enum(CARD_TONES)
const category = z.enum(CATEGORIES)
const localized = z.object({ zh: z.string().min(1), en: z.string().min(1) })

export const projectMetaSchema = z
  .object({
    order: z.number().int(),
    year: z.number().int().min(2000).max(2100),
    category: category.default('work'),
    cardSize: cardSize.default('2x2'),
    cardTone: cardTone.default('violet-dark'),
    cover: z.string().optional(),
    coverAlt: localized.optional(),
    tags: z.array(z.string()).default([]),
    protected: z.boolean().default(false),
  })
  .refine((meta) => !meta.cover || meta.coverAlt, {
    message: '有 cover 時必須提供 coverAlt（中英文的圖片替代文字）',
    path: ['coverAlt'],
  })

export const frontmatterSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  role: z.string().min(1),
  timeline: z.string().min(1),
  team: z.string().optional(),
  tools: z.array(z.string()).default([]),
  highlights: z.array(z.object({ value: z.string(), label: z.string() })).max(3).default([]),
})

export const siteTextSchema = z.object({
  meta: z.object({ title: z.string(), description: z.string() }),
  intro: z.object({ greeting: z.string(), body: z.string() }),
  quotes: z.array(z.string()),
  stats: z.array(z.object({ value: z.string(), label: z.string() })),
  about: z.object({
    heading: z.string(),
    paragraphs: z.array(z.string()),
    experience: z.array(
      z.object({ period: z.string(), org: z.string(), role: z.string(), description: z.string() }),
    ),
    education: z.array(z.object({ period: z.string(), school: z.string(), degree: z.string() })),
  }),
})

export const profileSchema = z.object({
  name: z.string().min(1),
  avatar: z.string().min(1),
  email: z.email(),
  linkedin: z.url(),
  resume: localized,
})

const cardBase = z.object({
  id: z.string().min(1),
  position: z.number().int().min(0),
  size: cardSize,
  category,
})

export const homeCardSchema = z.discriminatedUnion('type', [
  cardBase.extend({ type: z.literal('intro') }),
  cardBase.extend({ type: z.literal('contact'), contact: z.enum(['email', 'linkedin']) }),
  cardBase.extend({ type: z.literal('quote'), index: z.number().int().min(0) }),
  cardBase.extend({ type: z.literal('stat'), index: z.number().int().min(0), tone: cardTone.default('surface') }),
  cardBase.extend({ type: z.literal('photo'), src: z.string().min(1), alt: localized }),
])

export const homeSchema = z.object({ cards: z.array(homeCardSchema) })

export type Category = (typeof CATEGORIES)[number]
export type ProjectMeta = z.infer<typeof projectMetaSchema>
export type Frontmatter = z.infer<typeof frontmatterSchema>
export type SiteText = z.infer<typeof siteTextSchema>
export type Profile = z.infer<typeof profileSchema>
export type HomeCard = z.infer<typeof homeCardSchema>
```

`src/content/errors.ts`：
```ts
import type { z } from 'zod'

export class ContentError extends Error {
  name = 'ContentError'
}

/** 把 Zod 的錯誤整理成「檔案路徑 + 欄位: 訊息」，讓內容作者一眼看出哪裡要改。 */
export function formatIssues(file: string, error: z.ZodError): string {
  const lines = error.issues.map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
  return `${file}\n${lines.join('\n')}`
}
```

- [ ] **Step 3: 建立 `src/content/site.ts`、`src/content/projects.ts`、`src/content/wall.ts`、`src/config.ts`**

`src/content/site.ts`：
```ts
import type { z } from 'zod'
import zhText from '../../content/site/zh.json'
import enText from '../../content/site/en.json'
import profileJson from '../../content/site/profile.json'
import homeJson from '../../content/site/home.json'
import type { Lang } from '../i18n/langs'
import { ContentError, formatIssues } from './errors'
import { homeSchema, profileSchema, siteTextSchema, type HomeCard, type Profile, type SiteText } from './schema'

const siteAssets = import.meta.glob<string>('/content/site/*.{jpg,jpeg,png,webp,svg}', {
  eager: true,
  import: 'default',
  query: '?url',
})

function parse<T>(schema: z.ZodType<T>, data: unknown, file: string): T {
  const result = schema.safeParse(data)
  if (!result.success) throw new ContentError(`內容驗證失敗：\n\n${formatIssues(file, result.error)}`)
  return result.data
}

type SiteContent = { text: Record<Lang, SiteText>; profile: Profile; home: HomeCard[] }
let cache: SiteContent | null = null

function load(): SiteContent {
  cache ??= {
    text: {
      zh: parse(siteTextSchema, zhText, '/content/site/zh.json'),
      en: parse(siteTextSchema, enText, '/content/site/en.json'),
    },
    profile: parse(profileSchema, profileJson, '/content/site/profile.json'),
    home: parse(homeSchema, homeJson, '/content/site/home.json').cards,
  }
  return cache
}

export const getSiteText = (lang: Lang): SiteText => load().text[lang]
export const getProfile = (): Profile => load().profile
export const getHomeCards = (): HomeCard[] => load().home

/** `content/site/` 內的圖片，例如 profile.avatar = "avatar.jpg"。 */
export function getSiteAsset(path: string): string | undefined {
  return siteAssets[`/content/site/${path.replace(/^\.\//, '')}`]
}
```

`src/content/projects.ts`：
```ts
import type { ComponentType } from 'react'
import type { MDXProps } from 'mdx/types'
import { LANGS, type Lang } from '../i18n/langs'
import { ContentError, formatIssues } from './errors'
import { frontmatterSchema, projectMetaSchema, type Frontmatter, type ProjectMeta } from './schema'

const metaFiles = import.meta.glob<unknown>('/content/projects/*/meta.json', { eager: true, import: 'default' })
const frontmatterFiles = import.meta.glob<unknown>('/content/projects/*/*.mdx', {
  eager: true,
  import: 'frontmatter',
})
const bodyFiles = import.meta.glob<{ default: ComponentType<MDXProps> }>('/content/projects/*/*.mdx')
const assetFiles = import.meta.glob<string>('/content/projects/*/images/*', {
  eager: true,
  import: 'default',
  query: '?url',
})

export type Project = {
  slug: string
  meta: ProjectMeta
  content: Partial<Record<Lang, Frontmatter>>
}

/** '/content/projects/<slug>/meta.json' → '<slug>' */
const slugOf = (file: string) => file.split('/')[3]

let cache: Project[] | null = null

export function getProjects(): Project[] {
  if (cache) return cache
  const errors: string[] = []
  const projects: Project[] = []

  for (const [file, raw] of Object.entries(metaFiles)) {
    const slug = slugOf(file)
    if (slug.startsWith('_')) continue // _template 等範本資料夾不上線

    const meta = projectMetaSchema.safeParse(raw)
    if (!meta.success) {
      errors.push(formatIssues(file, meta.error))
      continue
    }

    const content: Project['content'] = {}
    for (const lang of LANGS) {
      const mdxFile = `/content/projects/${slug}/${lang}.mdx`
      if (!(mdxFile in frontmatterFiles)) continue
      const frontmatter = frontmatterSchema.safeParse(frontmatterFiles[mdxFile])
      if (frontmatter.success) content[lang] = frontmatter.data
      else errors.push(formatIssues(mdxFile, frontmatter.error))
    }
    if (Object.keys(content).length === 0 && !errors.length) {
      errors.push(`/content/projects/${slug}/\n  - 至少需要 zh.mdx 或 en.mdx 其中一個`)
    }
    projects.push({ slug, meta: meta.data, content })
  }

  if (errors.length) throw new ContentError(`內容驗證失敗：\n\n${errors.join('\n\n')}`)
  cache = projects.sort((a, b) => a.meta.order - b.meta.order)
  return cache
}

export function getProject(slug: string): Project | undefined {
  return getProjects().find((project) => project.slug === slug)
}

/** 取得指定語言的內容；該語言尚未撰寫時改用另一個語言，並標記 isFallback。 */
export function resolveLang(project: Project, lang: Lang) {
  const own = project.content[lang]
  if (own) return { lang, frontmatter: own, isFallback: false }
  const other = LANGS.find((l) => project.content[l])!
  return { lang: other, frontmatter: project.content[other]!, isFallback: true }
}

export function loadBody(slug: string, lang: Lang) {
  return bodyFiles[`/content/projects/${slug}/${lang}.mdx`]()
}

/** 把案例內的相對路徑（例如 "images/cover.jpg"）轉成可用的網址；絕對路徑或外部網址原樣回傳。 */
export function resolveAsset(slug: string, path?: string): string | undefined {
  if (!path) return undefined
  if (/^(https?:)?\//.test(path)) return path
  return assetFiles[`/content/projects/${slug}/${path.replace(/^\.\//, '')}`]
}

export function getNextProject(slug: string): Project | undefined {
  const list = getProjects()
  if (list.length < 2) return undefined
  const index = list.findIndex((project) => project.slug === slug)
  return list[(index + 1) % list.length]
}
```

`src/content/wall.ts`：
```ts
import type { Project } from './projects'
import type { Category, HomeCard } from './schema'

export const FILTERS = ['all', 'about', 'work', 'side'] as const
export type Filter = (typeof FILTERS)[number]

export function parseFilter(value: string | null): Filter {
  return FILTERS.includes(value as Filter) ? (value as Filter) : 'all'
}

export type WallItem = { kind: 'project'; project: Project } | { kind: 'card'; card: HomeCard }

/**
 * 首頁卡片牆：先依 order 排好作品卡，再把 home.json 的其他卡片插到各自的 position（從 0 開始的最終位置）。
 * 新增作品時不需要改 home.json，它會自動遞補到空位。
 */
export function buildWall(projects: Project[], cards: HomeCard[]): WallItem[] {
  const items: WallItem[] = projects.map((project) => ({ kind: 'project', project }))
  for (const card of [...cards].sort((a, b) => a.position - b.position)) {
    items.splice(Math.min(card.position, items.length), 0, { kind: 'card', card })
  }
  return items
}

export function categoryOf(item: WallItem): Category {
  return item.kind === 'project' ? item.project.meta.category : item.card.category
}

export function keyOf(item: WallItem): string {
  return item.kind === 'project' ? `project-${item.project.slug}` : `card-${item.card.id}`
}
```

`src/config.ts`：
```ts
/**
 * 受保護案例（meta.json 中 "protected": true）的密碼 SHA-256 雜湊值。目前的密碼是 shawn2026。
 * 更換密碼：node -e "console.log(require('crypto').createHash('sha256').update('新密碼').digest('hex'))"
 * 注意：這只能擋住一般瀏覽，不是真正的安全機制，機密內容不要放上網站。
 */
export const PROTECTED_PASSWORD_SHA256 = '4328710d5708c3045e234f9c23b49517ec0de2eb1a89c9aa112cb0933dcfb599'
```

- [ ] **Step 4: 複製頭貼與履歷，並建立網站文字內容**

```bash
cd "/c/Users/schang8/Desktop/離職前shawn 作品集/2026928 Shawn_Website"
mkdir -p content/site public/resume
cp photo/Shawn.jpg content/site/avatar.jpg
cp "../Shawn_Resume_Hp_Product Experience Planner.pdf" public/resume/Shawn_Resume.pdf
```

`content/site/profile.json`（email 與 LinkedIn 是待 Shawn 提供的佔位值）：
```json
{
  "name": "張上元 Shawn Chang",
  "avatar": "avatar.jpg",
  "email": "shawn@example.com",
  "linkedin": "https://www.linkedin.com/in/your-profile",
  "resume": { "zh": "/resume/Shawn_Resume.pdf", "en": "/resume/Shawn_Resume.pdf" }
}
```

`content/site/home.json`（桌機 4 欄時的排列；作品卡會填入 3、7、10、12、13 等空位）：
```json
{
  "cards": [
    { "id": "intro", "type": "intro", "position": 0, "size": "2x1", "category": "about" },
    { "id": "email", "type": "contact", "contact": "email", "position": 1, "size": "1x1", "category": "about" },
    { "id": "linkedin", "type": "contact", "contact": "linkedin", "position": 2, "size": "1x1", "category": "about" },
    { "id": "quote-1", "type": "quote", "index": 0, "position": 4, "size": "2x1", "category": "about" },
    { "id": "stat-hackathon", "type": "stat", "index": 0, "tone": "surface", "position": 5, "size": "1x1", "category": "about" },
    { "id": "stat-npi", "type": "stat", "index": 1, "tone": "teal", "position": 6, "size": "1x1", "category": "about" },
    { "id": "quote-2", "type": "quote", "index": 1, "position": 8, "size": "2x1", "category": "about" },
    { "id": "stat-papers", "type": "stat", "index": 2, "tone": "lavender", "position": 9, "size": "1x1", "category": "about" },
    { "id": "quote-3", "type": "quote", "index": 2, "position": 11, "size": "2x1", "category": "about" }
  ]
}
```

`content/site/zh.json`：
```json
{
  "meta": {
    "title": "張上元 Shawn｜產品設計與 UX 作品集",
    "description": "張上元 Shawn 的作品集：產品設計、使用者經驗研究與服務設計。清華大學藝術與設計所，羅技創新部門實習。"
  },
  "intro": {
    "greeting": "嗨 👋",
    "body": "我是張上元 Shawn，清華大學藝術與設計所碩士生，目前在羅技創新部門實習，專注產品設計、UX 研究與服務設計。"
  },
  "quotes": [
    "好的設計，從**精準定義問題**開始。",
    "讓洞見**快速變成原型**，再讓使用者告訴我們答案。",
    "兼顧**使用者價值與商業價值**，設計才會真正落地。"
  ],
  "stats": [
    { "value": "130+", "label": "羅技全球黑客松參與者" },
    { "value": "2", "label": "個創新概念進入 NPI 階段" },
    { "value": "4", "label": "篇國內外研討會論文" }
  ],
  "about": {
    "heading": "以研究洞見與快速原型，把使用者需求變成產品。",
    "paragraphs": [
      "我是張上元，就讀國立清華大學藝術與設計所碩士班，主修產品設計、使用者經驗研究（UX）與服務設計。我善於結合設計思考與商業思維，精通質性與量化研究，研究成果已發表於國內外研討會（共四篇）。",
      "在羅技創新部門實習期間，我負責全球黑客松的專案管理，並協助部門把散落的創新點子數位化成可搜尋的資料庫，導入 NotebookLM 讓同仁能以自然語言檢索與收斂概念。其中兩個創新想法被公司高層選中，進入 NPI 階段。",
      "我也是臺大資料分析與決策社、臺大管理顧問社的成員，習慣從精準定義問題出發，以數據驅動決策。"
    ],
    "experience": [
      {
        "period": "碩士期間",
        "org": "羅技 Logitech 創新部門",
        "role": "創新實習生",
        "description": "負責為期三個月的全球黑客松（28+ 隊、130 人參與）；建立部門創新資料庫並導入 NotebookLM；參與 PoC 開發與耳機、鍵盤、滑鼠的使用者測試。兩個概念進入 NPI 階段。"
      },
      {
        "period": "大學期間",
        "org": "微軟 Microsoft DPSS",
        "role": "行銷實習生",
        "description": "分析 OEM（HP、ASUS、Dell、Acer）銷售數據並製作報表；於微軟第十九屆領袖營負責 Take Mi Hand App 的 UI 設計，獲得 92% 使用滿意度。"
      },
      {
        "period": "大學至碩士期間",
        "org": "國科會研究計畫",
        "role": "研究助理",
        "description": "協助三項國科會計畫：AIGC 對設計流程的影響、實體與虛擬介面的感性與使用性評價、腹膜透析病患居家衛教。負責實驗設計、數據收集與分析（Excel、SPSS）。"
      }
    ],
    "education": [
      { "period": "在學中", "school": "國立清華大學", "degree": "藝術與設計學系碩士班" }
    ]
  }
}
```

`content/site/en.json`：
```json
{
  "meta": {
    "title": "Shawn Chang — Product & UX Designer",
    "description": "Portfolio of Shawn Chang: product design, UX research and service design. M.A. student at National Tsing Hua University, innovation intern at Logitech."
  },
  "intro": {
    "greeting": "Hi there 👋",
    "body": "I'm Shawn Chang, an M.A. design student at National Tsing Hua University and an innovation intern at Logitech, focused on product design, UX research and service design."
  },
  "quotes": [
    "Good design starts with **defining the right problem**.",
    "Turn insights into **prototypes fast**, then let users tell us the answer.",
    "Design only ships when it balances **user value and business value**."
  ],
  "stats": [
    { "value": "130+", "label": "participants in Logitech's global hackathon" },
    { "value": "2", "label": "innovation concepts moved into NPI" },
    { "value": "4", "label": "conference papers published" }
  ],
  "about": {
    "heading": "Turning user needs into products through research insight and rapid prototyping.",
    "paragraphs": [
      "I'm Shawn Chang, an M.A. student in Arts and Design at National Tsing Hua University, focusing on product design, UX research and service design. I combine design thinking with business thinking, work comfortably with both qualitative and quantitative methods, and have published four conference papers.",
      "As an innovation intern at Logitech, I ran the company's global hackathon and helped the team turn scattered ideas into a searchable innovation database, bringing in NotebookLM so colleagues could explore and converge concepts in natural language. Two of the ideas were selected by leadership for NPI.",
      "I'm also a member of NTU's Data Analytics & Decision Club and Management Consulting Club, which trained me to define problems precisely and make data-driven decisions."
    ],
    "experience": [
      {
        "period": "During M.A.",
        "org": "Logitech, Innovation Team",
        "role": "Innovation Intern",
        "description": "Ran a three-month global hackathon (28+ teams, 130 participants); built the team's innovation database with NotebookLM search; supported PoC development and user testing for headsets, keyboards and mice. Two concepts moved into NPI."
      },
      {
        "period": "Undergraduate",
        "org": "Microsoft DPSS",
        "role": "Marketing Intern",
        "description": "Analysed OEM sales data (HP, ASUS, Dell, Acer) and built reports; designed the UI of the Take Mi Hand app at Microsoft's 19th Leadership Camp, reaching 92% user satisfaction."
      },
      {
        "period": "Undergraduate – M.A.",
        "org": "NSTC-funded research projects",
        "role": "Research Assistant",
        "description": "Supported three NSTC projects on AIGC in design workflows, kansei and usability of physical vs. virtual interfaces, and home dialysis self-care. Led study design, data collection and analysis (Excel, SPSS)."
      }
    ],
    "education": [
      { "period": "Current", "school": "National Tsing Hua University", "degree": "M.A., Arts and Design" }
    ]
  }
}
```

- [ ] **Step 5: 建立案例範本 `content/projects/_template/`**

`content/projects/_template/meta.json`：
```json
{
  "order": 99,
  "year": 2026,
  "category": "work",
  "cardSize": "2x2",
  "cardTone": "violet-dark",
  "tags": [],
  "protected": false
}
```

`content/projects/_template/zh.mdx`：
```mdx
---
title: 專案名稱（待補）
summary: 待補：用一句話說明這個專案解決了什麼問題、帶來什麼成果。
role: 待補（例如：UX 研究、互動設計）
timeline: 待補
team: 待補
tools: [Figma]
highlights:
  - value: "待補"
    label: "成果指標"
---

## 背景

待補：產品或專案的情境、服務對象，以及為什麼會有這個專案。有哪些限制條件（時程、技術、資源）？

## 問題

待補：使用者卡在哪裡？影響了哪個商業指標？你是怎麼知道的？

<Callout title="問題陳述">我們如何讓 ___ 在 ___ 情境下能 ___？</Callout>

## 研究與洞察

待補：用了什麼研究方法、為什麼選它，以及最關鍵的 2–3 個洞察。

<Figure alt="研究過程示意圖（待補）" caption="待補：用一句話說明這張圖的重點。" />

## 發想

待補：考慮過哪些方案？為什麼放棄其他方案？

## 設計與迭代

待補：從 Lo-fi 到 Hi-fi 的演進，測試回饋讓你改了什麼。

<BeforeAfter beforeAlt="改版前畫面（待補）" afterAlt="改版後畫面（待補）" caption="待補：改版前後的差異。" />

## 解法

待補：最終設計的 2–3 個核心功能，分別對應前面的哪個問題。

## 成果

待補：量化與質化成果；沒有上線數據時，可以寫測試結果。

<MetricRow items={[{ value: '待補', label: '量化成果' }]} />

## 反思

待補：學到什麼？重來一次會怎麼做？
```

`content/projects/_template/en.mdx`：
```mdx
---
title: Project name (TBD)
summary: "TBD: one sentence on the problem this project solved and what it achieved."
role: TBD (e.g. UX research, interaction design)
timeline: TBD
team: TBD
tools: [Figma]
highlights:
  - value: "TBD"
    label: "Key metric"
---

## Context

TBD: the product or project context, who it serves, and why it started. What were the constraints?

## Problem

TBD: where users got stuck, which business metric it affected, and how you knew.

<Callout title="Problem statement">How might we help ___ to ___ when ___?</Callout>

## Research & insights

TBD: the methods you chose, why, and the two or three insights that mattered most.

<Figure alt="Research process (TBD)" caption="TBD: one sentence on what this image shows." />

## Ideation

TBD: which options you explored and why you dropped the others.

## Design & iteration

TBD: how the design evolved from lo-fi to hi-fi, and what testing changed.

<BeforeAfter beforeAlt="Before redesign (TBD)" afterAlt="After redesign (TBD)" caption="TBD: what changed." />

## Solution

TBD: the two or three core features and the problem each one solves.

## Results

TBD: quantitative and qualitative results; use test results if the product never shipped.

<MetricRow items={[{ value: 'TBD', label: 'Key result' }]} />

## Reflection

TBD: what you learned and what you would do differently.
```

```bash
mkdir -p "content/projects/_template/images" && touch "content/projects/_template/images/.gitkeep"
```

- [ ] **Step 6: 用腳本從範本產生 5 個案例資料夾**

```bash
cd "/c/Users/schang8/Desktop/離職前shawn 作品集/2026928 Shawn_Website"
node --input-type=module <<'EOF'
import { cpSync, readFileSync, writeFileSync } from 'node:fs'

const base = 'content/projects'
const projects = [
  { slug: 'openhci-2025', zh: '2025 OpenHCI', en: '2025 OpenHCI', year: 2025, order: 1, cardSize: '2x2', cardTone: 'violet-dark', tags: ['HCI', 'Prototyping'] },
  { slug: 'openhci-2026', zh: '2026 OpenHCI', en: '2026 OpenHCI', year: 2026, order: 2, cardSize: '2x2', cardTone: 'purple', tags: ['HCI', 'Prototyping'] },
  { slug: 'kansei-engineering-2026', zh: '2026 感性工學研究', en: '2026 Kansei Engineering', year: 2026, order: 3, cardSize: '1x2', cardTone: 'coral', tags: ['Kansei Engineering', 'Research'] },
  { slug: 'logitech-anywhere-ui', zh: 'Logitech Anywhere UI 設計', en: 'Logitech Anywhere UI Design', year: 2026, order: 4, cardSize: '2x2', cardTone: 'ink', tags: ['UI Design', 'Logitech'] },
  { slug: 'mental-health-app-testing-2024', zh: '心理健康 App 使用者測試', en: 'Mental Health App Usability Testing', year: 2024, order: 5, cardSize: '2x1', cardTone: 'lavender', tags: ['Usability Testing', 'UX Research'] },
]

for (const p of projects) {
  const dir = `${base}/${p.slug}`
  cpSync(`${base}/_template`, dir, { recursive: true })
  const meta = JSON.parse(readFileSync(`${dir}/meta.json`, 'utf8'))
  Object.assign(meta, { order: p.order, year: p.year, cardSize: p.cardSize, cardTone: p.cardTone, tags: p.tags })
  writeFileSync(`${dir}/meta.json`, JSON.stringify(meta, null, 2) + '\n')

  for (const [lang, titleLine, timelineLine] of [
    ['zh', 'title: 專案名稱（待補）', 'timeline: 待補'],
    ['en', 'title: Project name (TBD)', 'timeline: TBD'],
  ]) {
    const file = `${dir}/${lang}.mdx`
    const src = readFileSync(file, 'utf8')
      .replace(titleLine, `title: "${p[lang]}"`)
      .replace(timelineLine, `timeline: "${p.year}"`)
    writeFileSync(file, src)
  }
}
console.log('created', projects.length, 'projects')
EOF
```

Expected: `created 5 projects`。

- [ ] **Step 7: 建立 `scripts/validate-content.ts`**

```ts
/**
 * 建置前的內容驗證：檢查 content/ 內所有 JSON 與 MDX 是否符合 schema、圖片是否存在、圖片是否都有 alt。
 * 執行：npm run validate（npm run build 也會先執行它）
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import matter from 'gray-matter'
import type { z } from 'zod'
import {
  frontmatterSchema,
  homeSchema,
  profileSchema,
  projectMetaSchema,
  siteTextSchema,
  type SiteText,
} from '../src/content/schema'

const projectRoot = join(import.meta.dirname, '..')
const contentRoot = join(projectRoot, 'content')
const LANGS = ['zh', 'en'] as const

const errors: string[] = []
const warnings: string[] = []
const rel = (path: string) => relative(projectRoot, path).replaceAll('\\', '/')

function readJson(file: string): unknown {
  if (!existsSync(file)) {
    errors.push(`${rel(file)}\n  - 找不到檔案`)
    return undefined
  }
  try {
    return JSON.parse(readFileSync(file, 'utf8'))
  } catch (error) {
    errors.push(`${rel(file)}\n  - JSON 格式錯誤：${(error as Error).message}`)
    return undefined
  }
}

function check<T>(file: string, schema: z.ZodType<T>, data: unknown): T | undefined {
  if (data === undefined) return undefined
  const result = schema.safeParse(data)
  if (result.success) return result.data
  const lines = result.error.issues.map((i) => `  - ${i.path.join('.') || '(root)'}: ${i.message}`)
  errors.push(`${rel(file)}\n${lines.join('\n')}`)
  return undefined
}

// ---- 網站文字、個人資料、首頁卡片 ----
const siteDir = join(contentRoot, 'site')
const siteText: Partial<Record<(typeof LANGS)[number], SiteText>> = {}
for (const lang of LANGS) {
  const file = join(siteDir, `${lang}.json`)
  siteText[lang] = check(file, siteTextSchema, readJson(file))
}

const profileFile = join(siteDir, 'profile.json')
const profile = check(profileFile, profileSchema, readJson(profileFile))
if (profile && !existsSync(join(siteDir, profile.avatar))) {
  errors.push(`${rel(profileFile)}\n  - avatar: 找不到圖片 content/site/${profile.avatar}`)
}
if (profile) {
  for (const lang of LANGS) {
    const resume = join(projectRoot, 'public', profile.resume[lang])
    if (!existsSync(resume)) errors.push(`${rel(profileFile)}\n  - resume.${lang}: 找不到 public${profile.resume[lang]}`)
  }
}

const homeFile = join(siteDir, 'home.json')
const home = check(homeFile, homeSchema, readJson(homeFile))
for (const card of home?.cards ?? []) {
  for (const lang of LANGS) {
    const text = siteText[lang]
    if (!text) continue
    if (card.type === 'quote' && !text.quotes[card.index]) {
      errors.push(`${rel(homeFile)}\n  - ${card.id}: ${lang}.json 的 quotes 沒有第 ${card.index} 項（從 0 開始算）`)
    }
    if (card.type === 'stat' && !text.stats[card.index]) {
      errors.push(`${rel(homeFile)}\n  - ${card.id}: ${lang}.json 的 stats 沒有第 ${card.index} 項（從 0 開始算）`)
    }
  }
  if (card.type === 'photo' && !existsSync(join(siteDir, card.src))) {
    errors.push(`${rel(homeFile)}\n  - ${card.id}: 找不到圖片 content/site/${card.src}`)
  }
}

// ---- 案例 ----
const projectsDir = join(contentRoot, 'projects')
let projectCount = 0
for (const slug of readdirSync(projectsDir)) {
  const dir = join(projectsDir, slug)
  if (!statSync(dir).isDirectory()) continue
  if (!slug.startsWith('_')) projectCount++

  const metaFile = join(dir, 'meta.json')
  const meta = check(metaFile, projectMetaSchema, readJson(metaFile))
  if (meta?.cover && !existsSync(join(dir, meta.cover))) {
    errors.push(`${rel(metaFile)}\n  - cover: 找不到圖片 ${meta.cover}`)
  }

  const available = LANGS.filter((lang) => existsSync(join(dir, `${lang}.mdx`)))
  if (available.length === 0) errors.push(`${rel(dir)}\n  - 至少需要 zh.mdx 或 en.mdx 其中一個`)

  for (const lang of LANGS) {
    const file = join(dir, `${lang}.mdx`)
    if (!available.includes(lang)) {
      if (available.length) warnings.push(`${rel(dir)}：尚未提供 ${lang}.mdx（網站會顯示另一種語言的內容）`)
      continue
    }
    const { data, content } = matter(readFileSync(file, 'utf8'))
    check(file, frontmatterSchema, data)

    for (const [tag] of content.matchAll(/<Figure\b[^>]*>/g)) {
      if (!/\balt=/.test(tag)) errors.push(`${rel(file)}\n  - <Figure> 缺少 alt：${tag.slice(0, 80)}`)
    }
    if (/!\[\]\(/.test(content)) errors.push(`${rel(file)}\n  - Markdown 圖片缺少替代文字，請寫成 ![說明](路徑)`)
    for (const [, src] of content.matchAll(/(?:src|before|after)="([^"]+)"/g)) {
      if (!/^(https?:)?\//.test(src) && !existsSync(join(dir, src))) {
        errors.push(`${rel(file)}\n  - 找不到圖片 ${src}`)
      }
    }
  }
}

for (const warning of warnings) console.warn(`⚠ ${warning}`)
if (errors.length) {
  console.error(`\n✗ 內容驗證失敗（${errors.length} 個問題）：\n\n${errors.join('\n\n')}\n`)
  process.exit(1)
}
console.log(`✓ 內容驗證通過（${projectCount} 個案例）`)
```

- [ ] **Step 8: 驗證（包含故意弄壞內容）**

Run: `npm run validate` → Expected: `✓ 內容驗證通過（5 個案例）`，exit 0。
Run: `npm run typecheck` → Expected: exit 0。

弄壞內容的檢查（Review Focus #1）：暫時把 `content/projects/openhci-2025/zh.mdx` 的 `timeline: "2025"` 改成 `timeline: 2025`，執行 `npm run validate` → Expected: exit 1，訊息包含 `content/projects/openhci-2025/zh.mdx` 與 `timeline`。改回原樣後再執行一次 → 通過。
再暫時刪掉 `content/site/en.json` 最後一個 `}` → Expected: 出現 `JSON 格式錯誤`，並指出 `content/site/en.json`。改回原樣。

---

### Task 4: i18n 字典、路由骨架與頁面 meta

**Files:**
- Create: `src/i18n/zh.ts`, `src/i18n/en.ts`, `src/i18n/useI18n.ts`, `src/hooks/useDocumentMeta.ts`
- Create: `src/app/App.tsx`, `src/app/routes.tsx`, `src/app/RootRedirect.tsx`, `src/app/RouteError/RouteError.tsx`, `src/app/RouteError/RouteError.module.css`
- Create: `src/layout/LangLayout/LangLayout.tsx`
- Create: `src/pages/NotFoundPage/NotFoundPage.tsx`, `src/pages/NotFoundPage/NotFoundPage.module.css`
- Create（暫時版，之後的任務會取代）: `src/pages/HomePage/HomePage.tsx`, `src/pages/AboutPage/AboutPage.tsx`, `src/pages/CaseStudyPage/CaseStudyPage.tsx`, `src/pages/DesignSystemPage/DesignSystemPage.tsx`
- Modify: `src/main.tsx`（整個取代）

**Interfaces:**
- Consumes: `LANGS`、`isLang`、`detectLang`、`HTML_LANG`（Task 3 Step 1）；`getSiteText`（Task 3）
- Produces: `type Dict`、`zh`、`en`；`useLang(): Lang`、`useI18n(): { lang: Lang; t: Dict }`；`useDocumentMeta({ title?, description? })`；路由 `/`、`/:lang`、`/:lang/work/:slug`、`/:lang/about`、`/:lang/design-system`、`/:lang/*`；`LangLayout` 裡的 `SiteHeader`、`Footer`、`ScrollToTop` 在 Task 6 接上。每個頁面元件都是 named export：`HomePage`、`CaseStudyPage`、`AboutPage`、`DesignSystemPage`、`NotFoundPage`。

- [ ] **Step 1: 建立 `src/i18n/zh.ts`**

```ts
export const zh = {
  a11y: { skip: '跳到主要內容' },
  nav: { label: '篩選卡片', all: '全部', about: '關於', work: '作品', side: 'Side Quests' },
  header: {
    home: '回到首頁',
    settings: '顯示設定',
    smoothScroll: '平滑捲動',
    smoothScrollUnavailable: '系統已設定減少動態效果，無法開啟平滑捲動',
    themeLight: '淺色',
    themeDark: '深色',
    toDark: '切換為深色模式',
    toLight: '切換為淺色模式',
    langLabel: 'EN',
    switchLang: '切換為英文（English）',
  },
  home: { empty: '這個分類目前還沒有內容，敬請期待。' },
  card: { protected: '需要密碼', aboutMe: '更多關於我', viewProject: '查看案例' },
  quote: { label: 'MY DESIGN PRINCIPLE' },
  case: {
    back: '所有作品',
    role: '角色',
    timeline: '時程',
    team: '團隊',
    tools: '工具',
    highlights: '成果亮點',
    toc: '本頁內容',
    next: '下一個案例',
    loading: '載入中…',
    missingTranslation: '本頁尚未提供中文版，以下顯示英文內容。',
    placeholderImage: '待補圖片',
    before: '改版前',
    after: '改版後',
  },
  gate: {
    title: '這個案例受保密協議保護',
    desc: '請輸入密碼以繼續閱讀。如需密碼，歡迎來信索取。',
    label: '密碼',
    submit: '解鎖',
    error: '密碼不正確，請再試一次。',
  },
  about: { title: '關於我', experience: '經歷', education: '學歷', resume: '下載履歷', contact: '與我聯絡' },
  footer: { designSystem: 'Design System', rights: '保留所有權利' },
  notFound: { title: '找不到這個頁面', desc: '連結可能已失效，或頁面已經搬家了。', back: '回到首頁' },
  error: { title: '頁面發生錯誤', desc: '請重新整理頁面，或稍後再試。' },
  scrollTop: '回到頂部',
  ds: {
    title: 'Design System',
    intro: '這個網站的設計基礎：所有顏色、字級、間距與元件都來自同一組 Design Tokens。使用規則請見專案內的 DESIGN_GUIDELINE.md。',
    colors: '色彩',
    tones: '卡片主題色',
    typography: '字體',
    spacing: '間距',
    radius: '圓角',
    elevation: '陰影',
    grid: 'Bento 格線',
    components: '元件',
    light: '淺色',
    dark: '深色',
    sample: '設計 Design 123',
  },
}

export type Dict = typeof zh
```

- [ ] **Step 2: 建立 `src/i18n/en.ts`**

```ts
import type { Dict } from './zh'

export const en: Dict = {
  a11y: { skip: 'Skip to main content' },
  nav: { label: 'Filter cards', all: 'All', about: 'About', work: 'Work', side: 'Side Quests' },
  header: {
    home: 'Back to home',
    settings: 'Display settings',
    smoothScroll: 'Smooth scroll',
    smoothScrollUnavailable: 'Smooth scroll is off because your system prefers reduced motion',
    themeLight: 'Light',
    themeDark: 'Dark',
    toDark: 'Switch to dark mode',
    toLight: 'Switch to light mode',
    langLabel: '中文',
    switchLang: 'Switch to Chinese (中文)',
  },
  home: { empty: 'Nothing here yet — stay tuned.' },
  card: { protected: 'Password required', aboutMe: 'More about me', viewProject: 'View case study' },
  quote: { label: 'MY DESIGN PRINCIPLE' },
  case: {
    back: 'All work',
    role: 'Role',
    timeline: 'Timeline',
    team: 'Team',
    tools: 'Tools',
    highlights: 'Highlights',
    toc: 'On this page',
    next: 'Next case study',
    loading: 'Loading…',
    missingTranslation: "This page isn't available in English yet, so the Chinese version is shown below.",
    placeholderImage: 'Image coming soon',
    before: 'Before',
    after: 'After',
  },
  gate: {
    title: 'This case study is under NDA',
    desc: 'Enter the password to keep reading. Feel free to email me for access.',
    label: 'Password',
    submit: 'Unlock',
    error: "That password didn't work. Please try again.",
  },
  about: { title: 'About', experience: 'Experience', education: 'Education', resume: 'Download résumé', contact: 'Get in touch' },
  footer: { designSystem: 'Design System', rights: 'All rights reserved' },
  notFound: { title: 'Page not found', desc: 'The link may be broken, or the page has moved.', back: 'Back to home' },
  error: { title: 'Something went wrong', desc: 'Please refresh the page or try again later.' },
  scrollTop: 'Back to top',
  ds: {
    title: 'Design System',
    intro: 'The foundations of this site: every color, type size, spacing value and component comes from one set of design tokens. See DESIGN_GUIDELINE.md in the repo for usage rules.',
    colors: 'Color',
    tones: 'Card tones',
    typography: 'Typography',
    spacing: 'Spacing',
    radius: 'Radius',
    elevation: 'Elevation',
    grid: 'Bento grid',
    components: 'Components',
    light: 'Light',
    dark: 'Dark',
    sample: 'Design 設計 123',
  },
}
```

- [ ] **Step 3: 建立 `src/i18n/useI18n.ts` 與 `src/hooks/useDocumentMeta.ts`**

`src/i18n/useI18n.ts`：
```ts
import { useParams } from 'react-router'
import { isLang, type Lang } from './langs'
import { en } from './en'
import { zh, type Dict } from './zh'

const DICTS: Record<Lang, Dict> = { zh, en }

/** 網址的 :lang 是語言的唯一真實來源；不在語言路由底下時預設為 zh。 */
export function useLang(): Lang {
  const { lang } = useParams()
  return isLang(lang) ? lang : 'zh'
}

export function useI18n(): { lang: Lang; t: Dict } {
  const lang = useLang()
  return { lang, t: DICTS[lang] }
}
```

`src/hooks/useDocumentMeta.ts`：
```ts
import { useEffect } from 'react'
import { getSiteText } from '../content/site'
import { useLang } from '../i18n/useI18n'

/** 設定每頁的 <title> 與 meta description；沒有 title 時使用網站標題。 */
export function useDocumentMeta({ title, description }: { title?: string; description?: string } = {}) {
  const lang = useLang()
  const site = getSiteText(lang)
  useEffect(() => {
    document.title = title ? `${title} — ${site.meta.title}` : site.meta.title
    document.querySelector('meta[name="description"]')?.setAttribute('content', description ?? site.meta.description)
  }, [title, description, site])
}
```

- [ ] **Step 4: 建立路由相關元件**

`src/app/RootRedirect.tsx`：
```tsx
import { Navigate, useLocation } from 'react-router'
import { detectLang } from '../i18n/langs'

export function RootRedirect() {
  const { search } = useLocation()
  return <Navigate to={`/${detectLang()}${search}`} replace />
}
```

`src/app/RouteError/RouteError.module.css`：
```css
.page {
  padding-block: var(--space-16);
}
.title {
  font-size: var(--text-xl);
}
.desc {
  margin-top: var(--space-3);
  color: var(--color-text-muted);
}
.details {
  margin-top: var(--space-6);
  padding: var(--space-4);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  font-size: var(--text-sm);
  white-space: pre-wrap;
  overflow-x: auto;
}
```

`src/app/RouteError/RouteError.tsx`：
```tsx
import { useRouteError } from 'react-router'
import { useI18n } from '../../i18n/useI18n'
import { cx } from '../../lib/cx'
import styles from './RouteError.module.css'

/** 路由層級的錯誤畫面。開發模式下會顯示完整訊息（例如內容驗證失敗的檔案與欄位）。 */
export function RouteError() {
  const error = useRouteError()
  const { t } = useI18n()
  const message = error instanceof Error ? error.message : String(error)
  return (
    <div className={cx('container', styles.page)} role="alert">
      <h1 className={styles.title}>{t.error.title}</h1>
      <p className={styles.desc}>{t.error.desc}</p>
      {import.meta.env.DEV && <pre className={styles.details}>{message}</pre>}
    </div>
  )
}
```

`src/layout/LangLayout/LangLayout.tsx`（Task 6 會加上 Header / Footer / ScrollToTop）：
```tsx
import { useEffect } from 'react'
import { Navigate, Outlet, ScrollRestoration, useParams } from 'react-router'
import { detectLang, HTML_LANG, isLang } from '../../i18n/langs'
import { useI18n } from '../../i18n/useI18n'

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
      <main id="main" tabIndex={-1}>
        <Outlet />
      </main>
      <ScrollRestoration />
    </>
  )
}
```

`src/app/routes.tsx`：
```tsx
import { createBrowserRouter } from 'react-router'
import { LangLayout } from '../layout/LangLayout/LangLayout'
import { AboutPage } from '../pages/AboutPage/AboutPage'
import { HomePage } from '../pages/HomePage/HomePage'
import { NotFoundPage } from '../pages/NotFoundPage/NotFoundPage'
import { RootRedirect } from './RootRedirect'
import { RouteError } from './RouteError/RouteError'

export const router = createBrowserRouter([
  { path: '/', element: <RootRedirect /> },
  {
    path: '/:lang',
    element: <LangLayout />,
    errorElement: <RouteError />,
    children: [
      {
        errorElement: <RouteError />,
        children: [
          { index: true, element: <HomePage /> },
          {
            path: 'work/:slug',
            lazy: async () => ({ Component: (await import('../pages/CaseStudyPage/CaseStudyPage')).CaseStudyPage }),
          },
          { path: 'about', element: <AboutPage /> },
          {
            path: 'design-system',
            lazy: async () => ({
              Component: (await import('../pages/DesignSystemPage/DesignSystemPage')).DesignSystemPage,
            }),
          },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
])
```
（內層沒有 path 的 route 加上 `errorElement`，這樣頁面出錯時 Header 仍然保留。）

`src/app/App.tsx`：
```tsx
import { RouterProvider } from 'react-router'
import { router } from './routes'

export function App() {
  return <RouterProvider router={router} />
}
```

- [ ] **Step 5: 建立 `NotFoundPage` 與暫時版頁面**

`src/pages/NotFoundPage/NotFoundPage.module.css`：
```css
.page {
  padding-block: var(--space-16);
  text-align: center;
}
.code {
  font-size: var(--text-display);
  font-weight: var(--weight-semibold);
  color: var(--color-accent);
}
.title {
  margin-top: var(--space-2);
  font-size: var(--text-xl);
}
.desc {
  margin-top: var(--space-3);
  color: var(--color-text-muted);
}
.back {
  display: inline-block;
  margin-top: var(--space-8);
}
```

`src/pages/NotFoundPage/NotFoundPage.tsx`（Task 5 會把連結換成 `ButtonLink`）：
```tsx
import { Link } from 'react-router'
import { useDocumentMeta } from '../../hooks/useDocumentMeta'
import { useI18n } from '../../i18n/useI18n'
import { cx } from '../../lib/cx'
import styles from './NotFoundPage.module.css'

export function NotFoundPage() {
  const { lang, t } = useI18n()
  useDocumentMeta({ title: t.notFound.title })
  return (
    <div className={cx('container', styles.page)}>
      <p className={styles.code} aria-hidden="true">404</p>
      <h1 className={styles.title}>{t.notFound.title}</h1>
      <p className={styles.desc}>{t.notFound.desc}</p>
      <Link className={styles.back} to={`/${lang}`}>
        {t.notFound.back}
      </Link>
    </div>
  )
}
```

暫時版頁面（各自一個檔案，之後的任務會整個取代）：

`src/pages/HomePage/HomePage.tsx`：
```tsx
export function HomePage() {
  return <p className="container">Home</p>
}
```
`src/pages/AboutPage/AboutPage.tsx`：
```tsx
export function AboutPage() {
  return <p className="container">About</p>
}
```
`src/pages/CaseStudyPage/CaseStudyPage.tsx`：
```tsx
export function CaseStudyPage() {
  return <p className="container">Case study</p>
}
```
`src/pages/DesignSystemPage/DesignSystemPage.tsx`：
```tsx
export function DesignSystemPage() {
  return <p className="container">Design System</p>
}
```

- [ ] **Step 6: 取代 `src/main.tsx`**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'lenis/dist/lenis.css'
import './styles/tokens.css'
import './styles/themes.css'
import './styles/tones.css'
import './styles/global.css'
import { App } from './app/App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 7: 驗證**

Run: `npm run typecheck` → Expected: exit 0。
在 dev server 檢查：
- `http://localhost:5173/` → 導向 `/zh`（瀏覽器語言為中文時）或 `/en`，顯示「Home」、米白底 `#F0EDE8`。
- `/zh/about`、`/zh/work/openhci-2025`、`/zh/design-system` → 分別顯示暫時文字。
- `/zh/nope` → 顯示 404 頁；`/xx` → 導向 `/zh/404` 或 `/en/404`。
- `<html lang>` 在 `/en` 為 `en`，在 `/zh` 為 `zh-Hant`。

- [ ] **Step 8: 錯誤畫面檢查（Review Focus #1）**

暫時把 `content/site/profile.json` 的 `"email"` 改成 `"not-an-email"`，重新整理 `/zh`。這時 `HomePage` 還不會讀取 profile，所以要在 `src/pages/HomePage/HomePage.tsx` 暫時加上一行 `getProfile()` 呼叫（Task 7 會取代這個檔案）。Expected: 顯示「頁面發生錯誤」，下方有 `/content/site/profile.json` 與 `email` 的錯誤訊息。還原兩個檔案。

---

### Task 5: 基礎 UI 元件（Icon、Button、Pill、Tag、Card）與進場動畫

**Files:**
- Create: `src/ui/Icon/Icon.tsx`
- Create: `src/ui/Button/Button.tsx`, `src/ui/Button/Button.module.css`
- Create: `src/ui/Pill/Pill.tsx`, `src/ui/Pill/Pill.module.css`
- Create: `src/ui/Tag/Tag.tsx`, `src/ui/Tag/Tag.module.css`
- Create: `src/ui/Card/Card.tsx`, `src/ui/Card/Card.module.css`
- Create: `src/hooks/useReveal.ts`, `src/hooks/useReducedMotion.ts`
- Modify: `src/pages/NotFoundPage/NotFoundPage.tsx`（改用 `ButtonLink`）

**Interfaces:**
- Consumes: `cx`、`CardSize`、`CardTone`
- Produces:
  - `Icon({ name: IconName; size?: number; label?: string })`，`IconName` = `'mail' | 'linkedin' | 'sun' | 'moon' | 'wave' | 'globe' | 'lock' | 'arrowUp' | 'arrowRight' | 'arrowLeft' | 'sliders' | 'download' | 'close' | 'quote'`
  - `Button(props: ButtonHTMLAttributes & { variant?: 'primary' | 'secondary' | 'ghost'; icon?: IconName })`
  - `ButtonLink({ to?: string; href?: string; download?: boolean; variant?; icon?; iconPosition?: 'start' | 'end'; children })`：`to` 為站內連結，`href` 為外部、mailto 或檔案連結
  - `Pill`：`{ active?: boolean; icon?: IconName; variant?: 'ghost' | 'outlined'; children; className? }`，加上 `{ to: string; onClick?; 'aria-label'? }`（Link）或 `ButtonHTMLAttributes`（button）
  - `Tag({ children, tone?: 'default' | 'onTone' })`
  - `Card({ size?: CardSize; tone?: CardTone; href?: string; label?: string; className?: string; children })`
  - `useReveal<T extends HTMLElement>(): { ref: RefObject<T | null>; shown: boolean }`
  - `useReducedMotion(): boolean`、`prefersReducedMotion(): boolean`

- [ ] **Step 1: 建立 `src/hooks/useReducedMotion.ts` 與 `src/hooks/useReveal.ts`**

`src/hooks/useReducedMotion.ts`：
```ts
import { useEffect, useState } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

export function prefersReducedMotion(): boolean {
  return window.matchMedia(QUERY).matches
}

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(prefersReducedMotion)
  useEffect(() => {
    const media = window.matchMedia(QUERY)
    const onChange = () => setReduced(media.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])
  return reduced
}
```

`src/hooks/useReveal.ts`：
```ts
import { useEffect, useRef, useState } from 'react'

/** 元素第一次進入畫面時 shown 變成 true（只觸發一次），用於卡片進場動畫。 */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || shown) return
    if (!('IntersectionObserver' in window)) {
      setShown(true)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true)
          observer.disconnect()
        }
      },
      { rootMargin: '0px 0px -8% 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [shown])

  return { ref, shown }
}
```

- [ ] **Step 2: 建立 `src/ui/Icon/Icon.tsx`**

```tsx
type IconDef = { d: string; filled?: boolean }

const ICONS = {
  mail: { d: 'M3 6.5A1.5 1.5 0 0 1 4.5 5h15A1.5 1.5 0 0 1 21 6.5v11a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5z M3.5 6.5 12 13l8.5-6.5' },
  linkedin: {
    filled: true,
    d: 'M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.75h4V21H3zM9.5 9.75h3.8v1.6h.06c.53-1 1.84-2.05 3.78-2.05 4.04 0 4.79 2.66 4.79 6.12V21h-4v-4.98c0-1.19-.02-2.72-1.66-2.72-1.66 0-1.91 1.3-1.91 2.63V21h-4z',
  },
  sun: { d: 'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M12 2.5v2 M12 19.5v2 M4.6 4.6 6 6 M18 18l1.4 1.4 M2.5 12h2 M19.5 12h2 M4.6 19.4 6 18 M18 6l1.4-1.4' },
  moon: { d: 'M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z' },
  wave: { d: 'M2 12c1.7-2.7 3.3-2.7 5 0s3.3 2.7 5 0 3.3-2.7 5 0 3.3 2.7 5 0' },
  globe: { d: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M3 12h18 M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9 M12 3C9.5 5.6 8.2 8.6 8.2 12s1.3 6.4 3.8 9' },
  lock: { d: 'M6 11h12v9.5H6z M8.5 11V8a3.5 3.5 0 0 1 7 0v3' },
  arrowUp: { d: 'M12 19V5 M5.5 11.5 12 5l6.5 6.5' },
  arrowRight: { d: 'M5 12h14 M12.5 5.5 19 12l-6.5 6.5' },
  arrowLeft: { d: 'M19 12H5 M11.5 5.5 5 12l6.5 6.5' },
  sliders: { d: 'M4 7h9 M17 7h3 M15 5v4 M4 17h3 M11 17h9 M9 15v4' },
  download: { d: 'M12 4v11 M7 10.5l5 5 5-5 M5 20h14' },
  close: { d: 'M6 6l12 12 M18 6 6 18' },
  quote: {
    filled: true,
    d: 'M9.6 6C6.5 7.3 4.5 10 4.5 13.4V18h5.8v-5.6H7.6c.2-1.9 1.4-3.4 3.2-4.3zm9 0c-3.1 1.3-5.1 4-5.1 7.4V18h5.8v-5.6h-2.7c.2-1.9 1.4-3.4 3.2-4.3z',
  },
} satisfies Record<string, IconDef>

export type IconName = keyof typeof ICONS

type IconProps = {
  name: IconName
  size?: number
  /** 有 label 時對螢幕閱讀器宣告為圖片；沒有時視為裝飾。 */
  label?: string
}

export function Icon({ name, size = 20, label }: IconProps) {
  const icon: IconDef = ICONS[name]
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={icon.filled ? 'currentColor' : 'none'}
      stroke={icon.filled ? 'none' : 'currentColor'}
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      <path d={icon.d} />
    </svg>
  )
}
```

- [ ] **Step 3: 建立 Button**

`src/ui/Button/Button.module.css`：
```css
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  min-height: 44px;
  padding: 0 var(--space-5);
  border-radius: var(--radius-pill);
  border: 1px solid transparent;
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  text-decoration: none;
  white-space: nowrap;
  transition:
    background-color var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-out),
    box-shadow var(--duration-fast) var(--ease-out);
}
.button:active { transform: scale(0.98); }
.button:disabled { opacity: 0.5; cursor: not-allowed; }

.primary {
  background: var(--color-text);
  color: var(--color-bg);
}
.primary:hover:not(:disabled) { box-shadow: var(--shadow-card-hover); }

.secondary {
  background: var(--color-surface);
  border-color: var(--color-border);
  color: var(--color-text);
}
.secondary:hover:not(:disabled) { background: var(--color-surface-raised); }

.ghost {
  background: transparent;
  color: var(--color-text);
}
.ghost:hover:not(:disabled) { background: color-mix(in srgb, var(--color-text) 6%, transparent); }
```

`src/ui/Button/Button.tsx`：
```tsx
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router'
import { cx } from '../../lib/cx'
import { Icon, type IconName } from '../Icon/Icon'
import styles from './Button.module.css'

type Variant = 'primary' | 'secondary' | 'ghost'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; icon?: IconName }

export function Button({ variant = 'primary', icon, className, children, type = 'button', ...rest }: ButtonProps) {
  return (
    <button type={type} className={cx(styles.button, styles[variant], className)} {...rest}>
      {icon && <Icon name={icon} size={18} />}
      {children}
    </button>
  )
}

type ButtonLinkProps = {
  /** 站內路徑，例如 /zh/about */
  to?: string
  /** 外部網址、mailto: 或檔案 */
  href?: string
  download?: boolean
  variant?: Variant
  icon?: IconName
  iconPosition?: 'start' | 'end'
  className?: string
  children: ReactNode
}

export function ButtonLink({ to, href, download, variant = 'primary', icon, iconPosition = 'start', className, children }: ButtonLinkProps) {
  const content = (
    <>
      {icon && iconPosition === 'start' && <Icon name={icon} size={18} />}
      {children}
      {icon && iconPosition === 'end' && <Icon name={icon} size={18} />}
    </>
  )
  const classes = cx(styles.button, styles[variant], className)
  if (to) {
    return (
      <Link to={to} className={classes}>
        {content}
      </Link>
    )
  }
  const external = href?.startsWith('http')
  return (
    <a href={href} className={classes} download={download || undefined} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined}>
      {content}
    </a>
  )
}
```

- [ ] **Step 4: 建立 Pill 與 Tag**

`src/ui/Pill/Pill.module.css`：
```css
.pill {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  min-height: 40px;
  padding: 0 var(--space-4);
  border-radius: var(--radius-pill);
  border: 1px solid transparent;
  background: transparent;
  color: var(--color-text);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  text-decoration: none;
  white-space: nowrap;
  transition:
    background-color var(--duration-fast) var(--ease-out),
    box-shadow var(--duration-fast) var(--ease-out);
}
.pill:hover { background: color-mix(in srgb, var(--color-text) 6%, transparent); }
.pill:disabled { opacity: 0.5; cursor: not-allowed; }

.outlined {
  background: var(--color-surface);
  border-color: var(--color-border);
}
.outlined:hover { background: var(--color-surface-raised); }

.active,
.pill[aria-pressed='true'] {
  background: var(--color-surface-raised);
  box-shadow: var(--shadow-card);
}
```

`src/ui/Pill/Pill.tsx`：
```tsx
import type { ButtonHTMLAttributes, MouseEventHandler, ReactNode } from 'react'
import { Link } from 'react-router'
import { cx } from '../../lib/cx'
import { Icon, type IconName } from '../Icon/Icon'
import styles from './Pill.module.css'

type BaseProps = {
  active?: boolean
  icon?: IconName
  variant?: 'ghost' | 'outlined'
  className?: string
  children: ReactNode
}

type LinkPillProps = BaseProps & {
  to: string
  onClick?: MouseEventHandler<HTMLAnchorElement>
  'aria-label'?: string
}

type ButtonPillProps = BaseProps & { to?: undefined } & ButtonHTMLAttributes<HTMLButtonElement>

export type PillProps = LinkPillProps | ButtonPillProps

function pillClass(variant: BaseProps['variant'], active: boolean | undefined, className?: string) {
  return cx(styles.pill, variant === 'outlined' && styles.outlined, active && styles.active, className)
}

/** 膠囊按鈕：有 to 時是連結（active 時標記 aria-current），否則是 button。 */
export function Pill(props: PillProps) {
  if (props.to !== undefined) {
    const { to, active, icon, variant = 'ghost', className, children, onClick } = props
    return (
      <Link to={to} className={pillClass(variant, active, className)} aria-current={active ? 'page' : undefined} onClick={onClick} aria-label={props['aria-label']}>
        {icon && <Icon name={icon} size={16} />}
        {children}
      </Link>
    )
  }

  // 解構出來但沒用到的 to 是為了不讓它進入 ...buttonProps（有 rest 時 TS 不會報 unused）
  const { to: _to, active, icon, variant = 'ghost', className, children, type = 'button', ...buttonProps } = props
  return (
    <button type={type} className={pillClass(variant, active, className)} {...buttonProps}>
      {icon && <Icon name={icon} size={16} />}
      {children}
    </button>
  )
}
```

`src/ui/Tag/Tag.module.css`：
```css
.tag {
  display: inline-flex;
  align-items: center;
  padding: 2px var(--space-3);
  border-radius: var(--radius-pill);
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  line-height: 1.8;
  letter-spacing: 0.02em;
  white-space: nowrap;
}
.default {
  background: color-mix(in srgb, var(--color-text) 7%, transparent);
  color: var(--color-text-muted);
}
.onTone {
  background: color-mix(in srgb, var(--tone-fg) 16%, transparent);
  color: var(--tone-fg);
}
```

`src/ui/Tag/Tag.tsx`：
```tsx
import type { ReactNode } from 'react'
import { cx } from '../../lib/cx'
import styles from './Tag.module.css'

/** tone="onTone" 用於彩色卡片上（跟著 --tone-fg 變色）。 */
export function Tag({ children, tone = 'default' }: { children: ReactNode; tone?: 'default' | 'onTone' }) {
  return <span className={cx(styles.tag, styles[tone])}>{children}</span>
}
```

- [ ] **Step 5: 建立 Card**

`src/ui/Card/Card.module.css`：
```css
.card {
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
  border-radius: var(--radius-card);
  border: 1px solid var(--color-border);
  background: var(--tone-bg, var(--color-surface));
  color: var(--tone-fg, var(--color-text));
  box-shadow: var(--shadow-card);
  text-decoration: none;
  transition:
    transform var(--duration-base) var(--ease-out),
    box-shadow var(--duration-base) var(--ease-out),
    background-color var(--duration-base) var(--ease-out);
}
.card:not([data-tone='surface']) { border-color: transparent; }

/* 進場動畫只動 opacity 與 translate，不和 hover 的 transform 衝突 */
.card:not([data-shown]) { opacity: 0; }
.card[data-shown] {
  animation: reveal 600ms var(--ease-out) var(--reveal-delay, 0ms) both;
}
@keyframes reveal {
  from { opacity: 0; translate: 0 16px; }
  to { opacity: 1; translate: 0 0; }
}

.interactive:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-card-hover);
}
.interactive:active { transform: translateY(-1px) scale(0.99); }
.interactive:focus-visible {
  outline-offset: 4px;
  border-radius: var(--radius-card);
}

/* 格線位置：平板與桌機依尺寸跨欄／跨列 */
@media (min-width: 640px) {
  .card[data-size='2x1'],
  .card[data-size='2x2'] { grid-column: span 2; }
  .card[data-size='1x2'],
  .card[data-size='2x2'] { grid-row: span 2; }
}

/* 手機單欄：用最小高度維持比例，內容多時可以長高 */
@media (max-width: 639px) {
  .card[data-size='1x1'],
  .card[data-size='2x1'] { min-height: calc((100vw - 2 * var(--gutter)) / 2); }
  .card[data-size='1x2'],
  .card[data-size='2x2'] { min-height: calc(100vw - 2 * var(--gutter)); }
}

@media (prefers-reduced-motion: reduce) {
  .card:not([data-shown]) { opacity: 1; }
  .card[data-shown] { animation: none; }
  .interactive:hover,
  .interactive:active { transform: none; }
}
```

`src/ui/Card/Card.tsx`：
```tsx
import type { ReactNode, Ref } from 'react'
import { Link } from 'react-router'
import { useReveal } from '../../hooks/useReveal'
import { cx } from '../../lib/cx'
import type { CardSize, CardTone } from '../../styles/tokens'
import styles from './Card.module.css'

type CardProps = {
  size?: CardSize
  tone?: CardTone
  /** 有值時整張卡片可點擊：站內路徑用 Link，http / mailto 用 <a>。 */
  href?: string
  /** 可點擊卡片的無障礙名稱（卡片內容不足以說明去向時使用）。 */
  label?: string
  className?: string
  children: ReactNode
}

const isExternal = (href: string) => /^(https?:|mailto:)/.test(href)

export function Card({ size = '1x1', tone = 'surface', href, label, className, children }: CardProps) {
  const { ref, shown } = useReveal<HTMLElement>()
  const common = {
    className: cx(styles.card, href && styles.interactive, className),
    'data-size': size,
    'data-tone': tone,
    'data-shown': shown || undefined,
    'aria-label': label,
  }

  if (!href) {
    return (
      <div ref={ref as Ref<HTMLDivElement>} {...common}>
        {children}
      </div>
    )
  }
  if (isExternal(href)) {
    const newTab = href.startsWith('http')
    return (
      <a ref={ref as Ref<HTMLAnchorElement>} href={href} target={newTab ? '_blank' : undefined} rel={newTab ? 'noreferrer' : undefined} {...common}>
        {children}
      </a>
    )
  }
  return (
    <Link ref={ref as Ref<HTMLAnchorElement>} to={href} {...common}>
      {children}
    </Link>
  )
}
```

- [ ] **Step 6: NotFoundPage 改用 ButtonLink**

在 `src/pages/NotFoundPage/NotFoundPage.tsx` 中，把 `import { Link } from 'react-router'` 換成 `import { ButtonLink } from '../../ui/Button/Button'`，並把連結換成：
```tsx
      <ButtonLink className={styles.back} to={`/${lang}`} icon="arrowLeft">
        {t.notFound.back}
      </ButtonLink>
```

- [ ] **Step 7: 驗證**

Run: `npm run typecheck` → Expected: exit 0。
開啟 `/zh/nope` → 404 頁的按鈕為深色膠囊，按 Tab 時出現紫色焦點框。

---

### Task 6: 版面外框：Header、篩選導覽、主題、語言、平滑捲動、Footer、回到頂部

**Files:**
- Create: `src/hooks/useTheme.ts`, `src/hooks/useSmoothScroll.ts`
- Create: `src/layout/SiteHeader/SiteHeader.tsx`, `src/layout/SiteHeader/SiteHeader.module.css`
- Create: `src/layout/FilterNav/FilterNav.tsx`, `src/layout/FilterNav/FilterNav.module.css`
- Create: `src/layout/HeaderControls/HeaderControls.tsx`
- Create: `src/layout/Footer/Footer.tsx`, `src/layout/Footer/Footer.module.css`
- Create: `src/layout/ScrollToTop/ScrollToTop.tsx`, `src/layout/ScrollToTop/ScrollToTop.module.css`
- Modify: `src/layout/LangLayout/LangLayout.tsx`（加入 Header / Footer / ScrollToTop）

**Interfaces:**
- Consumes: `Pill`、`Icon`、`readStorage` / `writeStorage`、`useReducedMotion`、`prefersReducedMotion`、`parseFilter`、`FILTERS`、`getProfile`、`LANG_STORAGE_KEY`
- Produces: `useTheme(): { theme: 'light' | 'dark'; toggle(): void }`、`useSmoothScroll(): { enabled: boolean; available: boolean; toggle(): void }`、`scrollToTop(): void`、元件 `SiteHeader`、`Footer`、`ScrollToTop`

- [ ] **Step 1: 建立 `src/hooks/useTheme.ts`**

```ts
import { useEffect, useState } from 'react'
import { readStorage, writeStorage } from '../lib/storage'

export type Theme = 'light' | 'dark'
const KEY = 'theme'
const DARK_QUERY = '(prefers-color-scheme: dark)'

function systemTheme(): Theme {
  return window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light'
}

/** index.html 的腳本已在渲染前設好 data-theme；這裡負責切換、記住，以及在沒有手動選擇時跟隨系統。 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => (document.documentElement.dataset.theme as Theme) ?? systemTheme())

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  useEffect(() => {
    const media = window.matchMedia(DARK_QUERY)
    const onChange = () => {
      const saved = readStorage(KEY)
      if (saved !== 'light' && saved !== 'dark') setTheme(systemTheme())
    }
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    writeStorage(KEY, next)
    setTheme(next)
  }

  return { theme, toggle }
}
```

- [ ] **Step 2: 建立 `src/hooks/useSmoothScroll.ts`**

```ts
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
```

- [ ] **Step 3: 建立 FilterNav**

`src/layout/FilterNav/FilterNav.module.css`：
```css
.nav {
  min-width: 0;
}
.list {
  display: flex;
  gap: var(--space-1);
  padding: var(--space-1);
  list-style: none;
  border-radius: var(--radius-pill);
  background: color-mix(in srgb, var(--color-surface) 75%, transparent);
  border: 1px solid var(--color-border);
  overflow-x: auto;
  scrollbar-width: none;
}
.list::-webkit-scrollbar { display: none; }

@media (max-width: 899px) {
  .list { width: 100%; }
  .list > li { flex: 1 0 auto; }
  .list > li > a { width: 100%; justify-content: center; }
}
```

`src/layout/FilterNav/FilterNav.tsx`：
```tsx
import { FILTERS, type Filter } from '../../content/wall'
import { useI18n } from '../../i18n/useI18n'
import { Pill } from '../../ui/Pill/Pill'
import styles from './FilterNav.module.css'

/** 首頁卡片篩選。active 為 null 表示不在首頁（連結會帶使用者回首頁並套用篩選）。 */
export function FilterNav({ active }: { active: Filter | null }) {
  const { lang, t } = useI18n()
  return (
    <nav className={styles.nav} aria-label={t.nav.label}>
      <ul className={styles.list}>
        {FILTERS.map((filter) => (
          <li key={filter}>
            <Pill to={filter === 'all' ? `/${lang}` : `/${lang}?filter=${filter}`} active={active === filter}>
              {t.nav[filter]}
            </Pill>
          </li>
        ))}
      </ul>
    </nav>
  )
}
```

- [ ] **Step 4: 建立 HeaderControls**

`src/layout/HeaderControls/HeaderControls.tsx`：
```tsx
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
```

- [ ] **Step 5: 建立 SiteHeader**

`src/layout/SiteHeader/SiteHeader.module.css`：
```css
.header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: color-mix(in srgb, var(--color-bg) 82%, transparent);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.inner {
  position: relative;
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-areas:
    'logo menu'
    'nav nav';
  align-items: center;
  gap: var(--space-3) var(--space-4);
  max-width: 1280px;
  margin-inline: auto;
  padding: var(--space-3) var(--gutter);
}

.logo {
  grid-area: logo;
  justify-self: start;
  font-size: 1.5rem;
  font-weight: var(--weight-semibold);
  letter-spacing: -0.02em;
  text-decoration: none;
  color: var(--color-text);
}
.dot { color: var(--color-accent); }

.nav { grid-area: nav; min-width: 0; }

.menuButton {
  grid-area: menu;
  display: inline-grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
}

.controls {
  position: absolute;
  top: calc(var(--space-3) + 48px);
  right: var(--gutter);
  display: none;
  flex-direction: column;
  align-items: stretch;
  gap: var(--space-2);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-surface-raised);
  box-shadow: var(--shadow-card-hover);
}
.controls[data-open] { display: flex; }

@media (min-width: 900px) {
  .inner {
    grid-template-columns: 1fr auto 1fr;
    grid-template-areas: 'logo nav controls';
    padding-block: var(--space-4);
  }
  .menuButton { display: none; }
  .controls {
    grid-area: controls;
    position: static;
    display: flex;
    flex-direction: row;
    justify-self: end;
    padding: 0;
    border: 0;
    background: none;
    box-shadow: none;
  }
}
```

`src/layout/SiteHeader/SiteHeader.tsx`：
```tsx
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { parseFilter } from '../../content/wall'
import { useI18n } from '../../i18n/useI18n'
import { Icon } from '../../ui/Icon/Icon'
import { FilterNav } from '../FilterNav/FilterNav'
import { HeaderControls } from '../HeaderControls/HeaderControls'
import styles from './SiteHeader.module.css'

export function SiteHeader() {
  const { lang, t } = useI18n()
  const { pathname, search } = useLocation()
  const [open, setOpen] = useState(false)

  const isHome = pathname.replace(/\/$/, '') === `/${lang}`
  const activeFilter = isHome ? parseFilter(new URLSearchParams(search).get('filter')) : null

  useEffect(() => setOpen(false), [pathname, search])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to={`/${lang}`} className={styles.logo} aria-label={t.header.home}>
          SC<span className={styles.dot}>.</span>
        </Link>
        <div className={styles.nav}>
          <FilterNav active={activeFilter} />
        </div>
        <button type="button" className={styles.menuButton} aria-expanded={open} aria-controls="site-controls" onClick={() => setOpen((v) => !v)}>
          <Icon name={open ? 'close' : 'sliders'} />
          <span className="visually-hidden">{t.header.settings}</span>
        </button>
        <div id="site-controls" className={styles.controls} data-open={open || undefined}>
          <HeaderControls />
        </div>
      </div>
    </header>
  )
}
```

- [ ] **Step 6: 建立 Footer 與 ScrollToTop**

`src/layout/Footer/Footer.module.css`：
```css
.footer {
  margin-top: var(--space-16);
  padding-block: var(--space-8);
  border-top: 1px solid var(--color-border);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}
.inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
}
.links {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-5);
  list-style: none;
  padding: 0;
}
.links a {
  text-decoration: none;
}
.links a:hover {
  color: var(--color-text);
  text-decoration: underline;
}
```

`src/layout/Footer/Footer.tsx`：
```tsx
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
```

`src/layout/ScrollToTop/ScrollToTop.module.css`：
```css
.button {
  position: fixed;
  right: var(--gutter);
  bottom: var(--gutter);
  z-index: 40;
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--color-border);
  background: var(--color-surface-raised);
  box-shadow: var(--shadow-card-hover);
  opacity: 0;
  translate: 0 12px;
  pointer-events: none;
  transition:
    opacity var(--duration-base) var(--ease-out),
    translate var(--duration-base) var(--ease-out);
}
.visible {
  opacity: 1;
  translate: 0 0;
  pointer-events: auto;
}
```

`src/layout/ScrollToTop/ScrollToTop.tsx`：
```tsx
import { useEffect, useState } from 'react'
import { scrollToTop } from '../../hooks/useSmoothScroll'
import { useI18n } from '../../i18n/useI18n'
import { cx } from '../../lib/cx'
import { Icon } from '../../ui/Icon/Icon'
import styles from './ScrollToTop.module.css'

export function ScrollToTop() {
  const { t } = useI18n()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <button type="button" className={cx(styles.button, visible && styles.visible)} onClick={scrollToTop} aria-label={t.scrollTop} tabIndex={visible ? 0 : -1} aria-hidden={!visible}>
      <Icon name="arrowUp" />
    </button>
  )
}
```

- [ ] **Step 7: 修改 `src/layout/LangLayout/LangLayout.tsx`**

加入以下 imports：
```tsx
import { Footer } from '../Footer/Footer'
import { ScrollToTop } from '../ScrollToTop/ScrollToTop'
import { SiteHeader } from '../SiteHeader/SiteHeader'
```
並把 return 改成：
```tsx
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
      <ScrollRestoration />
    </>
  )
```

- [ ] **Step 8: 驗證**

Run: `npm run typecheck` → Expected: exit 0。
Dev server，1280px 寬度：Logo 在左，四個篩選膠囊置中，右側三個設定膠囊；點「深色」後整頁變深色，重新整理後仍然是深色，而且沒有先閃白。點「EN」後網址從 `/zh` 變成 `/en`，所有 UI 文字變英文；在 `/zh/about` 點「EN」會變成 `/en/about`。
375px 寬度：第一列是 Logo 和設定按鈕，第二列是滿版的篩選膠囊；點設定按鈕會展開面板，按 Esc 會關閉，焦點框可見。

- [ ] **Step 9: 邊界狀況檢查（Review Focus #4、#5）**

- 用 Playwright `browser_emulate_media` 設 `reducedMotion: 'reduce'` → 平滑捲動膠囊呈現 disabled，滑鼠停上去會顯示提示。
- 用 `browser_evaluate` 執行 `Object.defineProperty(window, 'localStorage', { get() { throw new Error('blocked') } })` 後切換主題與語言 → 不會出現錯誤畫面，console 沒有未捕捉的例外（重新整理後偏好不會被記住，屬於預期行為）。

---

### Task 7: Bento 卡片、BentoGrid 與首頁

**Files:**
- Create: `src/layout/BentoGrid/BentoGrid.tsx`, `src/layout/BentoGrid/BentoGrid.module.css`
- Create: `src/cards/IntroCard/*`, `src/cards/ContactCard/*`, `src/cards/ProjectCard/*`, `src/cards/QuoteCard/*`, `src/cards/StatCard/*`, `src/cards/PhotoCard/*`（每個都有 `.tsx` 與 `.module.css`）
- Create: `src/pages/HomePage/WallCard.tsx`, `src/pages/HomePage/HomePage.module.css`
- Modify: `src/pages/HomePage/HomePage.tsx`（整個取代）

**Interfaces:**
- Consumes: `Card`、`Tag`、`Icon`、`getProjects`、`resolveLang`、`resolveAsset`、`getSiteText`、`getProfile`、`getHomeCards`、`getSiteAsset`、`buildWall`、`categoryOf`、`keyOf`、`parseFilter`、`useDocumentMeta`
- Produces:
  - `BentoGrid({ children })`
  - `IntroCard({ size, href, avatar?: string, name, greeting, body, cta })`
  - `ContactCard({ size, kind: 'email' | 'linkedin', href, label })`
  - `ProjectCard({ size, tone, href, title, summary, year, tags, cover?: string, coverAlt, locked, lockedLabel })`
  - `QuoteCard({ size, text, label })`：`text` 裡的 `**x**` 會顯示成強調色
  - `StatCard({ size, tone, value, label })`
  - `PhotoCard({ size, src?: string, alt })`
  - `renderEmphasis(text: string): ReactNode[]`（放在 QuoteCard 檔案內並 export）

- [ ] **Step 1: 建立 BentoGrid**

`src/layout/BentoGrid/BentoGrid.module.css`：
```css
.grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  grid-auto-flow: dense;
  gap: var(--grid-gap);
}

/* 平板與桌機：列高等於欄寬，讓 1x1 卡片接近正方形 */
@media (min-width: 640px) {
  .grid {
    --cols: 2;
    grid-template-columns: repeat(var(--cols), minmax(0, 1fr));
    grid-auto-rows: calc(
      (min(var(--container-max), 100vw - 2 * var(--gutter)) - (var(--cols) - 1) * var(--grid-gap)) / var(--cols)
    );
  }
}
@media (min-width: 1024px) {
  .grid { --cols: 4; }
}

/* 前 8 張卡片依序延遲進場 */
.grid > :nth-child(2) { --reveal-delay: 40ms; }
.grid > :nth-child(3) { --reveal-delay: 80ms; }
.grid > :nth-child(4) { --reveal-delay: 120ms; }
.grid > :nth-child(5) { --reveal-delay: 160ms; }
.grid > :nth-child(6) { --reveal-delay: 200ms; }
.grid > :nth-child(7) { --reveal-delay: 240ms; }
.grid > :nth-child(8) { --reveal-delay: 280ms; }
```

`src/layout/BentoGrid/BentoGrid.tsx`：
```tsx
import type { ReactNode } from 'react'
import styles from './BentoGrid.module.css'

/** Bento 卡片牆：桌機 4 欄、平板 2 欄、手機 1 欄；子元素通常是 <Card>。 */
export function BentoGrid({ children }: { children: ReactNode }) {
  return <div className={styles.grid}>{children}</div>
}
```

- [ ] **Step 2: 建立 IntroCard**

`src/cards/IntroCard/IntroCard.module.css`：
```css
.card {
  flex-direction: row;
  align-items: center;
  gap: var(--space-5);
  padding: var(--space-6);
}
.avatar {
  flex: none;
  width: clamp(88px, 22%, 160px);
  aspect-ratio: 1;
  border-radius: var(--radius-md);
  object-fit: cover;
  background: var(--color-bg);
}
.text {
  min-width: 0;
}
.greeting {
  font-weight: var(--weight-medium);
}
.body {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 5;
  overflow: hidden;
  color: var(--color-text);
}
.cta {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  margin-top: var(--space-2);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--color-accent);
}

@media (max-width: 639px) {
  .card { padding: var(--space-5); }
}
```

`src/cards/IntroCard/IntroCard.tsx`：
```tsx
import type { CardSize } from '../../styles/tokens'
import { Card } from '../../ui/Card/Card'
import { Icon } from '../../ui/Icon/Icon'
import styles from './IntroCard.module.css'

type IntroCardProps = {
  size: CardSize
  href: string
  avatar?: string
  name: string
  greeting: string
  body: string
  cta: string
}

export function IntroCard({ size, href, avatar, name, greeting, body, cta }: IntroCardProps) {
  return (
    <Card size={size} href={href} className={styles.card}>
      {avatar && <img className={styles.avatar} src={avatar} alt={name} width={160} height={160} />}
      <div className={styles.text}>
        <p className={styles.greeting}>{greeting}</p>
        <p className={styles.body}>{body}</p>
        <span className={styles.cta}>
          {cta} <Icon name="arrowRight" size={16} />
        </span>
      </div>
    </Card>
  )
}
```

- [ ] **Step 3: 建立 ContactCard**

`src/cards/ContactCard/ContactCard.module.css`：
```css
.card {
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  padding: var(--space-5);
}
.icon {
  display: grid;
  place-items: center;
  width: 64px;
  height: 64px;
  border-radius: var(--radius-md);
}
.email { color: #ea4335; background: color-mix(in srgb, #ea4335 10%, transparent); }
.linkedin { color: #0a66c2; background: color-mix(in srgb, #0a66c2 10%, transparent); }
[data-theme='dark'] .linkedin { color: #4ea1f3; }
.label {
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--color-text-muted);
}
```

`src/cards/ContactCard/ContactCard.tsx`：
```tsx
import { cx } from '../../lib/cx'
import type { CardSize } from '../../styles/tokens'
import { Card } from '../../ui/Card/Card'
import { Icon } from '../../ui/Icon/Icon'
import styles from './ContactCard.module.css'

type ContactCardProps = { size: CardSize; kind: 'email' | 'linkedin'; href: string; label: string }

export function ContactCard({ size, kind, href, label }: ContactCardProps) {
  return (
    <Card size={size} href={href} className={styles.card}>
      <span className={cx(styles.icon, styles[kind])}>
        <Icon name={kind === 'email' ? 'mail' : 'linkedin'} size={32} />
      </span>
      <span className={styles.label}>{label}</span>
    </Card>
  )
}
```

- [ ] **Step 4: 建立 QuoteCard（含 `renderEmphasis`）**

`src/cards/QuoteCard/QuoteCard.module.css`：
```css
.card {
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  padding: var(--space-6) var(--space-8);
  text-align: center;
}
.mark {
  color: color-mix(in srgb, var(--color-highlight) 45%, transparent);
}
.text {
  font-size: var(--text-lg);
  font-weight: var(--weight-medium);
  line-height: 1.6;
}
.highlight {
  color: var(--color-highlight);
}
.label {
  font-size: var(--text-xs);
  letter-spacing: 0.12em;
  color: var(--color-text-muted);
}
@media (max-width: 639px) {
  .card { padding: var(--space-6); }
}
```

`src/cards/QuoteCard/QuoteCard.tsx`：
```tsx
import type { ReactNode } from 'react'
import type { CardSize } from '../../styles/tokens'
import { Card } from '../../ui/Card/Card'
import { Icon } from '../../ui/Icon/Icon'
import styles from './QuoteCard.module.css'

/** 把 "**強調**" 轉成強調色文字，其他部分保持原樣。 */
export function renderEmphasis(text: string): ReactNode[] {
  return text.split(/\*\*(.+?)\*\*/g).map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className={styles.highlight}>
        {part}
      </strong>
    ) : (
      part
    ),
  )
}

export function QuoteCard({ size, text, label }: { size: CardSize; text: string; label: string }) {
  return (
    <Card size={size} className={styles.card}>
      <span className={styles.mark}>
        <Icon name="quote" size={28} />
      </span>
      <blockquote className={styles.text}>{renderEmphasis(text)}</blockquote>
      <p className={styles.label}>{label}</p>
    </Card>
  )
}
```

- [ ] **Step 5: 建立 StatCard 與 PhotoCard**

`src/cards/StatCard/StatCard.module.css`：
```css
.card {
  justify-content: flex-end;
  gap: var(--space-2);
  padding: var(--space-6);
}
.value {
  font-size: var(--text-display);
  font-weight: var(--weight-semibold);
  line-height: 1;
  letter-spacing: -0.02em;
}
.label {
  font-size: var(--text-sm);
  opacity: 0.85;
}
```

`src/cards/StatCard/StatCard.tsx`：
```tsx
import type { CardSize, CardTone } from '../../styles/tokens'
import { Card } from '../../ui/Card/Card'
import styles from './StatCard.module.css'

type StatCardProps = { size: CardSize; tone: CardTone; value: string; label: string }

export function StatCard({ size, tone, value, label }: StatCardProps) {
  return (
    <Card size={size} tone={tone} className={styles.card}>
      <p className={styles.value}>{value}</p>
      <p className={styles.label}>{label}</p>
    </Card>
  )
}
```

`src/cards/PhotoCard/PhotoCard.module.css`：
```css
.card {
  padding: 0;
}
.image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
```

`src/cards/PhotoCard/PhotoCard.tsx`：
```tsx
import type { CardSize } from '../../styles/tokens'
import { Card } from '../../ui/Card/Card'
import styles from './PhotoCard.module.css'

export function PhotoCard({ size, src, alt }: { size: CardSize; src?: string; alt: string }) {
  return (
    <Card size={size} className={styles.card}>
      {src && <img className={styles.image} src={src} alt={alt} loading="lazy" decoding="async" />}
    </Card>
  )
}
```

- [ ] **Step 6: 建立 ProjectCard**

`src/cards/ProjectCard/ProjectCard.module.css`：
```css
.card {
  justify-content: flex-end;
  padding: 0;
  min-height: 220px;
}
.cover {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: scale 600ms var(--ease-out);
}
.card:hover .cover { scale: 1.03; }

/* 沒有封面圖時：色塊上的大標題 */
.placeholderTitle {
  position: absolute;
  inset: var(--space-6) var(--space-6) auto;
  font-size: var(--text-xl);
  font-weight: var(--weight-semibold);
  letter-spacing: -0.01em;
  line-height: var(--leading-tight);
}

.top {
  position: absolute;
  inset: var(--space-4) var(--space-4) auto;
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
}
.lock {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: 4px var(--space-3);
  border-radius: var(--radius-pill);
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  font-size: var(--text-xs);
}

.info {
  position: relative;
  display: grid;
  gap: var(--space-2);
  padding: var(--space-5) var(--space-6);
  background: linear-gradient(to top, rgba(0, 0, 0, 0.72), rgba(0, 0, 0, 0));
  color: #fff;
  --tone-fg: #ffffff;
}
.meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}
.title {
  font-size: var(--text-lg);
}
.summary {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
  font-size: var(--text-sm);
  opacity: 0.9;
}

/* 可以 hover 的裝置：摘要在 hover 或聚焦時才展開 */
@media (hover: hover) {
  .summary {
    max-height: 0;
    opacity: 0;
    transition:
      max-height var(--duration-base) var(--ease-out),
      opacity var(--duration-base) var(--ease-out);
  }
  .card:hover .summary,
  .card:focus-visible .summary {
    max-height: 6em;
    opacity: 0.9;
  }
}
```

`src/cards/ProjectCard/ProjectCard.tsx`：
```tsx
import type { CardSize, CardTone } from '../../styles/tokens'
import { Card } from '../../ui/Card/Card'
import { Icon } from '../../ui/Icon/Icon'
import { Tag } from '../../ui/Tag/Tag'
import styles from './ProjectCard.module.css'

type ProjectCardProps = {
  size: CardSize
  tone: CardTone
  href: string
  title: string
  summary: string
  year: number
  tags: string[]
  cover?: string
  coverAlt: string
  locked: boolean
  lockedLabel: string
}

export function ProjectCard({ size, tone, href, title, summary, year, tags, cover, coverAlt, locked, lockedLabel }: ProjectCardProps) {
  return (
    <Card size={size} tone={tone} href={href} className={styles.card}>
      {cover ? (
        <img className={styles.cover} src={cover} alt={coverAlt} loading="lazy" decoding="async" />
      ) : (
        <span className={styles.placeholderTitle} aria-hidden="true">
          {title}
        </span>
      )}
      {locked && (
        <div className={styles.top}>
          <span className={styles.lock}>
            <Icon name="lock" size={14} /> {lockedLabel}
          </span>
        </div>
      )}
      <div className={styles.info}>
        <div className={styles.meta}>
          <Tag tone="onTone">{year}</Tag>
          {tags.slice(0, 2).map((tag) => (
            <Tag key={tag} tone="onTone">
              {tag}
            </Tag>
          ))}
        </div>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.summary}>{summary}</p>
      </div>
    </Card>
  )
}
```

- [ ] **Step 7: 建立 WallCard 並取代 HomePage**

`src/pages/HomePage/WallCard.tsx`：
```tsx
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
```

`src/pages/HomePage/HomePage.module.css`：
```css
.page {
  padding-top: var(--space-6);
}
.empty {
  padding: var(--space-16) 0;
  text-align: center;
  color: var(--color-text-muted);
}
```

`src/pages/HomePage/HomePage.tsx`（整個取代）：
```tsx
import { useSearchParams } from 'react-router'
import { getProjects } from '../../content/projects'
import { getHomeCards, getSiteText } from '../../content/site'
import { buildWall, categoryOf, keyOf, parseFilter } from '../../content/wall'
import { useDocumentMeta } from '../../hooks/useDocumentMeta'
import { useI18n } from '../../i18n/useI18n'
import { BentoGrid } from '../../layout/BentoGrid/BentoGrid'
import { cx } from '../../lib/cx'
import styles from './HomePage.module.css'
import { WallCard } from './WallCard'

export function HomePage() {
  const { lang, t } = useI18n()
  const [params] = useSearchParams()
  const filter = parseFilter(params.get('filter'))
  const site = getSiteText(lang)
  useDocumentMeta()

  const items = buildWall(getProjects(), getHomeCards()).filter(
    (item) => filter === 'all' || categoryOf(item) === filter,
  )

  return (
    <div className={cx('container', styles.page)}>
      <h1 className="visually-hidden">{site.meta.title}</h1>
      {items.length === 0 ? (
        <p className={styles.empty}>{t.home.empty}</p>
      ) : (
        // key 綁定篩選條件：切換時整組重新掛載，播放一次進場動畫
        <BentoGrid key={filter}>
          {items.map((item) => (
            <WallCard key={keyOf(item)} item={item} />
          ))}
        </BentoGrid>
      )}
    </div>
  )
}
```

- [ ] **Step 8: 驗證**

Run: `npm run typecheck` → Expected: exit 0。
Dev server：
- 1280px：第一列為 IntroCard（頭貼加文字，2 欄寬）、Email、LinkedIn；接著是 5 張作品卡（色塊加大標題）穿插引言卡與數字卡，沒有空洞。卡片捲動進入畫面時會淡入上浮。hover 作品卡會浮起，並展開摘要。
- 點「作品」膠囊 → 網址變成 `/zh?filter=work`，只剩 5 張作品卡，播放進場動畫；按上一頁會回到「全部」。點「Side Quests」→ 顯示「這個分類目前還沒有內容」。
- 768px：2 欄，2x2 卡片滿版。375px：1 欄，卡片高度合理，沒有水平捲動（用 `browser_evaluate` 確認 `document.documentElement.scrollWidth <= innerWidth`）。
- 深色模式：卡片底色、文字、引言強調色都正確切換。

- [ ] **Step 9: 長文字檢查（Review Focus #3）**

暫時把 `content/site/zh.json` 的 `intro.body` 改成原本的三倍長度，把 `openhci-2025/zh.mdx` 的 `summary` 改成 200 字以上。在 1280px 與 768px 檢查：IntroCard 內文最多 5 行並顯示「…」，作品卡摘要最多 3 行，文字沒有超出卡片。還原兩個檔案。

---

### Task 8: 案例頁（模板、MDX 元件、目錄、閱讀進度、密碼保護）

**Files:**
- Create: `src/content/ProjectContext.tsx`, `src/lib/password.ts`, `src/hooks/useActiveSection.ts`
- Create: `src/case-study/CaseHero/*`, `src/case-study/CaseBody/*`（含 `Prose.module.css`）, `src/case-study/CaseToc/*`, `src/case-study/ReadingProgress/*`, `src/case-study/MetricRow/*`, `src/case-study/Figure/*`, `src/case-study/BeforeAfter/*`, `src/case-study/Callout/*`, `src/case-study/NextProject/*`, `src/case-study/PasswordGate/*`, `src/case-study/mdxComponents.tsx`
- Create: `src/pages/CaseStudyPage/CaseStudyPage.module.css`
- Modify: `src/pages/CaseStudyPage/CaseStudyPage.tsx`（整個取代）

**Interfaces:**
- Consumes: `getProject`、`resolveLang`、`loadBody`、`resolveAsset`、`getNextProject`、`Project`、`Frontmatter`、`ProjectMeta`、`Icon`、`Tag`、`Button`、`useDocumentMeta`、`readStorage` / `writeStorage`、`PROTECTED_PASSWORD_SHA256`、`NotFoundPage`
- Produces:
  - `ProjectProvider({ slug, children })`、`useProjectAsset(src?: string): string | undefined`
  - `checkPassword(input: string): Promise<boolean>`、`isUnlocked(): boolean`、`markUnlocked(): void`
  - `useActiveSection(ids: string[]): string | null`
  - `type Heading = { id: string; text: string }`
  - MDX 可用元件：`<Figure src? alt caption? wide? ratio? />`、`<BeforeAfter before? after? beforeAlt afterAlt caption? />`、`<MetricRow items={[{ value, label }]} label? />`、`<Callout type?="insight" | "note" title?>…</Callout>`；Markdown 圖片 `![alt](images/x.jpg)` 會自動解析路徑

- [ ] **Step 1: 建立 `src/content/ProjectContext.tsx`、`src/lib/password.ts`、`src/hooks/useActiveSection.ts`**

`src/content/ProjectContext.tsx`：
```tsx
import { createContext, useContext, type ReactNode } from 'react'
import { resolveAsset } from './projects'

const ProjectSlugContext = createContext('')

/** 讓案例 MDX 裡的元件知道目前是哪個案例，才能解析 "images/x.jpg" 這類相對路徑。 */
export function ProjectProvider({ slug, children }: { slug: string; children: ReactNode }) {
  return <ProjectSlugContext.Provider value={slug}>{children}</ProjectSlugContext.Provider>
}

export function useProjectAsset(src?: string): string | undefined {
  const slug = useContext(ProjectSlugContext)
  return slug ? resolveAsset(slug, src) : src && /^(https?:)?\//.test(src) ? src : undefined
}
```

`src/lib/password.ts`：
```ts
import { PROTECTED_PASSWORD_SHA256 } from '../config'
import { readStorage, writeStorage } from './storage'

const KEY = 'case-unlocked'

async function sha256(text: string): Promise<string> {
  const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

/** crypto.subtle 只在 https 或 localhost 可用；其他情況一律視為密碼錯誤。 */
export async function checkPassword(input: string): Promise<boolean> {
  try {
    return (await sha256(input.trim())) === PROTECTED_PASSWORD_SHA256
  } catch {
    return false
  }
}

export const isUnlocked = () => readStorage(KEY, 'session') === '1'
export const markUnlocked = () => writeStorage(KEY, '1', 'session')
```

`src/hooks/useActiveSection.ts`：
```ts
import { useEffect, useState } from 'react'

/** 回傳目前在畫面上方區域（視窗高度 20%–30% 之間）的章節 id，用於目錄高亮。 */
export function useActiveSection(ids: string[]): string | null {
  const [active, setActive] = useState<string | null>(null)
  const key = ids.join('|')

  useEffect(() => {
    const elements = key
      .split('|')
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)
    if (!elements.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: '-20% 0px -70% 0px' },
    )
    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [key])

  return active
}
```

- [ ] **Step 2: 建立 MetricRow 與 Callout**

`src/case-study/MetricRow/MetricRow.module.css`：
```css
.row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: var(--space-4);
  margin-block: var(--space-6);
}
.item {
  display: flex;
  flex-direction: column-reverse;
  gap: var(--space-1);
  padding: var(--space-5);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
}
.value {
  font-size: var(--text-xl);
  font-weight: var(--weight-semibold);
  line-height: 1.1;
  color: var(--color-accent);
}
.label {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}
```

`src/case-study/MetricRow/MetricRow.tsx`：
```tsx
import styles from './MetricRow.module.css'

type Metric = { value: string; label: string }

/** 成果數字列。dt（說明）在前、dd（數字）在後，讓螢幕閱讀器先讀說明；視覺上數字在上。 */
export function MetricRow({ items, label }: { items: Metric[]; label?: string }) {
  return (
    <dl className={styles.row} aria-label={label}>
      {items.map((item) => (
        <div key={item.label} className={styles.item}>
          <dt className={styles.label}>{item.label}</dt>
          <dd className={styles.value}>{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}
```

`src/case-study/Callout/Callout.module.css`：
```css
.callout {
  margin-block: var(--space-6);
  padding: var(--space-5) var(--space-6);
  border-radius: var(--radius-md);
  border-left: 4px solid var(--color-accent);
  background: color-mix(in srgb, var(--color-accent) 7%, var(--color-surface));
}
.note {
  border-left-color: var(--color-text-muted);
  background: var(--color-surface);
}
.title {
  margin-bottom: var(--space-1);
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  letter-spacing: 0.02em;
}
.body > * + * {
  margin-top: var(--space-2);
}
```

`src/case-study/Callout/Callout.tsx`：
```tsx
import type { ReactNode } from 'react'
import { cx } from '../../lib/cx'
import styles from './Callout.module.css'

type CalloutProps = { type?: 'insight' | 'note'; title?: string; children: ReactNode }

/** insight：重點洞察、問題陳述；note：補充說明。 */
export function Callout({ type = 'insight', title, children }: CalloutProps) {
  return (
    <aside className={cx(styles.callout, type === 'note' && styles.note)}>
      {title && <p className={styles.title}>{title}</p>}
      <div className={styles.body}>{children}</div>
    </aside>
  )
}
```

- [ ] **Step 3: 建立 Figure 與 BeforeAfter**

`src/case-study/Figure/Figure.module.css`：
```css
.figure {
  margin-block: var(--space-8);
}
.image {
  width: 100%;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
}
.fixed {
  object-fit: cover;
}
.placeholder {
  display: grid;
  place-items: center;
  aspect-ratio: 16 / 10;
  padding: var(--space-4);
  border-radius: var(--radius-md);
  border: 2px dashed color-mix(in srgb, var(--color-text) 20%, transparent);
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  text-align: center;
}
.caption {
  margin-top: var(--space-3);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}
```

`src/case-study/Figure/Figure.tsx`：
```tsx
import { useProjectAsset } from '../../content/ProjectContext'
import { useI18n } from '../../i18n/useI18n'
import { cx } from '../../lib/cx'
import styles from './Figure.module.css'

type FigureProps = {
  /** 相對於案例資料夾的路徑，例如 "images/flow.jpg"；省略或找不到時顯示「待補圖片」框 */
  src?: string
  alt: string
  caption?: string
  /** 在內文欄中使用最大寬度（超過 720px） */
  wide?: boolean
  /** 固定長寬比，例如 "16 / 9"（圖片會裁切填滿） */
  ratio?: string
}

export function Figure({ src, alt, caption, wide, ratio }: FigureProps) {
  const { t } = useI18n()
  const url = useProjectAsset(src)
  return (
    <figure className={styles.figure} data-wide={wide || undefined}>
      {url ? (
        <img className={cx(styles.image, ratio && styles.fixed)} style={ratio ? { aspectRatio: ratio } : undefined} src={url} alt={alt} loading="lazy" decoding="async" />
      ) : (
        <div className={styles.placeholder} role="img" aria-label={alt}>
          {t.case.placeholderImage}
          {src ? `：${src}` : ''}
        </div>
      )}
      {caption && <figcaption className={styles.caption}>{caption}</figcaption>}
    </figure>
  )
}
```

`src/case-study/BeforeAfter/BeforeAfter.module.css`：
```css
.wrapper {
  margin-block: var(--space-8);
}
.grid {
  display: grid;
  gap: var(--space-4);
}
@media (min-width: 640px) {
  .grid { grid-template-columns: 1fr 1fr; }
}
.label {
  display: inline-block;
  margin-bottom: var(--space-2);
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}
.side > figure {
  margin-block: 0;
}
.caption {
  margin-top: var(--space-3);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}
```

`src/case-study/BeforeAfter/BeforeAfter.tsx`：
```tsx
import { useI18n } from '../../i18n/useI18n'
import { Figure } from '../Figure/Figure'
import styles from './BeforeAfter.module.css'

type BeforeAfterProps = { before?: string; after?: string; beforeAlt: string; afterAlt: string; caption?: string }

export function BeforeAfter({ before, after, beforeAlt, afterAlt, caption }: BeforeAfterProps) {
  const { t } = useI18n()
  return (
    <figure className={styles.wrapper} data-wide>
      <div className={styles.grid}>
        <div className={styles.side}>
          <span className={styles.label}>{t.case.before}</span>
          <Figure src={before} alt={beforeAlt} />
        </div>
        <div className={styles.side}>
          <span className={styles.label}>{t.case.after}</span>
          <Figure src={after} alt={afterAlt} />
        </div>
      </div>
      {caption && <figcaption className={styles.caption}>{caption}</figcaption>}
    </figure>
  )
}
```

- [ ] **Step 4: 建立 `src/case-study/mdxComponents.tsx`**

```tsx
import type { ImgHTMLAttributes } from 'react'
import type { MDXComponents } from 'mdx/types'
import { useProjectAsset } from '../content/ProjectContext'
import { BeforeAfter } from './BeforeAfter/BeforeAfter'
import { Callout } from './Callout/Callout'
import { Figure } from './Figure/Figure'
import { MetricRow } from './MetricRow/MetricRow'

/** Markdown 圖片 ![說明](images/x.jpg) 也支援相對路徑。 */
function MarkdownImage({ src, alt = '', ...rest }: ImgHTMLAttributes<HTMLImageElement>) {
  const url = useProjectAsset(typeof src === 'string' ? src : undefined)
  return <img {...rest} src={url ?? (typeof src === 'string' ? src : undefined)} alt={alt} loading="lazy" decoding="async" />
}

export const mdxComponents: MDXComponents = {
  Figure,
  BeforeAfter,
  MetricRow,
  Callout,
  img: MarkdownImage,
}
```

- [ ] **Step 5: 建立 CaseToc 與 ReadingProgress**

`src/case-study/CaseToc/CaseToc.module.css`：
```css
.toc {
  display: none;
}
@media (min-width: 1024px) {
  .toc {
    display: block;
    position: sticky;
    top: calc(var(--header-height) + var(--space-6));
    font-size: var(--text-sm);
  }
}
.heading {
  margin-bottom: var(--space-3);
  font-size: var(--text-xs);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}
.list {
  display: grid;
  gap: var(--space-1);
  padding: 0;
  list-style: none;
  border-left: 1px solid var(--color-border);
}
.link {
  display: block;
  margin-left: -1px;
  padding: var(--space-1) var(--space-3);
  border-left: 2px solid transparent;
  color: var(--color-text-muted);
  text-decoration: none;
  transition: color var(--duration-fast) var(--ease-out), border-color var(--duration-fast) var(--ease-out);
}
.link:hover { color: var(--color-text); }
.link[aria-current] {
  border-left-color: var(--color-accent);
  color: var(--color-text);
  font-weight: var(--weight-medium);
}
```

`src/case-study/CaseToc/CaseToc.tsx`：
```tsx
import { useI18n } from '../../i18n/useI18n'
import styles from './CaseToc.module.css'

export type Heading = { id: string; text: string }

/** 桌機（≥1024px）左側、跟著捲動的章節目錄；手機隱藏，改用 ReadingProgress。 */
export function CaseToc({ headings, activeId }: { headings: Heading[]; activeId: string | null }) {
  const { t } = useI18n()
  if (!headings.length) return <div />
  return (
    <nav className={styles.toc} aria-label={t.case.toc}>
      <p className={styles.heading}>{t.case.toc}</p>
      <ol className={styles.list}>
        {headings.map((heading) => (
          <li key={heading.id}>
            <a className={styles.link} href={`#${heading.id}`} aria-current={activeId === heading.id ? 'location' : undefined}>
              {heading.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
```

`src/case-study/ReadingProgress/ReadingProgress.module.css`：
```css
.bar {
  position: fixed;
  inset: 0 0 auto;
  z-index: 60;
  height: 3px;
  background: var(--color-accent);
  transform-origin: 0 50%;
  transform: scaleX(0);
}
@media (min-width: 1024px) {
  .bar { display: none; }
}
```

`src/case-study/ReadingProgress/ReadingProgress.tsx`：
```tsx
import { useEffect, useRef } from 'react'
import styles from './ReadingProgress.module.css'

/** 手機版頂部的閱讀進度條（純裝飾，直接改 style 避免每次捲動都觸發重新渲染）。 */
export function ReadingProgress() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      const progress = max > 0 ? Math.min(window.scrollY / max, 1) : 0
      if (ref.current) ref.current.style.transform = `scaleX(${progress})`
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return <div ref={ref} className={styles.bar} aria-hidden="true" />
}
```

- [ ] **Step 6: 建立 CaseBody（含 Prose 樣式）**

`src/case-study/CaseBody/Prose.module.css`：
```css
.prose {
  min-width: 0;
  font-size: var(--text-base);
}
.prose > * {
  max-width: var(--prose-max);
}
.prose > [data-wide] {
  max-width: none;
}
.prose h2 {
  margin-top: var(--space-16);
  margin-bottom: var(--space-4);
  font-size: var(--text-xl);
  scroll-margin-top: calc(var(--header-height) + var(--space-6));
}
.prose > h2:first-child {
  margin-top: 0;
}
.prose h3 {
  margin-top: var(--space-8);
  margin-bottom: var(--space-3);
  font-size: var(--text-lg);
  scroll-margin-top: calc(var(--header-height) + var(--space-6));
}
.prose p,
.prose ul,
.prose ol,
.prose table,
.prose blockquote {
  margin-bottom: var(--space-4);
}
.prose ul,
.prose ol {
  padding-left: 1.4em;
}
.prose li + li {
  margin-top: var(--space-1);
}
.prose strong {
  font-weight: var(--weight-semibold);
}
.prose a {
  color: var(--color-highlight);
  text-underline-offset: 3px;
}
.prose blockquote {
  padding-left: var(--space-4);
  border-left: 3px solid var(--color-border);
  color: var(--color-text-muted);
}
.prose > img {
  width: 100%;
  margin-block: var(--space-8);
  border-radius: var(--radius-md);
}
.prose table {
  display: block;
  width: 100%;
  overflow-x: auto;
  border-collapse: collapse;
  font-size: var(--text-sm);
}
.prose th,
.prose td {
  padding: var(--space-2) var(--space-3);
  border-bottom: 1px solid var(--color-border);
  text-align: left;
}
.prose hr {
  margin-block: var(--space-12);
  border: 0;
  border-top: 1px solid var(--color-border);
}
```

`src/case-study/CaseBody/CaseBody.module.css`：
```css
.layout {
  display: block;
}
@media (min-width: 1024px) {
  .layout {
    display: grid;
    grid-template-columns: 200px minmax(0, 1fr);
    gap: var(--space-12);
    align-items: start;
  }
}
```

`src/case-study/CaseBody/CaseBody.tsx`：
```tsx
import { useEffect, useRef, useState, type ComponentType } from 'react'
import type { MDXProps } from 'mdx/types'
import { useActiveSection } from '../../hooks/useActiveSection'
import { CaseToc, type Heading } from '../CaseToc/CaseToc'
import { mdxComponents } from '../mdxComponents'
import styles from './CaseBody.module.css'
import prose from './Prose.module.css'

/** 必須放在 <Suspense> 內：掛載時 MDX 已載入完成，才能讀出 h2 產生目錄。 */
export function CaseBody({ Body }: { Body: ComponentType<MDXProps> }) {
  const ref = useRef<HTMLDivElement>(null)
  const [headings, setHeadings] = useState<Heading[]>([])

  useEffect(() => {
    const nodes = ref.current?.querySelectorAll<HTMLHeadingElement>('h2[id]') ?? []
    setHeadings([...nodes].map((node) => ({ id: node.id, text: node.textContent ?? '' })))
  }, [Body])

  const activeId = useActiveSection(headings.map((heading) => heading.id))

  return (
    <div className={styles.layout}>
      <CaseToc headings={headings} activeId={activeId} />
      <div ref={ref} className={prose.prose}>
        <Body components={mdxComponents} />
      </div>
    </div>
  )
}
```

- [ ] **Step 7: 建立 CaseHero**

`src/case-study/CaseHero/CaseHero.module.css`：
```css
.hero {
  padding-top: var(--space-8);
}
.back {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  text-decoration: none;
}
.back:hover { color: var(--color-text); }
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-top: var(--space-8);
}
.title {
  margin-top: var(--space-4);
  font-size: var(--text-display);
  letter-spacing: -0.02em;
}
.summary {
  max-width: var(--prose-max);
  margin-top: var(--space-4);
  font-size: var(--text-lg);
  color: var(--color-text-muted);
}
.facts {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-5);
  margin-top: var(--space-8);
  padding-block: var(--space-6);
  border-block: 1px solid var(--color-border);
}
@media (min-width: 900px) {
  .facts { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}
.fact dt {
  font-size: var(--text-xs);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}
.fact dd {
  margin-top: var(--space-1);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
}
.cover {
  position: relative;
  display: grid;
  place-items: end start;
  aspect-ratio: 16 / 9;
  margin-top: var(--space-8);
  margin-bottom: var(--space-12);
  overflow: hidden;
  border-radius: var(--radius-card);
  background: var(--tone-bg);
  color: var(--tone-fg);
}
.coverImage {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.coverTitle {
  padding: var(--space-8);
  font-size: var(--text-xl);
  font-weight: var(--weight-semibold);
}
@media (max-width: 639px) {
  .cover { aspect-ratio: 4 / 3; border-radius: var(--radius-md); }
  .coverTitle { padding: var(--space-5); }
}
```

`src/case-study/CaseHero/CaseHero.tsx`：
```tsx
import { Link } from 'react-router'
import type { Frontmatter, ProjectMeta } from '../../content/schema'
import { useI18n } from '../../i18n/useI18n'
import { Icon } from '../../ui/Icon/Icon'
import { Tag } from '../../ui/Tag/Tag'
import { MetricRow } from '../MetricRow/MetricRow'
import styles from './CaseHero.module.css'

type CaseHeroProps = { frontmatter: Frontmatter; meta: ProjectMeta; cover?: string; coverAlt: string }

/** 案例開頭的 TL;DR：讓讀者 30 秒內知道角色、時程、成果。 */
export function CaseHero({ frontmatter, meta, cover, coverAlt }: CaseHeroProps) {
  const { lang, t } = useI18n()
  const facts = [
    { label: t.case.role, value: frontmatter.role },
    { label: t.case.timeline, value: frontmatter.timeline },
    frontmatter.team ? { label: t.case.team, value: frontmatter.team } : null,
    frontmatter.tools.length ? { label: t.case.tools, value: frontmatter.tools.join(', ') } : null,
  ].filter((fact): fact is { label: string; value: string } => fact !== null)

  return (
    <header className={styles.hero}>
      <Link to={`/${lang}?filter=work`} className={styles.back}>
        <Icon name="arrowLeft" size={16} /> {t.case.back}
      </Link>
      <div className={styles.tags}>
        <Tag>{meta.year}</Tag>
        {meta.tags.map((tag) => (
          <Tag key={tag}>{tag}</Tag>
        ))}
      </div>
      <h1 className={styles.title}>{frontmatter.title}</h1>
      <p className={styles.summary}>{frontmatter.summary}</p>
      <dl className={styles.facts}>
        {facts.map((fact) => (
          <div key={fact.label} className={styles.fact}>
            <dt>{fact.label}</dt>
            <dd>{fact.value}</dd>
          </div>
        ))}
      </dl>
      {frontmatter.highlights.length > 0 && <MetricRow items={frontmatter.highlights} label={t.case.highlights} />}
      <div className={styles.cover} data-tone={meta.cardTone}>
        {cover ? (
          <img className={styles.coverImage} src={cover} alt={coverAlt} />
        ) : (
          <span className={styles.coverTitle} aria-hidden="true">
            {frontmatter.title}
          </span>
        )}
      </div>
    </header>
  )
}
```

- [ ] **Step 8: 建立 NextProject 與 PasswordGate**

`src/case-study/NextProject/NextProject.module.css`：
```css
.next {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-4);
  margin-top: var(--space-16);
  padding: var(--space-8);
  border-radius: var(--radius-card);
  background: var(--tone-bg);
  color: var(--tone-fg);
  text-decoration: none;
  transition: transform var(--duration-base) var(--ease-out), box-shadow var(--duration-base) var(--ease-out);
}
.next:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-card-hover);
}
.label {
  font-size: var(--text-sm);
  opacity: 0.8;
}
.title {
  margin-top: var(--space-2);
  font-size: var(--text-xl);
}
.arrow {
  flex: none;
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  border-radius: var(--radius-pill);
  background: color-mix(in srgb, var(--tone-fg) 15%, transparent);
}
@media (max-width: 639px) {
  .next { padding: var(--space-6); }
}
```

`src/case-study/NextProject/NextProject.tsx`：
```tsx
import { Link } from 'react-router'
import type { CardTone } from '../../styles/tokens'
import { Icon } from '../../ui/Icon/Icon'
import styles from './NextProject.module.css'

type NextProjectProps = { to: string; label: string; title: string; tone: CardTone }

export function NextProject({ to, label, title, tone }: NextProjectProps) {
  return (
    <Link to={to} className={styles.next} data-tone={tone}>
      <div>
        <p className={styles.label}>{label}</p>
        <p className={styles.title}>{title}</p>
      </div>
      <span className={styles.arrow}>
        <Icon name="arrowRight" />
      </span>
    </Link>
  )
}
```

`src/case-study/PasswordGate/PasswordGate.module.css`：
```css
.gate {
  max-width: 440px;
  margin: var(--space-16) auto;
  padding: var(--space-8);
  border-radius: var(--radius-card);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  text-align: center;
}
.icon {
  display: inline-grid;
  place-items: center;
  width: 56px;
  height: 56px;
  border-radius: var(--radius-pill);
  background: color-mix(in srgb, var(--color-accent) 12%, transparent);
  color: var(--color-accent);
}
.title {
  margin-top: var(--space-4);
  font-size: var(--text-lg);
}
.desc {
  margin-top: var(--space-2);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}
.form {
  display: grid;
  gap: var(--space-3);
  margin-top: var(--space-6);
  text-align: left;
}
.label {
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
}
.input {
  min-height: 44px;
  padding: 0 var(--space-4);
  border-radius: var(--radius-sm);
  border: 1px solid color-mix(in srgb, var(--color-text) 20%, transparent);
  background: var(--color-surface-raised);
}
.input[aria-invalid='true'] {
  border-color: #c53030;
}
.error {
  font-size: var(--text-sm);
  color: #c53030;
}
[data-theme='dark'] .error,
[data-theme='dark'] .input[aria-invalid='true'] {
  color: #fc8181;
  border-color: #fc8181;
}
@media (max-width: 639px) {
  .gate { margin-inline: var(--gutter); padding: var(--space-6); }
}
```

`src/case-study/PasswordGate/PasswordGate.tsx`：
```tsx
import { useState, type FormEvent } from 'react'
import { useI18n } from '../../i18n/useI18n'
import { checkPassword, markUnlocked } from '../../lib/password'
import { Button } from '../../ui/Button/Button'
import { Icon } from '../../ui/Icon/Icon'
import styles from './PasswordGate.module.css'

export function PasswordGate({ onUnlock }: { onUnlock: () => void }) {
  const { t } = useI18n()
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)
  const [busy, setBusy] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    const ok = await checkPassword(value)
    setBusy(false)
    if (ok) {
      markUnlocked()
      onUnlock()
    } else {
      setError(true)
    }
  }

  return (
    <section className={styles.gate} aria-labelledby="gate-title">
      <span className={styles.icon}>
        <Icon name="lock" size={26} />
      </span>
      <h1 id="gate-title" className={styles.title}>
        {t.gate.title}
      </h1>
      <p className={styles.desc}>{t.gate.desc}</p>
      <form className={styles.form} onSubmit={submit}>
        <label htmlFor="gate-password" className={styles.label}>
          {t.gate.label}
        </label>
        <input
          id="gate-password"
          className={styles.input}
          type="password"
          autoComplete="current-password"
          value={value}
          onChange={(event) => {
            setValue(event.target.value)
            setError(false)
          }}
          aria-invalid={error}
          aria-describedby={error ? 'gate-error' : undefined}
          autoFocus
        />
        {error && (
          <p id="gate-error" className={styles.error} role="alert">
            {t.gate.error}
          </p>
        )}
        <Button type="submit" disabled={busy || !value}>
          {t.gate.submit}
        </Button>
      </form>
    </section>
  )
}
```

- [ ] **Step 9: 取代 CaseStudyPage**

`src/pages/CaseStudyPage/CaseStudyPage.module.css`：
```css
.notice {
  max-width: var(--prose-max);
}
.loading {
  padding-block: var(--space-12);
  color: var(--color-text-muted);
}
```

`src/pages/CaseStudyPage/CaseStudyPage.tsx`（整個取代）：
```tsx
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
```

- [ ] **Step 10: 驗證**

Run: `npm run typecheck` → Expected: exit 0。
開啟 `/zh/work/openhci-2025`：
- 1280px：返回連結、年份與標籤、大標題、摘要、角色／時程／團隊／工具四欄、成果亮點卡、深紫色封面色塊；下方左側有「本頁內容」目錄（8 個章節），捲動時目前章節會高亮；點目錄項目會跳到對應章節，標題不會被 Header 擋住。Callout、「待補圖片」虛線框、改版前後並排、成果數字列都正確顯示。最底部是「下一個案例：2026 OpenHCI」。
- 375px：沒有目錄，頂部有紫色閱讀進度條；四欄資訊變成兩欄；改版前後改為上下排列；沒有水平捲動。
- 在最後一個案例（`mental-health-app-testing-2024`）點「下一個案例」→ 回到第一個案例。
- `/zh/work/does-not-exist` → 顯示 404。

- [ ] **Step 11: 密碼保護檢查**

暫時把 `content/projects/logitech-anywhere-ui/meta.json` 的 `protected` 改成 `true`：首頁該卡片出現「需要密碼」鎖頭；點進去顯示密碼表單。輸入錯誤密碼 → 出現錯誤訊息，輸入框標示紅色；輸入 `shawn2026` → 顯示案例內容。重新整理後仍為解鎖狀態（sessionStorage），開新分頁的無痕視窗則需要重新輸入。改回 `false`。

- [ ] **Step 12: 缺翻譯檢查（Review Focus #2）**

暫時把 `content/projects/openhci-2026/en.mdx` 改名為 `en.mdx.bak`，重新啟動 dev server：
- `npm run validate` → 通過，但有 `⚠ … 尚未提供 en.mdx` 警告。
- `/en` 首頁 → 2026 OpenHCI 卡片顯示中文標題，其他卡片正常。
- `/en/work/openhci-2026` → 顯示中文內容，上方有「This page isn't available in English yet…」提示；目錄正常。
改回 `en.mdx`。

---

### Task 9: About 頁

**Files:**
- Create: `src/pages/AboutPage/AboutPage.module.css`
- Modify: `src/pages/AboutPage/AboutPage.tsx`（整個取代）

**Interfaces:**
- Consumes: `getSiteText`、`getProfile`、`getSiteAsset`、`ButtonLink`、`useDocumentMeta`、`useI18n`

- [ ] **Step 1: 建立 `src/pages/AboutPage/AboutPage.module.css`**

```css
.page {
  max-width: calc(var(--prose-max) + 2 * var(--gutter));
  padding-top: var(--space-12);
}
.header {
  display: flex;
  align-items: center;
  gap: var(--space-6);
}
.avatar {
  flex: none;
  width: 112px;
  height: 112px;
  border-radius: var(--radius-card);
  object-fit: cover;
}
.eyebrow {
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--color-accent);
}
.heading {
  margin-top: var(--space-2);
  font-size: var(--text-xl);
}
.body {
  display: grid;
  gap: var(--space-4);
  margin-top: var(--space-8);
}
.section {
  margin-top: var(--space-12);
}
.sectionTitle {
  margin-bottom: var(--space-5);
  font-size: var(--text-lg);
}
.timeline {
  display: grid;
  gap: var(--space-6);
  padding: 0;
  list-style: none;
}
.item {
  display: grid;
  gap: var(--space-1) var(--space-6);
}
@media (min-width: 640px) {
  .item { grid-template-columns: 140px 1fr; }
}
.period {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}
.itemTitle {
  font-size: var(--text-base);
}
.itemDesc {
  margin-top: var(--space-1);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  margin-top: var(--space-12);
}
@media (max-width: 639px) {
  .header { flex-direction: column; align-items: flex-start; }
  .avatar { width: 96px; height: 96px; }
}
```

- [ ] **Step 2: 取代 `src/pages/AboutPage/AboutPage.tsx`**

```tsx
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
              <div>
                <h3 className={styles.itemTitle}>
                  {item.role} · {item.org}
                </h3>
                <p className={styles.itemDesc}>{item.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

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
```

- [ ] **Step 3: 驗證**

Run: `npm run typecheck` → Expected: exit 0。
從首頁點 IntroCard → 進入 `/zh/about`：頭貼、標題、三段介紹、經歷時間軸（桌機左側為時間、右側為內容；手機上下排列）、學歷、「下載履歷」（會下載 PDF）與「與我聯絡」按鈕。切換到 EN 後內容全部變英文。

---

### Task 10: Design System 頁與文件

**Files:**
- Create: `src/pages/DesignSystemPage/DesignSystemPage.module.css`
- Modify: `src/pages/DesignSystemPage/DesignSystemPage.tsx`（整個取代）
- Create: `DESIGN_GUIDELINE.md`, `README.md`

**Interfaces:**
- Consumes: 所有 ui、cards、case-study 元件；`CARD_TONES`；`BentoGrid`；`useI18n`；`useDocumentMeta`

- [ ] **Step 1: 建立 `src/pages/DesignSystemPage/DesignSystemPage.module.css`**

```css
.page {
  padding-top: var(--space-12);
}
.title {
  font-size: var(--text-display);
  letter-spacing: -0.02em;
}
.intro {
  max-width: var(--prose-max);
  margin-top: var(--space-4);
  color: var(--color-text-muted);
}
.section {
  margin-top: var(--space-16);
}
.sectionTitle {
  margin-bottom: var(--space-6);
  font-size: var(--text-xl);
}
.themes {
  display: grid;
  gap: var(--space-4);
}
@media (min-width: 900px) {
  .themes { grid-template-columns: 1fr 1fr; }
}
.themePanel {
  padding: var(--space-5);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-bg);
  color: var(--color-text);
}
.themeLabel {
  margin-bottom: var(--space-4);
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
}
.swatches {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: var(--space-3);
}
.swatch {
  display: grid;
  gap: var(--space-2);
  font-size: var(--text-xs);
}
.chip {
  height: 56px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
}
.token {
  font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
}
.muted {
  color: var(--color-text-muted);
}
.typeRow {
  display: grid;
  gap: var(--space-1);
  padding-block: var(--space-4);
  border-bottom: 1px solid var(--color-border);
}
.scaleRow {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding-block: var(--space-2);
  font-size: var(--text-sm);
}
.scaleRow .token {
  width: 120px;
  flex: none;
}
.bar {
  height: 12px;
  border-radius: 4px;
  background: var(--color-accent);
}
.boxes {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
}
.box {
  display: grid;
  place-items: center;
  width: 140px;
  height: 96px;
  padding: var(--space-2);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  font-size: var(--text-xs);
  text-align: center;
}
.row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-6);
}
.demoCard {
  padding: var(--space-5);
  font-size: var(--text-sm);
}
```

- [ ] **Step 2: 取代 `src/pages/DesignSystemPage/DesignSystemPage.tsx`**

```tsx
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

export function DesignSystemPage() {
  const { lang, t } = useI18n()
  useDocumentMeta({ title: t.ds.title })

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
              <div className={styles.chip} style={{ background: 'var(--tone-bg)', color: 'var(--tone-fg)', display: 'grid', placeItems: 'center' }}>
                Aa
              </div>
              <span className={styles.token}>tone=&quot;{tone}&quot;</span>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="ds-type">
        <h2 id="ds-type" className={styles.sectionTitle}>{t.ds.typography}</h2>
        <p className={cx(styles.token, styles.muted)}>--font-sans: "Poppins", "Noto Sans TC", system-ui, sans-serif</p>
        {TEXT_TOKENS.map((token) => (
          <div key={token} className={styles.typeRow}>
            <span className={cx(styles.token, styles.muted)} style={{ fontSize: 'var(--text-xs)' }}>{token}</span>
            <span style={{ fontSize: `var(${token})`, fontWeight: 'var(--weight-semibold)', lineHeight: 'var(--leading-tight)' }}>{t.ds.sample}</span>
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
          <QuoteCard size="2x1" text={lang === 'zh' ? '好的設計，從**精準定義問題**開始。' : 'Good design starts with **defining the right problem**.'} label={t.quote.label} />
          <StatCard size="1x1" tone="teal" value="92%" label={lang === 'zh' ? '使用滿意度' : 'User satisfaction'} />
          <ContactCard size="1x1" kind="email" href="mailto:hello@example.com" label="Email" />
        </BentoGrid>
        <div style={{ maxWidth: 'var(--prose-max)', marginTop: 'var(--space-8)' }}>
          <Callout title={lang === 'zh' ? '問題陳述' : 'Problem statement'}>
            {lang === 'zh' ? '我們如何讓 ___ 在 ___ 情境下能 ___？' : 'How might we help ___ to ___ when ___?'}
          </Callout>
          <MetricRow items={[{ value: '+32%', label: lang === 'zh' ? '任務完成率' : 'Task success' }, { value: '-45s', label: lang === 'zh' ? '平均完成時間' : 'Avg. time on task' }]} />
          <Figure alt={lang === 'zh' ? '圖片佔位示意' : 'Image placeholder'} caption={lang === 'zh' ? '沒有圖片時會顯示佔位框。' : 'A placeholder appears when no image is set.'} />
        </div>
      </section>
    </div>
  )
}
```

- [ ] **Step 3: 建立 `DESIGN_GUIDELINE.md`**

````markdown
# Design Guideline

這份文件說明作品集網站的設計原則、Design Tokens 的使用規則、元件的使用時機，以及內容撰寫規範。
網站上的活文件在 `/zh/design-system`（頁尾有連結）。

## 1. 設計原則

1. **內容先行**：卡片牆是為了讓人快速掃過作品；案例頁是為了讓人讀懂思考過程。裝飾不能搶走內容。
2. **一致勝於新奇**：顏色、字級、間距只能使用 tokens。需要新數值時，先新增 token，再使用。
3. **每個人都能用**：對比度符合 WCAG AA、可以只用鍵盤操作、尊重「減少動態效果」設定。
4. **容易更新**：新增作品只需要動 `content/`，不需要改程式碼。

## 2. Design Tokens

所有 tokens 定義在 `src/styles/tokens.css`（尺寸、字體、動效）、`src/styles/themes.css`（淺色與深色的顏色）、`src/styles/tones.css`（卡片主題色）。

| 類別 | Tokens | 規則 |
|---|---|---|
| 顏色 | `--color-bg` `--color-surface` `--color-surface-raised` `--color-border` `--color-text` `--color-text-muted` `--color-accent` `--color-highlight` | 元件內禁止寫死色碼（品牌圖示色除外）。次要文字用 `--color-text-muted`，不要用 opacity 調淡。 |
| 卡片主題色 | `data-tone="surface / purple / violet-dark / coral / ink / lavender / teal"` | 在元素上加 `data-tone`，並使用 `var(--tone-bg)` / `var(--tone-fg)`。彩色卡片上的文字必須是 18px 以上或粗體。 |
| 字級 | `--text-xs` 12 / `--text-sm` 14 / `--text-base` 16–17 / `--text-lg` 18–20 / `--text-xl` 24–36 / `--text-display` 36–64 | 一頁只有一個 `--text-display`（頁面標題）。內文一律使用 `--text-base`。 |
| 行高 | `--leading-body-zh` 1.75 / `--leading-body-en` 1.6 / `--leading-tight` 1.2 | 依 `<html lang>` 自動套用，標題用 tight。 |
| 間距 | `--space-1` 4 … `--space-16` 64 | 只使用 4 的倍數。區塊之間 `--space-12`–`--space-16`，元素之間 `--space-2`–`--space-4`。 |
| 圓角 | `--radius-sm` 12 / `--radius-md` 20 / `--radius-card` 28 / `--radius-pill` | 卡片用 card，圖片與小面板用 md，輸入框用 sm，按鈕與膠囊用 pill。 |
| 陰影 | `--shadow-card` / `--shadow-card-hover` | 靜止時用 card，hover 或浮層用 hover。 |
| 動效 | `--duration-fast` 150ms / `--duration-base` 300ms / `--ease-out` | 減少動態效果時會自動歸零，不需要另外處理。 |
| 版面 | `--container-max` 1080 / `--prose-max` 720 / `--gutter` 16–24 / `--grid-gap` 12–20 | 內文最寬 720px，確保閱讀舒適。 |

## 3. 響應式斷點

| 寬度 | 版面 |
|---|---|
| < 640px | Bento 1 欄；案例資訊 2 欄；改版前後上下排列 |
| 640–1023px | Bento 2 欄 |
| ≥ 900px | Header 改為單列（Logo、篩選、設定） |
| ≥ 1024px | Bento 4 欄；案例頁左側顯示目錄 |

## 4. 元件使用時機

| 元件 | 用在 | 不要用在 |
|---|---|---|
| `Button` / `ButtonLink` | 主要動作：送出、下載履歷、聯絡 | 篩選或切換（改用 `Pill`） |
| `Pill` | 篩選、設定切換（搭配 `aria-pressed`） | 主要動作 |
| `Tag` | 年份、領域標籤；不可點擊 | 可點擊的篩選 |
| `Card` | Bento 牆上的所有卡片；有 `href` 時整張可點擊 | 卡片內再放可點擊的連結（會形成巢狀連結） |
| `QuoteCard` | 設計原則；用 `**文字**` 標示強調 | 超過兩行半的長句 |
| `StatCard` | 一個數字加一行說明 | 沒有數字的內容 |
| `Callout` | `insight`：問題陳述、關鍵洞察；`note`：補充 | 一般段落 |
| `MetricRow` | 1–4 個成果數字 | 超過 4 個（請拆開） |
| `Figure` | 案例中的圖片，必須提供 `alt` | 純裝飾圖片 |
| `BeforeAfter` | 改版前後對照 | 兩張無關的圖片 |

## 5. 內容撰寫規範

### 案例結構
TL;DR（由 frontmatter 自動產生）→ 背景 → 問題 → 研究與洞察 → 發想 → 設計與迭代 → 解法 → 成果 → 反思。
- 每個 `##` 會自動成為目錄項目。標題最好本身就是結論，例如「70% 使用者在第二步流失」。
- 段落保持 2–4 句；每張圖都要有一句圖說。
- 清楚區分「我」與「我們」做了什麼。

### 圖片
- 放在案例的 `images/` 資料夾，用相對路徑引用：`<Figure src="images/flow.jpg" alt="…" />`。
- 格式建議 WebP 或 JPG，寬度不超過 1600px，單張 500KB 以內。
- 封面建議 16:9 或 1:1，重要內容放在中央（卡片會裁切）。
- `alt` 描述圖片傳達的資訊，而不是「圖片」兩個字。例如：「使用者旅程圖，顯示付款步驟的痛點」。

### 中英混排
- 中文與英文、數字之間加半形空格：「使用 Figma 設計 3 個版本」。
- 中文內容使用全形標點「，。：」；英文內容使用半形標點。
- 專有名詞保持原文大小寫：NotebookLM、OpenHCI、Figma。
````

- [ ] **Step 4: 建立 `README.md`**

````markdown
# Shawn Chang — Portfolio

Vite + React + TypeScript 作品集網站。設計規範請見 [DESIGN_GUIDELINE.md](DESIGN_GUIDELINE.md)。

## 開發

```bash
npm install
npm run dev        # http://localhost:5173
npm run validate   # 檢查 content/ 的內容是否正確
npm run build      # 驗證內容 → 型別檢查 → 建置到 dist/
```

## 新增一個作品

1. 複製 `content/projects/_template/`，把資料夾改名為英文網址名稱，例如 `content/projects/my-new-project/`。
2. 編輯 `meta.json`：
   - `order`：首頁排序（數字越小越前面）
   - `year`、`tags`
   - `cardSize`：`1x1` / `2x1` / `1x2` / `2x2`
   - `cardTone`：`purple` / `violet-dark` / `coral` / `ink` / `lavender` / `teal` / `surface`
   - `cover` 與 `coverAlt`（選填）：例如 `"cover": "images/cover.jpg"`
   - `protected`：`true` 時需要密碼（密碼設定在 `src/config.ts`）
3. 撰寫 `zh.mdx` 與 `en.mdx`（只寫一種語言也可以，另一種語言會顯示提示）。
4. 圖片放進 `images/`。
5. 執行 `npm run validate` 確認沒有錯誤。首頁卡片、案例頁、「下一個案例」都會自動更新。

## 修改其他內容

| 想改的內容 | 檔案 |
|---|---|
| 自我介紹、設計原則、數字卡、About 頁 | `content/site/zh.json`、`content/site/en.json` |
| Email、LinkedIn、頭貼、履歷 | `content/site/profile.json`（履歷放在 `public/resume/`） |
| 首頁非作品卡片的位置與大小 | `content/site/home.json` |
| 介面文字（按鈕、標籤） | `src/i18n/zh.ts`、`src/i18n/en.ts` |
| 顏色、字級、間距 | `src/styles/tokens.css`、`src/styles/themes.css` |
````

- [ ] **Step 5: 驗證**

Run: `npm run typecheck` → Expected: exit 0。
開啟 `/zh/design-system`：淺色與深色面板並排，兩邊的色票都正確；字級、間距、圓角、陰影、格線示範、按鈕、膠囊、標籤、卡片、Callout、成果數字、圖片佔位框都正常顯示。375px 時沒有水平捲動。

---

### Task 11: 整體 RWD、無障礙與建置檢查

**Files:**
- 依檢查結果修改對應的 `.module.css`（只修問題，不擴大範圍）

- [ ] **Step 1: 完整建置**

Run: `npm run build` → Expected: 依序顯示 `✓ 內容驗證通過（5 個案例）`、typecheck 沒有輸出、Vite 建置成功並輸出 `dist/`。允許出現 Vite 關於 `.mdx` 同時被靜態與動態 import 的提示（frontmatter 需要 eager 載入，屬於預期行為）。

- [ ] **Step 2: 三種寬度逐頁檢查**

用 Playwright 在 375×812、768×1024、1280×800 三種尺寸，依序打開 `/zh`、`/zh?filter=work`、`/zh/work/openhci-2025`、`/zh/about`、`/zh/design-system`、`/en`、`/zh/nope`，每頁都執行：
```js
() => ({ overflow: document.documentElement.scrollWidth > window.innerWidth, h1: document.querySelectorAll('h1').length })
```
Expected: 每頁 `overflow: false`、`h1: 1`。並截圖確認沒有文字被裁切或重疊。深色模式下重複檢查首頁與案例頁。

- [ ] **Step 3: 鍵盤操作檢查**

在 `/zh` 從網址列開始按 Tab：第一個焦點是「跳到主要內容」→ Logo → 四個篩選膠囊 →（桌機）三個設定 → 卡片依序聚焦，每一步焦點框都清楚可見。在作品卡上按 Enter 會進入案例頁。

- [ ] **Step 4: 對比度抽查**

用 `browser_evaluate` 取得以下元素的前景色與背景色，並計算對比度：淺色與深色模式下的 `--color-text-muted` 文字、作品卡資訊列文字（位於漸層遮罩上）、StatCard（teal / lavender）文字。Expected: 一般文字 ≥ 4.5:1，大字（≥ 24px 或 ≥ 18.66px 粗體）≥ 3:1。不符合時調整 `themes.css` / `tokens.css` 的對應 token，並同步更新 DESIGN_GUIDELINE.md。

- [ ] **Step 5: 整理並回報**

刪除開發時產生的暫存截圖。向 Shawn 回報：完成的頁面、需要他提供的素材（對照規格 §12：Email、LinkedIn、5 個案例的內容與圖片、NDA 狀態、設計原則、英文自介確認、各段經歷的時間、Logitech Anywhere 的年份是否為 2026），以及預設密碼 `shawn2026` 與更換方式。
