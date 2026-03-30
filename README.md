# 霓虹狗 NihonGo

JLPT N5 日文自學網站，繁體中文介面。

純靜態網站，無需安裝任何工具，僅需本機 HTTP server 即可運行。

---

## 功能

### 單字閃卡
- 480 個 N5 單字，分 21 個主題單元
- 日→中 / 中→日 兩種練習模式
- 漢字上標注假名（Ruby）
- 固定順序 / 隨機順序切換
- 不熟的牌自動重新放入牌堆
- TTS 日文發音
- 跨 session 累積學習進度

### 文法閃卡
- 100 個 N5 句型，分 12 個主題單元
- 例句漢字假名標注
- 固定順序 / 隨機順序切換
- TTS 例句發音
- 跨 session 累積學習進度

### JLPT N5 模擬考
- 完整模擬三大節：言語知識（文字・語彙）、言語知識（文法）・読解、聴解
- 全日文題目說明
- 多說話者 TTS 聽解（男聲 / 女聲 / 旁白）
- 作答後立即顯示中文解析
- 結束後顯示總分、各節成績、錯題回顧

---

## 快速開始

```bash
cd src
python3 -m http.server 8080
```

然後開啟 http://localhost:8080

> 必須透過 HTTP server 開啟，直接點開 `.html` 檔案會因 CORS 限制無法載入 JSON 資料。

---

## 技術棧

| 項目 | 說明 |
|------|------|
| Tailwind CSS | 樣式框架（本地化，無需連網） |
| DaisyUI | UI 元件庫（本地化，無需連網） |
| Vanilla JavaScript | 無框架，無編譯步驟 |
| Web Speech API | 日文 TTS 發音 |
| localStorage | 學習進度持久化 |

---

## 目錄結構

```
src/
├── index.html          首頁
├── flashcard.html      單字閃卡
├── grammar.html        文法閃卡
├── quiz.html           模擬考
├── assets/
│   ├── css/main.css
│   ├── js/
│   │   ├── utils.js    共用工具（fetchJSON, shuffle, toRuby）
│   │   ├── tts.js      TTS 發音模組
│   │   ├── flashcard.js
│   │   ├── grammar.js
│   │   └── quiz.js
│   └── vendor/         本地化 CDN 資源
└── data/
    ├── n5-vocab.json   單字資料（480 字）
    ├── n5-grammar.json 文法資料（100 句型）
    └── n5-quiz.json    模擬考題目（59 題）
```

---

## 瀏覽器支援

建議使用 **Google Chrome**，TTS 聽解功能依賴 Google 日本語語音引擎，其他瀏覽器可能發音品質不同。
