# NihonGo 產品需求文件（PRD）

## 目標使用者
準備 JLPT N5 考試的繁體中文使用者

## 功能模組

### 1. 單字閃卡（flashcard.html）
- 顯示單字（日文 → 中文，或中文 → 日文，可切換模式）
- 每張卡顯示：單字（漢字上標注假名）、讀音、詞性、中文意思
- 發音按鈕（TTS）
- 操作：知道了 ✓ / 不熟 ✗；不熟的牌重新放入牌堆末尾
- 單元篩選列：可按主題單元練習，或選「全部」混合練習
- 順序切換：固定順序（照 JSON id）／隨機順序
- 進度：顯示當前位置（第 X 張 / 共 Y 張）
- 首頁累積進度：記錄跨 session 已學過的單字數（已學 X / 480 字）

#### 單字單元（共 21 個）
數字・量詞、代名詞・指示詞、家族、身體部位、職業・人物、場所・建築、
方位・位置、飲食、自然・天氣、交通、衣物・配件、電器・文具、娛樂・興趣、
時間表現、動物・顏色、家具・日用品、學習・工作、形容詞、動詞、
副詞・接続詞、助詞・感動詞

### 2. 文法閃卡（grammar.html）
- 顯示文法句型（例：〜は〜です）
- 每張卡顯示：句型、說明、例句（例句漢字上標注假名）、中文翻譯
- 例句可發音（TTS）
- 操作同單字閃卡
- 單元篩選列：可按主題單元練習，或選「全部」混合練習
- 順序切換：固定順序（照 JSON id）／隨機順序
- 首頁累積進度：記錄跨 session 已學過的句型數（已學 X / 100 句型）

#### 文法單元（共 12 個）
基本文型、い形容詞、な形容詞、動詞活用、助詞、て形的用法、
時間・順序、意向・勧誘・願望、疑問・限定、副詞・接続詞、普通體・語氣、比較・能力

### 3. JLPT 模擬考（quiz.html）
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

### 4. 首頁（index.html）
- 三個功能入口卡片
- 顯示各模組累積學習進度（localStorage）

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
| `nihongo_grammar_progress` | `{ known: seenIds.size, total: 100 }` |
| `nihongo_grammar_seen` | 已學句型 id 陣列（跨 session 累積） |
| `nihongo_quiz_history` | `{ lastScore: %, lastTotal: N }` |
| `nihongo_theme` | `'cupcake'` \| `'dark'` |

## 假名標注（Ruby）
- 工具函式 `toRuby(word, reading)` 定義於 `utils.js`
- 單字閃卡：對 `word` 欄位執行，使用 `reading` 欄位（複數讀音取第一個）
- 文法閃卡：使用 JSON 中預先產生的 `example_ruby` 欄位（`innerHTML`）；無此欄位時退回 `example` 純文字
