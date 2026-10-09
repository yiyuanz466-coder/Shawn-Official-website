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
   - frontmatter 裡的純數字請加引號，例如 `timeline: "2025"`。
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
