# 認證流程重構計畫（Token Refresh）

> 撰寫日期：2026-07-19
> 範圍：`src/services/api.ts`、`src/stores/authStore.ts`、`src/services/stationChat/socket.ts`、`src/pages/auth/*`
> 對應後端：`lookGO-backend`（Spring Boot）

---

## 一、後端實際合約（已查證）

查閱 `lookGO-backend` 後確認以下事實，本計畫的所有決策皆以此為前提。

| 項目 | 實際行為 | 來源 |
| --- | --- | --- |
| Refresh token 傳遞方式 | **HttpOnly Cookie**（名稱 `refreshToken`） | `CookieUtil.java:38` |
| Cookie 屬性 | `httpOnly=true`、`secure=true`、`sameSite=None`、`path=/`、`maxAge=7天` | `CookieUtil.java:38-39` |
| `/auth/refresh-tokens` 讀取來源 | 僅從 Cookie 讀取，**完全不讀 body 或 header** | `AuthController.java:167` |
| Refresh token 輪替 | **有，且為單槽輪替**：每次核發都覆寫 Redis 中該 user 的 JTI | `AuthService.java:240` |
| 舊 refresh token 效力 | **立即失效**（比對 Redis JTI，不符即擲出 `InvalidCredentialsException`） | `AuthService.java:163-167` |
| Access token 有效期 | 15 分鐘 | `application-dev.yaml:21` |
| Refresh token 有效期 | 7 天 | `application-dev.yaml:22` |
| CORS | `allowCredentials(true)`、`allowedOriginPatterns` 由設定注入 | `SecurityConfig.java:102-105` |
| 登入/註冊回應 | body 仍含 `refreshToken`，**同時**也下 Set-Cookie | `AuthController.java:81, 104` |

### 由此得出的兩個關鍵結論

**結論 A：前端把 refresh token 存進 localStorage 是多餘且降低安全性的。**
後端刻意用 `httpOnly` Cookie 保護 refresh token 不被 JS 讀取，但前端在 `LoginPage.tsx:68` / `SignupPage.tsx:103` 又把回應 body 裡的同一個 token 抄進 localStorage，等於親手拆掉後端建立的 XSS 防線。而且這份 localStorage 的副本**從未被任何程式碼讀取使用**（全專案 grep 只有寫入）。

**結論 B：後端的單槽輪替讓「缺併發鎖」從效能問題升級為功能性 bug。**
多支請求同時觸發 refresh 時，後端會連續核發多組 token 並不斷覆寫 Redis JTI，而瀏覽器最終保留的 Cookie 未必是最後一次核發的那組。一旦 Cookie 的 JTI 與 Redis 不符，**使用者下一次刷新必定失敗並被強制登出**。

---

## 二、現況問題清單

依嚴重程度排序。

### P0-1　併發 refresh 導致 token 輪替錯亂

- **位置**：`src/services/api.ts:32-46`
- **現象**：頁面同時發 N 支 API 且 access token 已過期 → N 個請求各自進入 `if (isExpired)` → 打 N 次 `/auth/refresh-tokens`。
- **後果**：後端單槽輪替（`AuthService.java:240`）被覆寫 N 次，Cookie 與 Redis JTI 產生競態不一致，使用者在**下一次**刷新時毫無徵兆地被登出。
- **觸發機率**：高。access token 僅 15 分鐘，使用者稍作停留再操作即可重現。

### P0-2　跨網域部署時 Cookie 不會送出

- **位置**：`src/services/api.ts:13-16`（`axios.create` 未設 `withCredentials`）
- **現象**：開發環境走 Vite proxy（`vite.config.ts:22`）屬同源，Cookie 正常附帶，因此本地測不出問題。
- **後果**：正式環境前後端不同網域時，`/auth/refresh-tokens` 收不到 Cookie → `AuthController.java:167` 取得 `null` → 一律 401 → **refresh 功能在正式環境完全失效**。
- **佐證**：後端已設 `sameSite=None` + `allowCredentials(true)`，明確就是為跨網域情境設計的，前端未配合。

### ✅ P1-1　refresh token 被寫入 localStorage（安全性降級）— 已完成（2026-07-19）

- **位置**：`src/stores/authStore.ts:6,14`、`src/pages/auth/LoginPage.tsx:68`、`src/pages/auth/SignupPage.tsx:103`
- **後果**：抵銷後端 `httpOnly` 的保護，任何 XSS 可一次竊取 7 天效期的長效憑證。且此欄位為死碼，從未被讀取。

### P1-2　沒有 401 反應式重試

- **位置**：`src/services/api.ts:72-77`（401 直接 `clearAuth()` + 導向登入）
- **後果**：以下情境不會嘗試刷新，直接登出使用者：
  - 前後端時鐘誤差（前端判定未過期，後端判定已過期）
  - token 在請求飛行途中過期
  - 後端主動撤銷

### P2-1　`jwtDecode` 未做錯誤處理

- **位置**：`src/services/api.ts:27`
- **後果**：localStorage 內容被竄改成非 JWT 字串時，interceptor 內直接 throw；錯誤型別與 API error 不一致，上層 `enqueueSnackbar(error as string)` 會顯示 `[object Object]`。

### P2-2　無提前刷新緩衝（leeway）

- **位置**：`src/services/api.ts:30`（`expiresAt < currentTime`）
- **後果**：必須「已經過期」才刷新，無法吸收時鐘誤差與網路延遲，放大 P1-2 的發生率。

### P2-3　WebSocket 有第二份重複的 refresh 邏輯

- **位置**：`src/services/stationChat/socket.ts:40-59`
- **後果**：與 `api.ts` 各自為政，兩者之間同樣沒有併發保護；聊天室重連與一般 API 併發時會加劇 P0-1。

### P3-1　persist key 命名誤導（未處理）

- **位置**：`src/stores/authStore.ts:18`（`name: 'accessToken'`）
- **後果**：此 key 實際存的是整個 state 物件，命名易造成誤解。

---

## 三、重構方案

### 設計原則

1. **單一事實來源**：refresh token 完全交由 HttpOnly Cookie 管理，前端不持有、不儲存。
2. **Single-flight**：全域同時只允許一個 refresh 在飛，其餘呼叫端 await 同一個 Promise。
3. **共用抽離**：`api.ts` 與 `socket.ts` 共用同一個 `ensureValidToken()`。
4. **不引入新套件**：以現有 axios + zustand 完成，符合小型專案維運成本。

### 步驟 1：新增 `src/services/tokenManager.ts`

集中處理「取得一個保證有效的 access token」，內含 single-flight 鎖。

```ts
import { jwtDecode } from 'jwt-decode';

import { useAuthStore } from '@/stores/authStore';

import { refreshTokens } from './auth';

/** 提前刷新的緩衝時間，用於吸收時鐘誤差與網路延遲 */
const REFRESH_LEEWAY_MS = 30_000;

/** single-flight 鎖：同時只允許一個 refresh 請求在飛 */
let refreshPromise: Promise<string> | null = null;

const isTokenExpiring = (token: string): boolean => {
  try {
    const { exp } = jwtDecode<{ exp?: number }>(token);
    if (!exp) return true;
    return exp * 1000 < Date.now() + REFRESH_LEEWAY_MS;
  } catch {
    return true; // 無法解析的 token 一律視為需要刷新
  }
};

/** 強制刷新，供 401 重試路徑使用；與一般路徑共用同一把鎖 */
export const forceRefresh = (): Promise<string> => {
  refreshPromise ??= refreshTokens()
    .then((response) => {
      useAuthStore.setState({ accessToken: response.accessToken });
      return response.accessToken;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
};

/**
 * 回傳一個確定有效的 access token；必要時自動刷新。
 * 未登入時回傳 null，刷新失敗時擲出錯誤。
 */
export const ensureValidToken = async (): Promise<string | null> => {
  const { accessToken } = useAuthStore.getState();
  if (!accessToken) return null;
  if (!isTokenExpiring(accessToken)) return accessToken;

  return forceRefresh();
};
```

> 註：`refreshTokens()` 不需傳任何參數，後端只認 Cookie。

### 步驟 2：改寫 `src/services/api.ts`

**2-1　補上 `withCredentials`**（修復 P0-2）

```ts
const service = axios.create({
  baseURL: '/api/v1',
  timeout: 10000,
  withCredentials: true, // 讓跨網域請求附帶 refreshToken Cookie
});
```

**2-2　request interceptor 改用 `ensureValidToken()`**（修復 P0-1、P2-1、P2-2）

```ts
service.interceptors.request.use(
  async (config) => {
    if (config.url?.includes('/auth/refresh-tokens')) {
      return config;
    }

    try {
      const accessToken = await ensureValidToken();
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    } catch (error) {
      useAuthStore.getState().clearAuth();
      window.location.href = '/auth/login';
      return Promise.reject(error);
    }

    return config;
  },
  (error) => Promise.reject(error),
);
```

**2-3　response interceptor 加入 401 單次重試**（修復 P1-2）

在既有 401 分支之前插入重試邏輯，並以 `_retry` 旗標確保只重試一次、避免無限迴圈：

```ts
const originalConfig = error.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined;

if (
  error.response?.status === 401 &&
  originalConfig &&
  !originalConfig._retry &&
  !originalConfig.url?.includes('/auth/')
) {
  originalConfig._retry = true;
  try {
    const accessToken = await forceRefresh();
    originalConfig.headers = {
      ...originalConfig.headers,
      Authorization: `Bearer ${accessToken}`,
    };
    return service.request(originalConfig);
  } catch {
    // 落到下方既有的清除 auth 流程
  }
}
```

> 注意：interceptor 的 error handler 需改為 `async` 才能使用 `await`。
> `/auth/` 路徑需排除，否則登入失敗的 401 會觸發無謂的刷新。

### 步驟 3：`src/services/stationChat/socket.ts` 改用共用邏輯（修復 P2-3）

`beforeConnect` 內 20 行的重複邏輯替換為：

```ts
beforeConnect: async () => {
  try {
    const accessToken = await ensureValidToken();
    client.connectHeaders = accessToken
      ? { Authorization: `Bearer ${accessToken}` }
      : {};
  } catch (error) {
    console.error('[StationChatSocket] Refresh failed', error);
    useAuthStore.getState().clearAuth();
    client.connectHeaders = {};
  }
},
```

### ✅ 步驟 4：`src/stores/authStore.ts` 移除 refreshToken（修復 P1-1）— 已完成（2026-07-19）

`AuthState` 移除 `refreshToken` 欄位，`clearAuth` 同步簡化：

```ts
interface AuthState {
  accessToken: string | null;
  clearAuth: () => void;
}

// refreshToken 由後端以 HttpOnly Cookie 管理，前端不持有也不儲存
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      clearAuth: () => set({ accessToken: null }),
    }),
    {
      name: 'accessToken', // 尚未改名，見下方 P3-1
    },
  ),
);
```

同步清除全部 5 處 `refreshToken` 寫入點（原計畫僅列出 2 處，實作時發現另有 3 處）：

| 檔案 | 變更 |
| --- | --- |
| `src/stores/authStore.ts` | 移除欄位定義與 `clearAuth` 中的重設 |
| `src/pages/auth/LoginPage.tsx` | `setState` 改為只寫 `accessToken` |
| `src/pages/auth/SignupPage.tsx` | 解構與 `setState` 均移除 `refreshToken` |
| `src/services/api.ts` | request interceptor 刷新後只寫 `accessToken` |
| `src/services/stationChat/socket.ts` | `beforeConnect` 刷新後只寫 `accessToken` |

`src/services/auth/interface.ts` 的 `AuthResponse.refreshToken` **保留不動** —— 它描述的是後端實際回應的 body 結構，前端只是不再儲存該值。待後端確認是否停止回傳後再一併調整（見第七節）。

驗證：`npx tsc -b` 通過，全專案已無 `refreshToken` 的儲存或讀取。

> **未處理**：persist key 仍為 `accessToken`（P3-1）。改名為 `lookgo-auth` 會使既有使用者需重新登入一次，故與本次安全性修正脫鉤，留待後續決定。

---

## 四、變更檔案總覽

| 狀態 | 檔案 | 動作 | 對應問題 |
| --- | --- | --- | --- |
| ⬜ | `src/services/tokenManager.ts` | **新增** | P0-1, P2-1, P2-2 |
| ⬜ | `src/services/api.ts` | 修改 `axios.create` + 兩個 interceptor | P0-1, P0-2, P1-2 |
| ⬜ | `src/services/stationChat/socket.ts` | 替換 `beforeConnect` 內部邏輯 | P2-3 |
| ⬜ | `src/stores/authStore.ts` | 改 persist key 為 `lookgo-auth` | P3-1 |
| ✅ | `src/stores/authStore.ts` | 移除 `refreshToken` 欄位 | P1-1 |
| ✅ | `src/pages/auth/LoginPage.tsx` | 移除 `refreshToken` 寫入 | P1-1 |
| ✅ | `src/pages/auth/SignupPage.tsx` | 移除 `refreshToken` 寫入 | P1-1 |
| ✅ | `src/services/api.ts` | interceptor 內移除 `refreshToken` 寫入 | P1-1 |
| ✅ | `src/services/stationChat/socket.ts` | `beforeConnect` 內移除 `refreshToken` 寫入 | P1-1 |
| ⬜ | `src/services/auth/interface.ts` | （選用）`AuthResponse.refreshToken` 標為 optional | P1-1 |

---

## 五、驗證方式

### 測試前提

無法用「刪除 localStorage 的 token」來測試 refresh 流程，原因有二：

1. zustand persist 僅在 App 載入時 rehydrate 一次，DevTools 刪除不影響記憶體中的 state。
2. 即使重整，`accessToken` 為 `null` 會走「不帶 Authorization」的分支，**完全不會進入 refresh 邏輯**，只會得到 401 後被登出。

正確做法是**竄改成一個已過期的 access token**。前端只解碼不驗簽，因此偽造的 JWT 即可觸發判斷。

### 案例 1：基本 refresh 觸發

```js
// DevTools Console，重構前 key 為 'accessToken'，重構後為 'lookgo-auth'
const fake = 'x.' + btoa(JSON.stringify({ exp: Math.floor(Date.now()/1000) - 60 })) + '.x';
const s = JSON.parse(localStorage.getItem('lookgo-auth'));
s.state.accessToken = fake;
localStorage.setItem('lookgo-auth', JSON.stringify(s));
location.reload();
```

**預期**：Network 面板先出現 `/auth/refresh-tokens`（Request Headers 應可見 `Cookie: refreshToken=...`），回應 200 後才送出原本的業務 API，且該 API 帶著新的 Authorization。

### 案例 2：併發鎖（P0-1 迴歸測試）

以案例 1 造好過期 token 後重整，開啟一個會同時發多支 API 的頁面。

**預期**：`/auth/refresh-tokens` 在 Network 中**只出現 1 次**。重構前會出現多次。

### 案例 3：401 反應式重試（P1-2）

將 token 改為 `exp` 尚未過期但簽章無效（把上例的 `- 60` 改成 `+ 600`）。

**預期**：業務 API 回 401 → 自動觸發一次 `/auth/refresh-tokens` → 以新 token 重送該 API 並成功。重構前會直接被登出。

### 案例 4：refresh token 失效的正常登出

DevTools → Application → Cookies 刪除 `refreshToken`，再以案例 1 造過期 access token 並重整。

**預期**：`/auth/refresh-tokens` 回 401 → 清除 auth → 導向 `/auth/login`，且**不出現無限請求迴圈**。

### 案例 5：跨網域驗證（P0-2）

本地 Vite proxy 為同源，測不出此問題。需在部署環境（或設定不同 origin 的 dev server）確認 `/auth/refresh-tokens` 的 Request Headers 確實帶有 Cookie。

---

## 六、建議執行順序

1. ✅ **步驟 4**（移除 refreshToken 儲存）— 已於 2026-07-19 完成，獨立且無相依，優先處理
2. ⬜ **步驟 1 + 2**（`tokenManager.ts` + `api.ts`）— 一次解決兩個 P0，建議下一步
3. ⬜ **步驟 3**（`socket.ts`）— 消除重複邏輯，低風險
4. ⬜ **P3-1 persist key 改名** — 需先確認可接受既有使用者重新登入

---

## 七、後續可討論項目（不在本次範圍）

- **後端**：`AuthVO` 是否應停止在 response body 回傳 `refreshToken`。既然已有 HttpOnly Cookie，body 中的副本只會誘使前端再次落地儲存。此變更需前後端一併調整。
- **access token 不落地**：更嚴謹的做法是 access token 僅存記憶體（不 persist），改以 App 啟動時呼叫一次 refresh 取得。可完全免疫 XSS 竊取長效憑證，代價是每次開頁面多一支請求。以目前專案規模，可列為後續優化。
