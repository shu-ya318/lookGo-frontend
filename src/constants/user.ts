/** 預設頭像圖檔的相對路徑（對應後端 DB 預設值與 public/assets/default-avatar.png） */
export const DEFAULT_AVATAR_URL = '/assets/default-avatar.png';

/** 頭像上傳大小上限（1MB，與後端驗證一致） */
export const MAX_AVATAR_BYTES = 1 * 1024 * 1024;

/** 允許上傳的頭像 MIME 類型（與後端前綴白名單一致） */
export const ALLOWED_AVATAR_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
] as const;
