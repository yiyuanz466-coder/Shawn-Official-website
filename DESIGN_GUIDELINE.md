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

## 5. 首頁卡片牆排版

桌機是 4 欄格線。卡片尺寸：`1x1`（1 格）、`2x1`（橫向 2 格）、`1x2`（直向 2 格）、`2x2`（4 格）。
調整 `content/site/home.json` 的 `position` 或作品的 `cardSize` 後，請在桌機寬度檢查一次有沒有空格。
格線會自動把小卡片往前補，但總格數不是 4 的倍數時，最後一列會留空。

## 6. 內容撰寫規範

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
