# NihonGo 設計決策記錄

## 視覺風格
- 主題：日式簡約，帶點活潑感
- DaisyUI theme：使用 `cupcake`（預設），可切換 dark mode
- 主色：紅色系（呼應日本印象）

## 技術決策

### 為何選純靜態？
不需要帳號系統，進度存 localStorage 即可滿足個人學習需求。
未來若需要雲端同步再考慮後端。

### 為何選 Tailwind + DaisyUI CDN？
不想引入 npm 建置流程，保持開發簡單。
DaisyUI 提供現成元件（badge、card、button、progress），不用自己刻 CSS。

### TTS 方案
Web Speech API 免費、無需 API key，日文支援良好（需要 ja-JP voice）。
缺點：各瀏覽器支援程度不同，iOS Safari 需要使用者互動後才能發音。
