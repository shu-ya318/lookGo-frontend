# lookGo - Frontend

使用 React 19、TypeScript 與 Zustand 開發的 lookGo 前端應用程式。提供動態路網圖進行臺北捷運資訊查詢，並支援完整的使用者流程：註冊登入、車站聊天室（即時通訊）、收藏車站書籤、客製化規劃旅程、個人資料設定，以及管理後台（使用者權限與車站資料管理）。

## 技術棧

- **框架**：React 19.2（Function Component + Hooks）
- **語言**：TypeScript 6.0
- **建置工具**：Vite 8.0
- **路由**：React Router DOM 7.17（`createBrowserRouter`）
- **狀態管理**：Zustand 5.0
- **UI 元件庫**：Material UI (MUI) 9.0 + Emotion 11（含 MUI X Data Grid、Date Pickers）
- **表單驗證**：React Hook Form 7.75 + Zod 4.4
- **HTTP 客戶端**：Axios 1.16（含 JWT 自動刷新、錯誤攔截）
- **即時通訊**：@stomp/stompjs 7.3（STOMP over WebSocket）
- **資料視覺化**：D3 7.9（動態路網圖）
- **通知**：notistack 3.0
- **工具函式庫**：dayjs、jwt-decode、lodash-es、xlsx（匯出 Excel）
- **程式碼品質**：ESLint 10 + Prettier 3
- **容器化**：Docker + Nginx

## 亮點功能

### 首頁

平台入口頁面，導覽至各項功能。

### 註冊 / 登入頁

- 電子郵件註冊與登入，表單以 React Hook Form + Zod 即時驗證
- 忘記密碼與重設密碼流程
- JWT 驗證，Access Token 過期時自動刷新

### 捷運路網圖頁

- 以 D3 繪製的動態臺北捷運路網圖，支援縮放與平移
- 車站搜尋與進階篩選（如出口、設施條件）
- 點擊車站顯示車站資訊卡，並可查詢起訖站路線結果

### 旅程規劃頁

- 建立、編輯、刪除客製化旅程
- 依起訖站查詢路線並加入旅程
- 旅程可分享至車站聊天室

### 車站書籤頁

- 收藏 / 取消收藏車站
- 以卡片瀏覽已收藏車站的資訊

### 車站聊天室頁

- 以 STOMP over WebSocket 實作的即時聊天室，依車站分房
- 公告列（管理員可新增、編輯、刪除公告）
- 訊息歷史載入更多、分享旅程訊息
- 聊天記錄匯出 Excel

### 使用者設定頁

- 修改使用者名稱、手機、生日與密碼

### 管理後台

- 使用者權限管理
- 車站資料管理與捷運資料同步

---
## 開始使用

### 環境需求

- Node.js `v22`
- npm `^10.0.0`

### 安裝

1. **Clone 專案**

   ```bash
   git clone https://github.com/shu-ya318/lookGo-frontend.git
   cd lookGo-frontend
   ```

2. **安裝相依套件**

   ```bash
   npm install
   ```

3. **設定後端 API 位址**

   本專案不使用 `.env` 檔，開發環境的 API 與 WebSocket 請求透過 Vite dev server proxy 轉發至後端，設定位於 `vite.config.ts`：

   ```ts
   server: {
     proxy: {
       '/api/v1': {
         target: 'http://localhost:8082',
         changeOrigin: true,
       },
       '/ws': {
         target: 'ws://localhost:8082',
         ws: true,
       },
     },
   },
   ```

   > **Note:** 可依後端伺服器實際埠號調整 `target`（例如 `http://localhost:9090`）。

### 開發

啟動開發伺服器：

```bash
npm run dev
```

> **Note:** 應用程式將在 `http://localhost:5173` 提供服務（或依終端機顯示的埠號）。

### 部署

1. **建置正式版本**

   ```bash
   npm run build
   ```

   > **Note:** 建置結果會輸出至 `dist/` 目錄（指令會先執行 `tsc -b` 型別檢查再建置）。

2. **部署靜態檔案**

   `dist/` 目錄可由任何靜態檔案伺服器提供服務：

   - Nginx
   - Apache
   - Caddy
   - CDN / 靜態網站託管服務

   > **Note:** 正式環境需將 `/api/` 與 `/ws` 請求反向代理至後端，可參考專案內的 `nginx.conf`。

3. **容器化（Docker）**

   本專案以多階段建置（Node 建置 + Nginx 服務）打包，Nginx 設定為模板檔，於容器啟動時以環境變數注入後端位址：

   ```bash
   # 建置 Docker 映像檔
   docker build -t lookgo-frontend:latest .

   # 啟動容器
   docker run -d -p 80:80 \
     -e BACKEND_URL=host.docker.internal:8082 \
     -e DNS_RESOLVER=127.0.0.11 \
     --name lookgo-frontend \
     lookgo-frontend:latest
   ```

   應用程式將在 `http://localhost:80/` 提供服務。

   > **Note:**
   >
   > - `BACKEND_URL`：後端服務位址（`host:port`），供 Nginx 將 `/api/` 與 `/ws` 反向代理至後端
   > - `DNS_RESOLVER`：DNS 解析器位址（K8s 環境可指定 kube-dns，讓 proxy_pass 動態解析後端 IP）
   > - 若需使用內部套件庫建置，可加上 `--build-arg NPM_RC_FILE=.npmrc-nexus`
   > - 可調整埠號對應（例如 `-p 3000:80`）將應用程式對外開放於其他埠號

### 程式碼品質

型別檢查（隨建置執行）：

```bash
npm run build
```

程式碼檢查（ESLint + Prettier）：

```bash
npm run lint
```

## 專案結構

```
lookGo-frontend/
├── Dockerfile
├── .dockerignore
├── nginx.conf            # Nginx 設定模板（envsubst 注入 BACKEND_URL、DNS_RESOLVER）
├── public/
├── src/
│   ├── assets/           # 圖片資源（Logo、路網圖等）
│   ├── components/       # 共用 UI 元件
│   │   ├── admin/        # 管理後台元件（捷運同步、車站編輯）
│   │   ├── header/       # Header 與使用者選單
│   │   ├── metroMap/     # 路網圖元件（地圖容器、搜尋列、車站資訊卡等）
│   │   ├── stationBookmark/  # 車站書籤卡片
│   │   ├── stationChat/  # 聊天室元件（公告、訊息、分享旅程 Dialog 等）
│   │   ├── tripPlan/     # 旅程規劃元件與 hooks
│   │   ├── user/         # 使用者設定 Dialog
│   │   └── ...           # Button、Dialog、Sidebar、Footer 等共用元件
│   ├── layouts/          # 頁面佈局（Layout、AuthLayout）
│   ├── pages/            # 頁面元件，依功能分資料夾
│   │   ├── auth/         # 登入、註冊、忘記密碼、重設密碼、403、404
│   │   ├── admin/        # 使用者權限管理、車站管理
│   │   ├── metroMap/     # 捷運路網圖
│   │   ├── stationBookmark/  # 車站書籤
│   │   ├── stationChat/  # 車站聊天室（含 hooks）
│   │   ├── tripPlan/     # 旅程規劃
│   │   ├── user/         # 使用者設定
│   │   └── HomePage.tsx  # 首頁
│   ├── services/         # API 呼叫層
│   │   ├── api.ts        # Axios 實例（含 JWT 自動刷新、錯誤攔截）
│   │   ├── error.ts      # API 錯誤處理工具
│   │   ├── auth/         # 認證 API（index.ts + interface.ts）
│   │   ├── metro/        # 捷運資料 API
│   │   ├── metroSync/    # 捷運資料同步 API
│   │   ├── stationBookmark/  # 車站書籤 API
│   │   ├── stationChat/  # 聊天室 API 與 WebSocket（socket.ts）
│   │   ├── tripPlan/     # 旅程規劃 API
│   │   ├── user/         # 使用者 API
│   │   └── common/       # 共用型別
│   ├── stores/           # Zustand 狀態（auth、user、metroMap、station、stationBookmark）
│   ├── stylesheets/      # MUI 主題設定（theme.ts、mui.d.ts）
│   ├── utils/            # 工具函式（date、route、station、validation）
│   ├── AdminGuard.tsx    # 管理員路由守衛
│   ├── App.tsx
│   ├── main.tsx
│   └── router.tsx        # 路由設定（createBrowserRouter）
├── .gitignore
├── .npmrc-public         # 公開 npm registry 設定
├── .npmrc-nexus          # 內部 Nexus registry 設定
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
├── README.md
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
└── vite.config.ts
```
