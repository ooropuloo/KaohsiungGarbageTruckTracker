
# 高雄市垃圾車即時追蹤系統

一個網頁應用程式，用於即時追蹤高雄市垃圾車的位置。此專案具備即時地圖更新、使用者定位、可自訂警示、持久化的關注清單以及由 Google Gemini AI 提供的分析洞見等功能。

## 主要功能

*   **即時地圖追蹤**：在 Leaflet 地圖上顯示垃圾車的目前位置。
*   **使用者定位**：顯示使用者目前位置及可設定的搜尋半徑。
*   **可自訂設定**：
    *   可調整的資料更新頻率。
    *   可選擇的附近垃圾車搜尋範圍。
    *   可設定的接近警示距離。
*   **持久化關注清單**：
    *   使用者可以將特定車牌號碼加入關注清單。
    *   關注的垃圾車會在列表中被突顯並優先顯示。
    *   即使關注的垃圾車未出現在當前的 API 回應中，仍會顯示在側邊欄（標記為「離線」）。
    *   關注清單儲存在瀏覽器的 `localStorage` 中。
*   **接近警示**：
    *   當垃圾車進入定義的警示距離時，接收彈出式通知。
    *   警示時可選的震動提示。
    *   所有通知的靜音/取消靜音功能。
*   **搜尋與篩選**：
    *   在側邊欄依車牌號碼或地點搜尋垃圾車。
*   **Gemini AI 整合**：
    *   **快速洞見**：根據目前的垃圾車數據，獲取相關資訊或建議。
    *   **基礎搜尋**：詢問與垃圾清運或高雄相關的問題，答案會基於 Gemini 提供的 Google 搜尋結果。
*   **響應式設計**：針對桌面及行動裝置瀏覽進行優化。
*   **互動式使用者介面**：
    *   可收合的側邊欄，用於顯示垃圾車詳情與控制項。
    *   使用者友善的彈出式通知，用於警示與操作回饋。
    *   深色主題，提供舒適的視覺體驗。
*   **狀態指示器**：清晰的視覺提示，顯示 GPS 狀態及 API 連線狀態。

## 技術棧

*   **前端框架**：React 19 (使用 `esm.sh` 進行模組解析)
*   **程式語言**：TypeScript
*   **樣式**：Tailwind CSS (透過 CDN)
*   **地圖**：Leaflet.js
*   **圖示**：Font Awesome
*   **通知**：`react-hot-toast`
*   **人工智慧**：Google Gemini API (`@google/genai` 函式庫)

## 使用的 API

*   **高雄市政府開放資料 API**：用於獲取即時垃圾車數據。
    *   端點：[Kaohsiung City Government API]
*   **Google Gemini API**：用於 AI 驅動的洞見分析與基礎搜尋。
    *   模型：`gemini-2.5-flash-preview-04-17`

## 專案結構

```
.
├── index.html            # 主要 HTML 進入點
├── index.tsx             # 主要 React 應用程式進入點
├── App.tsx               # 核心應用程式邏輯與狀態管理
├── components/           # React UI 組件
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   ├── MapDisplay.tsx
│   ├── TruckItem.tsx
│   ├── GeminiModal.tsx
│   ├── RecenterMapControl.tsx
│   └── icons/index.tsx   # 圖示組件
├── services/             # API 互動與業務邏輯
│   ├── truckService.ts
│   ├── geolocationService.ts
│   └── geminiService.ts
├── hooks/                # 自訂 React 鉤子 (Hooks)
│   └── useLocalStorage.ts
├── types.ts              # TypeScript 型別定義
├── constants.ts          # 應用程式全域常數
├── metadata.json         # 專案元數據 (例如：權限)
├── README.md             # 英文版說明檔案
└── README.zh-TW.md       # 本檔案 (繁體中文說明)
```

## 設定與安裝

此專案設計為可直接在支援 ES 模組和現代 JavaScript 的瀏覽器中執行。目前的設定不需要建置步驟。

### 先決條件

*   現代網頁瀏覽器 (例如：Chrome, Firefox, Edge, Safari)。
*   網路連線。
*   (選用，若使用 `npx serve` 方法) 已安裝 Node.js 和 npm/npx。

### 本地執行

1.  **取得專案檔案**：
    下載或複製專案檔案到您的本機電腦。

2.  **處理 Gemini API 金鑰 (用於 Gemini AI 功能)**：
    `services/geminiService.ts` 中的程式碼使用 `const API_KEY = process.env.API_KEY;` 來取得 Gemini API 金鑰。當直接在瀏覽器中執行靜態檔案時，`process.env.API_KEY` 將會是 `undefined`。
    您有以下兩種選擇：

    *   **選項 A：啟用 Gemini 功能 (僅限本地開發 - 分享時不安全！)**
        若要在本地啟用 Gemini 功能，您需要**暫時修改** `services/geminiService.ts` 檔案：
        1.  開啟 `services/geminiService.ts`。
        2.  找到此行：`const API_KEY = process.env.API_KEY;`
        3.  將其更改為包含您的實際 API 金鑰，如下所示：
            `const API_KEY = "此處填入您的實際GEMINI_API金鑰";`
            (請將 `"此處填入您的實際GEMINI_API金鑰"` 替換成您真實的金鑰)。
        4.  **極重要警告**：
            *   若您使用版本控制 (如 Git)，**請勿提交此修改**。
            *   **請勿在部署應用程式時將您的 API 金鑰像這樣寫死在程式碼中。**
            *   此方法**僅供本地測試使用**。
            *   在分享或提交您的程式碼前，請記得還原此修改 (移除您寫死的金鑰)。

    *   **選項 B：在不使用 Gemini 功能的情況下執行**
        如果您沒有 Gemini API 金鑰或不想修改程式碼，應用程式仍然可以執行。Gemini AI 功能將被停用，您會在瀏覽器控制台中看到警告訊息。應用程式已設計為可在此情況下優雅降級。

3.  **啟動本地伺服器以提供 `index.html` 服務**：
    您需要一個本地 HTTP 伺服器才能正確地提供 `index.html` 及其他資源 (例如 ES 模組的載入)。

    *   **方法一：使用 `npx serve` (推薦，若您已安裝 Node.js)**
        1.  開啟您的終端機或命令提示字元。
        2.  導覽至專案的根目錄 (即 `index.html` 所在的目錄)。
        3.  執行指令：
            ```bash
            npx serve .
            ```
        4.  終端機將會輸出一組本地網址，通常是 `http://localhost:3000` 或 `http://localhost:5000`。

    *   **方法二：使用 VS Code 的 "Live Server" 擴充功能**
        1.  如果您使用 Visual Studio Code，請安裝由 Ritwick Dey 開發的 "Live Server" 擴充功能。
        2.  安裝完成後，在 VS Code 的檔案總管中，對著 `index.html` 檔案按右鍵。
        3.  選擇 "Open with Live Server"。這會自動在您的預設瀏覽器中開啟應用程式。

    *   **方法三：使用 Python 內建的 HTTP 伺服器**
        1. 開啟您的終端機或命令提示字元。
        2. 導覽至專案的根目錄。
        3. 如果您安裝的是 Python 3，請執行： `python -m http.server`
        4. 如果您安裝的是 Python 2，請執行： `python -m SimpleHTTPServer`
        5. 伺服器通常會執行在 `http://localhost:8000`。

4.  **在瀏覽器中開啟**：
    在您的網頁瀏覽器中開啟您的伺服器提供的本地網址 (例如：`http://localhost:3000`)。

## 核心功能解析

### 1. 即時垃圾車追蹤
`MapDisplay` 組件使用 Leaflet.js 渲染互動式地圖。垃圾車資料由 `App.tsx`透過 `truckService.ts` 定期獲取，後者會呼叫高雄市 API。地圖上的垃圾車標記會根據其最新位置更新，並可透過彈出視窗存取詳細資訊。

### 2. 使用者定位
`geolocationService.ts` 使用瀏覽器的 Geolocation API 處理獲取與監看使用者 GPS 位置。此位置會以獨特標記顯示在地圖上，並以圓圈指示目前的搜尋範圍。

### 3. 搜尋與篩選
`Sidebar` 組件提供一個輸入欄位，可依車牌號碼或地點篩選垃圾車列表。此篩選是在客戶端針對目前顯示的垃圾車資料進行。

### 4. 關注清單
使用者可透過 `Sidebar` 或 `TruckItem` 組件將垃圾車加入「關注清單」。此清單使用 `useLocalStorage` 鉤子管理，以跨會話持久保存。關注的垃圾車會被突顯。若關注的垃圾車未出現在最新的 API 獲取結果中，仍會以「離線」狀態顯示在側邊欄。

### 5. 通知
`App.tsx` 處理接近警示。若運作中 (非離線) 垃圾車的計算距離 (透過 `truckService.ts` 中的 `haversineDistance`) 落在使用 者定義的 `alertDistance` 內，則會使用 `react-hot-toast` 觸發彈出式通知。`Header` 中提供靜音選項。

### 6. Gemini AI 整合
可從 `Header` 存取的 `GeminiModal` 組件，允許使用者透過 `geminiService.ts` 與 Gemini API 互動：
*   **快速洞見**：`getSimpleTruckInsights` 會將目前垃圾車數據的摘要傳送給 Gemini，以獲取簡短有用的觀察結果。
*   **基礎搜尋**：`queryGeminiWithGrounding` 允許使用者提出自由形式的問題。查詢會連同啟用的 `googleSearch` 工具一起傳送給 Gemini，回應中包含 AI 的答案及網頁來源。

### 7. 響應式設計
廣泛使用 Tailwind CSS 以確保應用程式能適應不同螢幕尺寸。側邊欄在行動裝置上可收合，在較大螢幕上則變為固定式。

## UI/UX 重點

*   **深色主題**：提供視覺舒適的體驗，尤其在低光源環境下。
*   **互動式地圖**：流暢的平移、縮放以及可點擊的標記與資訊豐富的彈出視窗。
*   **彈出式通知**：用於警示與使用者操作的非侵入式回饋。
*   **清晰的狀態指示器**：標頭中的視覺提示，用於 API 連線與 GPS 狀態。
*   **直觀的控制項**：易於使用的下拉選單進行設定，以及清晰的按鈕進行操作。
