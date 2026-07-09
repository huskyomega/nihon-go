# NihonGo（霓虹狗）專案說明

## 專案概述
JLPT 日文學習網站，繁體中文介面，目前支援 N5（完整）與 N4（單字、文法已完成，模擬考尚未製作）。
純靜態網站，無後端，無需編譯工具。
網站本體在 `src/` 目錄，根目錄是給開發工具用的。

## 技術棧
- Tailwind CSS（CDN，無編譯）
- DaisyUI（CDN，Tailwind 元件庫）
- Vanilla JavaScript（無框架）
- Web Speech API（日文 TTS 發音）

## 目錄結構
src/                 ← 網站根目錄
├── index.html       ← 首頁 / 導覽（依當前等級動態產生模擬考卡片）
├── flashcard.html    ← 單字閃卡
├── grammar.html      ← 文法閃卡
├── vocab-study.html  ← 單字學習
├── grammar-study.html ← 文法學習
├── quiz.html ~ quiz6.html ← JLPT 模擬考（僅 N5 有內容）
├── assets/
│   ├── css/
│   │   └── main.css     ← 含 ruby rt 假名標注樣式
│   └── js/
│       ├── index.js
│       ├── flashcard.js
│       ├── grammar.js
│       ├── vocab-study.js
│       ├── grammar-study.js
│       ├── quiz.js, quiz2.js ~ quiz6.js
│       ├── tts.js       ← 發音模組（Web Speech API）
│       └── utils.js     ← 共用工具：fetchJSON, shuffle, toRuby, saveProgress, loadProgress,
│                            getCurrentLevel, getLevelDataDir, setupLevelSelect
└── data/
    ├── n5/
    │   ├── vocab.json      ← N5 單字（480 字，含 unit 欄位）
    │   ├── grammar.json    ← N5 文法（100 句型，含 unit、example_ruby 欄位）
    │   ├── quiz1.json ~ quiz6.json ← 模擬考題目
    │   └── manifest.json   ← 該等級可用內容清單（見下方多等級架構）
    └── n4/
        ├── vocab.json      ← N4 單字（559 字，取材自 sigure.tw N4進階單字第01~19課，
        │                      詞條/讀音/中文意思取自來源網站，羅馬拼音、例句由 AI 依日文知識補寫）
        ├── grammar.json    ← N4 文法（57 句型，取材自 sigure.tw N4文法第01~53課，跳過第27課
        │                      純複習內容；接續/說明/例句/example_ruby 由 AI 依日文知識撰寫）
        └── manifest.json   ← quizzes 為空陣列（N4 模擬考尚未製作）

## 多等級（JLPT Level）架構
- 全站以 `localStorage['nihongo_level']`（`N5` / `N4`，預設 `N5`）記錄使用者目前選擇的等級
- 等級切換只在首頁（`index.html`）進行：header navbar-end 有 `<select id="level-select">`，
  切換時透過 `utils.js` 的 `setupLevelSelect()` 記錄新等級並 `location.reload()` 重新載入頁面套用
- 其餘頁面（單字/文法閃卡、學習頁、模擬考）的 header 只用 `<span id="level-badge">` 顯示目前等級，
  不可互動；由 `setupLevelBadge()` 於頁面載入時填入文字，要切換等級須回首頁操作
- 資料路徑一律用 `` `data/${getLevelDataDir()}/xxx.json` `` 組成，不可寫死 `n5-xxx.json`
- 學習進度類 localStorage key（如 `*_progress`、`*_seen`、`*_state`、`*_history`）須加上
  `${getCurrentLevel()}` 後綴，避免不同等級進度互相覆蓋；UI 偏好（主題、排序模式）維持全域共用
- 新增等級（如未來 N3）時：在 `data/` 下新增對應資料夾 + `manifest.json`，並在首頁的 `<select>`
  加入新的 `<option>`
- `data/{level}/manifest.json` 描述該等級目前有哪些模擬考（`quizzes` 陣列，含 `id`/`page`/`title`），
  首頁依此動態產生模擬考卡片；陣列為空時顯示「製作中」佔位卡片

docs/
├── PRD.md           ← 功能規格文件（含資料格式、單元清單、TTS 規格）
└── DESIGN.md        ← 設計決策記錄

.claude/commands/
├── new-feature.md   ← /project:new-feature
└── review.md        ← /project:review

## 開發規範
- 不使用任何需要 npm / node 的工具
- JavaScript 寫在獨立 .js 檔，禁止 inline script
- 新功能開發前，先讀 docs/PRD.md 確認規格
- 資料一律用 JSON 存放在 src/data/
- 每次修改後確認不破壞其他頁面

## 命名慣例
- 檔案名：kebab-case（小寫加連字號）
- JS 函式：camelCase
- CSS class：使用 DaisyUI 元件為主，自訂 class 用 BEM

## TTS 發音規範
- 使用 Web Speech API，語言設定 ja-JP（優先選 Google 日本語 voice）
- 發音按鈕統一用按鈕包三角型圖示 ▶，按鈕尺寸比例 1:1
- 單句發音：呼叫 tts.js 的 `speak(text)` 函式
- 多說話者（聽解用）：呼叫 quiz.js 內的 `speakScript(parts)` 函式
  - `parts` 為 `{role, text}` 陣列，role 可為 narrator / male / female / child
  - pitch：narrator=1.0, male=0.7, female=1.0, child=1.55；rate 固定 0.9
  - 內建 Chrome keep-alive 機制（每 10 秒 pause/resume）

## 假名標注規範
- 工具函式 `toRuby(word, reading)` 定義於 `utils.js`，回傳含 `<ruby>` 標籤的 HTML 字串
- 使用時以 `innerHTML` 渲染，勿用 `textContent`
- 單字閃卡：對 `word` 欄位執行，reading 複數時取第一個（以「・」分隔）
- 文法閃卡例句：使用 JSON 預產生的 `example_ruby` 欄位；無此欄位時退回 `example` 純文字

## 閃卡共用功能規範
單字閃卡與文法閃卡均具備以下功能，新增閃卡類型時應一併實作：
- **單元篩選**：`unit-bar` 橫向捲動列，「全部」+ 各單元按鈕
- **順序切換**：「固定」（照 id 順序）/ 「隨機」（shuffle，預設）
- **累積進度**：`seenIds` Set 持久化至 localStorage（`*_seen` key）；首頁顯示 `已學 X / 總數`

## 資料欄位說明
- `{level}/vocab.json`：每筆含 `unit` 欄位（21 個單元之一）
- `{level}/grammar.json`：每筆含 `unit` 欄位（12 個單元之一）及 `example_ruby` 欄位
- `{level}/quizN.json`：聽解題用 `script_parts` 陣列取代舊有 `script` 字串
- `{level}/manifest.json`：`{ "level": "N5", "quizzes": [{ "id", "page", "title" }, ...] }`
