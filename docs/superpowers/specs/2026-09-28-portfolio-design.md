# Shawn 作品集網站 — 設計規格

- 日期：2026-09-28
- 狀態：待審閱
- 參考網站：https://mchiu.co.uk/（視覺高度貼近，內容與素材全部替換為 Shawn 自己的）

## 1. 目標與範圍

### 目標
以 React 打造 Shawn（張上元）的個人作品集網站，用於求職（UX / 產品體驗相關職缺）。
同時建立一套可維護的 Design System 與 Design Guideline。

### 成功標準
1. 視覺與互動高度貼近參考網站：Bento 卡片牆、膠囊篩選、深淺色模式、Smooth scroll 開關。
2. 新增或修改作品只需編輯 `content/` 內的檔案，不需要改元件程式碼。
3. 中英雙語切換，所有介面字串與內容皆可分語言維護。
4. RWD：手機（375px）、平板（768px）、桌機（1280px 以上）閱讀舒適，沒有水平捲動。
5. 良好 UX 與無障礙：鍵盤可操作、對比度符合 WCAG AA、尊重「減少動態效果」設定。

### 本版不做
- 自動化測試（Vitest / Playwright 測試套件）與部署：待 Shawn 看過成品、滿意後再另外進行。
- CMS 後台、留言、數據分析、部落格。

## 2. 技術選型

| 項目 | 選擇 |
|---|---|
| 建置 | Vite |
| 框架 | React 18+、TypeScript |
| 路由 | React Router |
| 內容 | MDX（`@mdx-js/rollup`）+ frontmatter（`remark-frontmatter`、`remark-mdx-frontmatter`） |
| 內容驗證 | Zod（建置／載入時驗證 `meta.json` 與 frontmatter） |
| 樣式 | CSS 變數（Design Tokens）+ CSS Modules |
| 平滑捲動 | Lenis（預設關閉，由使用者開啟） |
| 字體 | Poppins（英文，400/500/600）+ Noto Sans TC（中文，400/500），透過 Google Fonts 載入 |

## 3. Design Tokens

所有視覺數值定義在 `src/styles/tokens.css`，深淺主題定義在 `src/styles/themes.css`，以 `[data-theme="dark"]` 切換。
元件只能引用 token，不寫死數值。

### 3.1 色彩

| Token | 淺色 | 深色 | 用途 |
|---|---|---|---|
| `--color-bg` | `#F0EDE8` | `#141316` | 頁面底色 |
| `--color-surface` | `#F9F8F6` | `#1E1D21` | 卡片 |
| `--color-surface-raised` | `#FFFFFF` | `#26252A` | 膠囊選中、浮層 |
| `--color-border` | `rgba(0,0,0,.06)` | `rgba(255,255,255,.08)` | 卡片細框 |
| `--color-text` | `#2C2C2C` | `#EDEBE7` | 主文字 |
| `--color-text-muted` | `#8A8783` | `#9A978F` | 次要文字、標籤 |
| `--color-accent` | `#7C4DFF` | `#A58BFF` | 重點、互動、焦點框 |
| `--color-highlight` | `#2B6CB0` | `#7FB3F0` | 引言卡強調字 |

卡片主題色（作品封面色塊，深淺模式共用，其上文字顏色另外指定）：
`--card-purple #A46CFF`、`--card-violet-dark #2A1640`、`--card-coral #E07A5F`、`--card-ink #1A1A1A`、`--card-lavender #D9D4FF`、`--card-teal #2F8F83`。

### 3.2 字體

- `--font-sans: "Poppins", "Noto Sans TC", system-ui, sans-serif`
- 字級使用 `clamp()` 流體縮放：

| Token | 值（最小 → 最大） |
|---|---|
| `--text-xs` | 12px |
| `--text-sm` | 14px |
| `--text-base` | 16px → 17px |
| `--text-lg` | 18px → 20px |
| `--text-xl` | 24px → 36px |
| `--text-display` | 36px → 64px |

- 行高：`--leading-body-zh: 1.75`、`--leading-body-en: 1.6`、`--leading-tight: 1.2`（依 `html[lang]` 套用內文行高）
- 字重：`--weight-regular 400`、`--weight-medium 500`、`--weight-semibold 600`

### 3.3 間距、圓角、陰影、動效

- 間距（以 4px 為基礎）：`--space-1` 4、`--space-2` 8、`--space-3` 12、`--space-4` 16、`--space-5` 20、`--space-6` 24、`--space-8` 32、`--space-10` 40、`--space-12` 48、`--space-16` 64
- 圓角：`--radius-sm 12px`、`--radius-md 20px`、`--radius-card 28px`、`--radius-pill 999px`
- 陰影：`--shadow-card`（極淡）、`--shadow-card-hover`（微浮起）
- 動效：`--ease-out: cubic-bezier(.2,.8,.2,1)`、`--duration-fast 150ms`、`--duration-base 300ms`；`prefers-reduced-motion: reduce` 時動畫時長歸零

### 3.4 Bento 格線

- 容器最大寬度 `--container-max: 1080px`，左右留白：手機 16px，桌機自動置中。
- 卡片間距 `--grid-gap: 20px`（手機 12px）。
- 欄數：桌機（≥1024px）4 欄、平板（≥640px）2 欄、手機 1 欄。
- 卡片尺寸：`1x1`、`2x1`、`1x2`、`2x2`。欄數不足時自動縮為可用欄數，例如手機上 2x2 會變成 1 欄滿版，並維持合理的長寬比。
- 使用 `grid-auto-flow: dense`，避免格子出現空洞。

## 4. 資訊架構

| 路徑 | 內容 |
|---|---|
| `/` | 依 localStorage → 瀏覽器語言，導向 `/zh` 或 `/en` |
| `/:lang` | 首頁 Bento 牆，含篩選（All / About / Work / Side Quests） |
| `/:lang/work/:slug` | 案例頁（共用模板） |
| `/:lang/about` | 關於我、經歷時間軸、履歷下載 |
| `/:lang/design-system` | Design Guideline 活文件（不放進主導覽，footer 有連結） |
| `*` | 404 |

- 篩選狀態寫在網址 query（`?filter=work`），可以直接分享、上一頁可以還原。
- 篩選時，非該類卡片會淡出並收合，不會重新載入頁面。

## 5. 元件分層

依賴只能由上往下，下層不得引用上層。

```
src/
  styles/        tokens.css, themes.css, global.css, fonts.css
  ui/            Button, Pill, PillGroup, Tag, Icon, Card, Image, VisuallyHidden
  cards/         IntroCard, ContactCard, ProjectCard, QuoteCard, StatCard, PhotoCard
  layout/        SiteHeader, BentoGrid, Footer, ScrollToTop, LanguageSwitch, ThemeToggle, SmoothScrollToggle
  case-study/    CaseHero, CaseToc, ReadingProgress, CaseSection, MetricRow, Figure, BeforeAfter, Callout, NextProject, PasswordGate
  pages/         HomePage, CaseStudyPage, AboutPage, DesignSystemPage, NotFoundPage
  content/       loader.ts（讀取與驗證內容）、schema.ts（Zod）
  i18n/          zh.ts, en.ts, useI18n.ts, LangProvider
  hooks/         useTheme, useSmoothScroll, useReducedMotion, useActiveSection
  app/           App.tsx, routes.tsx
```

每個元件一個資料夾，內含 `Component.tsx` 和 `Component.module.css`。

### 5.1 主要元件職責

- **Card**：props 有 `size`（1x1 / 2x1 / 1x2 / 2x2）、`tone`（surface 或卡片主題色）、`href`（有值時整張卡可點擊，並有 hover 浮起與焦點框）、`category`（用於篩選）。
- **IntroCard**：頭像（圓角裁切）＋ 打招呼文字（取自 `content/site/{lang}.json`）。
- **ContactCard**：單一聯絡方式，例如 Email 或 LinkedIn，大圖示置中。
- **ProjectCard**：封面圖或色塊＋標題；hover 或聚焦時浮出一句話摘要與標籤；受保護的案例顯示鎖頭圖示。
- **QuoteCard**：引言，可用 `**強調**` 語法標示藍色強調字，下方小字「MY DESIGN PRINCIPLE」。
- **StatCard**：大數字＋說明，例如「130+ 參與者」。
- **PhotoCard**：生活感照片卡。
- **SiteHeader**：左側 Logo（SC 字標）、中間篩選膠囊、右側 Smooth scroll、語言、主題切換。手機上篩選膠囊可橫向滑動，右側收成一個設定按鈕，展開後是一個小選單。

### 5.2 案例頁模板

順序：
`CaseHero（TL;DR）→ 背景 → 問題 → 研究與洞察 → 發想 → 設計與迭代 → 解法 → 成果 → 反思 → NextProject`

- **CaseHero**：標題、一句話摘要、角色、時程、團隊、工具、成果亮點（1–3 個數字）、主視覺。
- 章節由 MDX 內的 `##` 標題產生；桌機（≥1024px）左側為跟隨捲動的目錄並標示目前章節，手機為頂部閱讀進度條。
- 內文最大寬度 720px；`Figure` 可設為 `wide`（最寬 1080px）。
- 可在 MDX 中使用的元件：`Figure`、`BeforeAfter`、`MetricRow`、`Callout`。

## 6. 內容模型

```
content/
  site/
    zh.json, en.json          首頁卡片文字、引言、自我介紹、About 頁內容
    home.json                 首頁非作品卡片的排列（類型、尺寸、分類、順序）
  projects/
    _template/                新增案例時複製這個資料夾
    <slug>/
      meta.json
      zh.mdx, en.mdx
      images/
public/
  resume/                     履歷 PDF（中、英）
```

### 6.1 `meta.json`（Zod 驗證）

```json
{
  "order": 1,
  "year": 2025,
  "category": "work",
  "cardSize": "2x2",
  "cardTone": "violet-dark",
  "cover": "images/cover.jpg",
  "coverAlt": { "zh": "...", "en": "..." },
  "tags": ["UX Research", "HCI"],
  "protected": false
}
```

### 6.2 MDX frontmatter（Zod 驗證）

```yaml
title: ...
summary: ...          # 一句話摘要，卡片與 CaseHero 共用
role: ...
timeline: ...
team: ...
tools: [...]
highlights:
  - value: "92%"
    label: "使用滿意度"
```

### 6.3 規則

- 驗證失敗時，開發模式顯示錯誤並指出檔案路徑；建置時直接失敗。
- 缺少某語言的 MDX 時，改用另一語言的內容，並顯示「本頁尚未提供英文版」之類的提示。
- 首頁作品卡片依 `meta.order` 排序，自動插入 Bento 牆；非作品卡片依 `home.json` 排列。
- 案例清單由 `import.meta.glob` 自動收集，新增資料夾即生效。
- `protected: true`：進入案例前需輸入密碼，密碼以 SHA-256 雜湊值存在設定中，通過後在 sessionStorage 記住。**這只能擋住一般瀏覽，不是真正的安全機制；機密內容不應放上網站。**

### 6.4 首批案例

1. 2025 OpenHCI
2. 2026 OpenHCI
3. 2026 Kansei Engineering
4. Logitech Anywhere UI Design
5. 2024 心理健康應用程式使用者測試

內容尚未提供前，先以結構完整的佔位內容（標示為「待補」）建立，方便 Shawn 對照填寫。

## 7. 雙語（i18n）

- 語言放在網址中（`/zh`、`/en`），`<html lang>` 同步設為 `zh-Hant` 或 `en`。
- 介面字串集中在 `src/i18n/zh.ts`、`en.ts`，以 TypeScript 型別確保兩個語言的 key 一致。
- 切換語言時保留目前頁面，例如 `/zh/work/x` 切換後變成 `/en/work/x`。
- 使用者的選擇記在 localStorage。

## 8. UX 與互動

- 主題：預設跟隨系統；手動切換後記在 localStorage；`index.html` 內有一段小腳本，在畫面渲染前套用主題，避免閃爍。
- Smooth scroll：預設關閉，開啟後啟用 Lenis 並記住設定；系統設定減少動態效果時不啟用。
- 卡片進場：進入畫面時淡入並上浮 16px（只觸發一次）；篩選切換 300ms。
- 案例頁：目錄、閱讀進度、回到頂部、下一個案例。
- 每頁設定 `<title>`、meta description；切換路由時捲回頂部，但上一頁要還原捲動位置。

## 9. 無障礙

- 文字對比度 ≥ 4.5:1（大字 ≥ 3:1），深淺模式都要符合。
- 焦點框：`outline: 2px solid var(--color-accent)`，搭配 offset，只在鍵盤操作時顯示（`:focus-visible`）。
- 篩選器使用 `role="tablist"` 或 `aria-pressed`；語言與主題切換按鈕有清楚的標籤。
- 所有內容圖片都要有 alt（由 schema 強制檢查），純裝飾圖片的 alt 設為空字串。
- 語意化標籤：`header`、`nav`、`main`、`article`、`footer`；標題層級不跳級。

## 10. 效能

- 案例頁使用 `React.lazy` 按需載入。
- 圖片懶載入並指定長寬比，避免版面跳動；封面圖建議 WebP，寬度 1600px 以內。
- 字體使用 `display=swap`，只載入需要的字重。

## 11. Design Guideline 交付物

1. `/:lang/design-system` 頁面：色彩（含深淺對照）、字級、間距、圓角、陰影、格線，以及各元件的活範例與 props 說明。
2. `DESIGN_GUIDELINE.md`：設計原則、token 使用規則、元件使用時機（該用與不該用的情況）、內容撰寫規範（案例結構、圖片規格、alt 撰寫、中英混排：中英文之間加半形空格）、新增作品的步驟。

## 12. 需要 Shawn 提供的素材

- [x] 頭貼：`photo/Shawn.jpg`
- [ ] 5 個案例的內容：背景、問題、流程、成果數據、反思（可以先給簡報或 PDF，由我整理）
- [ ] 每個案例的封面圖與過程圖
- [ ] 哪些案例有 NDA
- [ ] Email、LinkedIn 網址
- [ ] 履歷 PDF（中、英）
- [ ] 2–3 句「My Design Principle」
- [ ] 生活感卡片素材（選填，例如興趣照片、數字）
- [ ] 英文版的自我介紹（可以由我根據中文翻譯後給你確認）
