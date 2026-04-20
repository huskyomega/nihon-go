# NihonGo 產品需求文件（PRD）

## 目標使用者
準備 JLPT N5 考試的繁體中文使用者

## 功能模組

### 1. 單字學習（vocab-study.html）
- 固定順序逐張瀏覽，僅顯示詳解面（詞性、單字假名標注、讀音、中文意思、發音按鈕）
- 單元篩選列：可按主題單元練習，或選「全部」
- 可拖拉進度條（`<input type="range">`）快速跳至指定卡片
- 上一個 / 下一個導覽按鈕；鍵盤 ← → / j k 切換，p 發音
- 自動記住最後瀏覽的單元與卡片位置，重開頁面自動恢復

### 2. 單字閃卡（flashcard.html）
- 顯示單字（日文 → 中文，或中文 → 日文，可切換模式）
- 每張卡顯示：單字（漢字上標注假名）、讀音、詞性、中文意思
- 發音按鈕（TTS）
- 操作：知道了 ✓ / 不熟 ✗；不熟的牌重新放入牌堆末尾
- 單元篩選列：可按主題單元練習，或選「全部」混合練習
- 順序切換：固定順序（照 JSON id）／隨機順序
- 進度：顯示當前位置（格式：`X / Y`）
- 首頁累積進度：記錄跨 session 已學過的單字數（已學 X / 480 字）
- 方向模式與順序偏好自動存入 localStorage，重開頁面套用
- 自動記住最後瀏覽的單元與卡片位置，重開頁面自動恢復

#### 單字單元（共 21 個）
數字・量詞、代名詞・指示詞、家族、身體部位、職業・人物、場所・建築、
方位・位置、飲食、自然・天氣、交通、衣物・配件、電器・文具、娛樂・興趣、
時間表現、動物・顏色、家具・日用品、學習・工作、形容詞、動詞、
副詞・接続詞、助詞・感動詞

### 3. 文法學習（grammar-study.html）
- 固定順序逐張瀏覽，僅顯示詳解面（句型、意思、說明、例句、例句中文、發音按鈕）
- 多主題卡片（pattern 含 ／）：每個主題各有獨立例句與發音按鈕
- 單元篩選列：可按主題單元練習，或選「全部」
- 可拖拉進度條快速跳至指定卡片
- 上一個 / 下一個導覽按鈕；鍵盤 ← → / j k 切換，p 發第一個例句音
- 自動記住最後瀏覽的單元與卡片位置，重開頁面自動恢復

### 4. 文法閃卡（grammar.html）
- 顯示文法句型（例：〜は〜です）
- 每張卡顯示：句型、說明、例句（例句漢字上標注假名）、中文翻譯
- 多主題卡片：每個主題各有獨立例句與發音按鈕
- 例句可發音（TTS）
- 操作同單字閃卡
- 單元篩選列：可按主題單元練習，或選「全部」混合練習
- 順序切換：固定順序（照 JSON id）／隨機順序；偏好存入 localStorage
- 首頁累積進度：記錄跨 session 已學過的句型數（已學 X / 100 句型）
- 自動記住最後瀏覽的單元與卡片位置，重開頁面自動恢復

#### 文法單元（共 12 個）
基本文型、い形容詞、な形容詞、動詞活用、助詞、て形的用法、
時間・順序、意向・勧誘・願望、疑問・限定、副詞・接続詞、普通體・語氣、比較・能力

### 5. JLPT 模擬考（quiz.html）
- 完整模擬 JLPT N5 三大節：言語知識（文字・語彙）、言語知識（文法）・読解、聴解
- 全日文題目說明（無中文說明）；解析、結果畫面部分使用繁體中文
- 作答後立即顯示對錯與中文解析
- 結束後顯示總分、各節分數、錯題回顧

#### 題型
| 題型 | 說明 |
|------|------|
| kanji_reading | 漢字讀音選擇 |
| kanji_write | 假名對應漢字選擇 |
| vocab_meaning | 單字中文意思選擇 |
| context_vocab | 填入適當單字 |
| sentence_order | 句子排列（★ 標記題） |
| passage_grammar | 短文填入文法 |
| reading | 閱讀測驗 |
| picture_description | 看圖選擇 |
| verbal_expression | 看圖說話（聽解，選項只顯示編號） |
| immediate_response | 即時應答（聽解，選項只顯示編號） |
| task_listening | 課題理解（聽解） |
| understanding_key | 重點理解（聽解） |

#### 聽解 TTS 規格
- 使用 Web Speech API，語言 ja-JP
- 語速 0.9（正常的 90%）
- 多說話者：narrator pitch 1.0、male pitch 0.7、female pitch 1.0
- 各句以 `script_parts` 陣列儲存，每段含 `role` 與 `text`
- Chrome keep-alive 機制（每 10 秒 pause/resume 防止靜音）
- 作答後自動停止 TTS

### 6. 首頁（index.html）
- 五個功能入口卡片，兩欄網格（所有尺寸，含手機）
- 排列：單字學習、單字閃卡 / 文法學習、文法閃卡 / 模擬考（col-span-2，佔整行）
- 標題：「**霓虹狗**學日語」（霓虹狗粗體、學日語細體）
- 所有卡片無 emoji；各卡有專屬背景裝飾 SVG icon（`.card-bg-icon`，透明度 0.05）
- 單字閃卡、文法閃卡：顯示累積學習文字（已學 X / Y 字／句型），不顯示進度條
- 單字學習、文法學習：動態顯示總數（共 X 字／句型），由 fetchJSON 取得
- 模擬考：無進度資訊

## UI 圖示規範

### 圖示檔案（src/assets/icons/）
| 檔案 | 用途 |
|------|------|
| `nihongo_icon_mono.svg` | 首頁 logo（CSS mask，繼承 currentColor）；各頁 favicon |
| `light_mode.svg` | 主題切換按鈕（亮色模式圖示） |
| `dark_mode.svg` | 主題切換按鈕（暗色模式圖示） |
| `vocab-study.svg` | 單字學習卡背景 icon；模擬考文字語彙 section icon |
| `vocab.svg` | 單字閃卡背景 icon |
| `grammar-study.svg` | 文法學習卡背景 icon；模擬考文法・読解 section icon |
| `grammar.svg` | 文法閃卡背景 icon |
| `quiz.svg` | 模擬考卡背景 icon；模擬考開始畫面 icon |
| `finish.svg` | 閃卡完成畫面；模擬考高分結果（≥80%） |
| `happy.svg` | 模擬考中分結果（60–79%） |
| `thumbup.svg` | 模擬考低分結果（<60%） |
| `listening.svg` | 模擬考聴解 section icon |

### CSS Class
| Class | 說明 |
|-------|------|
| `.nihongo-icon` | Logo：`mask-image` 套用 SVG，`background-color: currentColor` |
| `.theme-icon` | 主題切換 SVG；dark mode 套用 `filter: invert(1)` |
| `.card-bg-icon` | 首頁卡片背景裝飾圖示（絕對定位、200px、opacity 0.05、rotate -15deg）；dark mode `filter: invert(1)` |
| `.ui-icon` | 頁面裝飾大圖示（完成畫面、section 切換等）；dark mode `filter: invert(1)` |

### 進度列布局
- **單字閃卡 / 文法閃卡**：進度 label + progress bar 整合至模式切換列右側（`flex-1`），節省垂直空間

## 資料格式

### n5-vocab.json
```json
{
  "id": "v001",
  "word": "山",
  "reading": "やま",
  "romaji": "yama",
  "pos": "名詞",
  "unit": "自然・天氣",
  "meaning": "山、山脈",
  "example": "あの山は高いです。",
  "example_meaning": "那座山很高。"
}
```

### n5-grammar.json
```json
{
  "id": "g001",
  "pattern": "〜は〜です",
  "level": "N5",
  "unit": "基本文型",
  "meaning": "〜是〜（表示說明、判斷）",
  "explanation": "最基本的句型，用於說明主語的性質或狀態。",
  "example": "これは本です。",
  "example_meaning": "這是書。",
  "example_ruby": "<ruby>私<rt>わたし</rt></ruby>は<ruby>学生<rt>がくせい</rt></ruby>です。"
}
```

多主題卡片（pattern 含 ／ 分隔多個獨立詞彙）額外附 `examples` 陣列，每個主題各一筆：
```json
{
  "id": "g077",
  "pattern": "いつも／時々／よく",
  "example": "私はいつも早く起きます。",
  "example_meaning": "我總是早起。",
  "example_ruby": "...",
  "examples": [
    {"label": "いつも", "sentence": "私はいつも早く起きます。", "meaning": "我總是早起。", "ruby": "..."},
    {"label": "時々",  "sentence": "時々友達と映画を見ます。", "meaning": "有時和朋友看電影。", "ruby": "..."},
    {"label": "よく",  "sentence": "よく図書館で勉強します。", "meaning": "常常在圖書館讀書。", "ruby": "..."}
  ]
}
```
`example` / `example_ruby` 保留作第一個主題（向後相容）；顯示時以 `examples` 優先。

### n5-quiz.json
聽解題使用 `script_parts` 陣列：
```json
{
  "id": "l1-1",
  "section": "聴解",
  "problem": 1,
  "type": "task_listening",
  "script_parts": [
    {"role": "narrator", "text": "おとこのひとがはなしています。"},
    {"role": "male",     "text": "あしたはなにかよていがありますか。"},
    {"role": "female",   "text": "ともだちとかいものにいくつもりです。"}
  ],
  "question": "おとこのひとはあしたどこへいきますか。",
  "options": ["びょういん", "かいもの", "がっこう", "うち"],
  "answer": 0,
  "explanation": "說明文字（繁體中文）"
}
```

## 進度儲存
使用 localStorage，key 命名規則：
| Key | 內容 |
|-----|------|
| `nihongo_vocab_progress` | `{ known: seenIds.size, total: 480 }` |
| `nihongo_vocab_seen` | 已學單字 id 陣列（跨 session 累積） |
| `nihongo_vocab_mode` | `'jp'`（日→中）\| `'zh'`（中→日） |
| `nihongo_vocab_order` | `'seq'`（固定）\| `'rnd'`（隨機） |
| `nihongo_vocab_study_state` | `{ unit, cardId }` — 單字學習最後位置 |
| `nihongo_vocab_flashcard_state` | `{ unit, cardId }` — 單字閃卡最後位置 |
| `nihongo_grammar_progress` | `{ known: seenIds.size, total: 100 }` |
| `nihongo_grammar_seen` | 已學句型 id 陣列（跨 session 累積） |
| `nihongo_grammar_order` | `'seq'`（固定）\| `'rnd'`（隨機） |
| `nihongo_grammar_study_state` | `{ unit, cardId }` — 文法學習最後位置 |
| `nihongo_grammar_flashcard_state` | `{ unit, cardId }` — 文法閃卡最後位置 |
| `nihongo_quiz_history` | `{ lastScore: %, lastTotal: N }` |
| `nihongo_theme` | `'cupcake'` \| `'dark'` |

## 假名標注（Ruby）
- 工具函式 `toRuby(word, reading)` 定義於 `utils.js`
- 單字閃卡 / 單字學習：對 `word` 欄位執行，使用 `reading` 欄位（複數讀音取第一個）
- 文法閃卡 / 文法學習：
  - 單例句卡：使用 `example_ruby` 欄位；無此欄位時退回 `example` 純文字
  - 多主題卡（有 `examples` 陣列）：每個 `examples[i].ruby` 個別渲染；無 ruby 時退回 `sentence`
