# NihonGo（霓虹狗）專案說明

## 專案概述
JLPT N5 日文學習網站，繁體中文介面。
純靜態網站，無後端，無需編譯工具。
網站本體在 `src/` 目錄，根目錄是給開發工具用的。

## 技術棧
- Tailwind CSS（CDN，無編譯）
- DaisyUI（CDN，Tailwind 元件庫）
- Vanilla JavaScript（無框架）
- Web Speech API（日文 TTS 發音）

## 目錄結構
src/                 ← 網站根目錄
├── index.html       ← 首頁 / 導覽
├── flashcard.html   ← 單字閃卡
├── grammar.html     ← 文法閃卡
├── quiz.html        ← JLPT 模擬考
├── assets/
│   ├── css/
│   │   └── main.css     ← 含 ruby rt 假名標注樣式
│   └── js/
│       ├── flashcard.js
│       ├── grammar.js
│       ├── quiz.js
│       ├── tts.js       ← 發音模組（Web Speech API）
│       └── utils.js     ← 共用工具：fetchJSON, shuffle, toRuby, saveProgress, loadProgress
└── data/
    ├── n5-vocab.json    ← N5 單字（480 字，含 unit 欄位）
    ├── n5-grammar.json  ← N5 文法（100 句型，含 unit、example_ruby 欄位）
    └── n5-quiz.json     ← 模擬考題目（59 題）

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
- `n5-vocab.json`：每筆含 `unit` 欄位（21 個單元之一）
- `n5-grammar.json`：每筆含 `unit` 欄位（12 個單元之一）及 `example_ruby` 欄位
- `n5-quiz.json`：聽解題用 `script_parts` 陣列取代舊有 `script` 字串
