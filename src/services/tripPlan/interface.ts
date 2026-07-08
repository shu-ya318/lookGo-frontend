import type { PageResponse } from '../common/interface';

// Create Trip Plan

export interface CreateTripPlanRequest {
    name: string;
    fromStationId: number;
    toStationId: number;
    fareType: number; // 1=全票, 4=學生, 5=兒童, 7=愛心
    farePrice: number;
    transferCount: number;
    routingStrategy: number; // 1=最少轉乘次數, 2=最短車程時間
    notes?: string;
}

// TripPlanVO — 旅程規劃顯示物件
export interface TripPlan {
    id: number; // 旅程規劃 id
    name: string; // 旅程名稱
    fromStationId: number; // 起站 id
    fromStationNameZhTw: string; // 起站中文名稱
    toStationId: number; // 訖站 id
    toStationNameZhTw: string; // 訖站中文名稱
    fareType: number; // 票種代碼 (1=全票, 4=學生, 5=兒童, 7=愛心)
    farePrice: number; // 票價
    transferCount: number; // 轉乘次數
    routingStrategy: number; // 路線規劃策略代碼 (1=最少轉乘次數, 2=最短車程時間)
    travelTimeSeconds: number; // 總車程時間（秒，含轉乘時間；依起訖站與路線規劃策略即時計算）
    notes: string | null; // 備註
    createdAt: string; // 建立時間（UTC, ISO 8601）
    updatedAt: string; // 最後更新時間（UTC, ISO 8601）
}

// Get Trip Plan (keyword search)

// GET /get-plan 的請求參數（Query Parameter，非 Request Body）
export interface GetTripPlanParams {
    keyword: string; // 搜尋關鍵字（旅程名稱，模糊比對）
}

// All Trip Plan Name

// 取得當前使用者所有旅程規劃名稱，依建立時間新到舊排序
export type GetAllTripPlanNameResponse = string[];

// All Trip Plan Paginated

export interface GetAllTripPlanPaginatedRequest {
    keyword?: string;
    page?: number;
    size?: number;
}

export type GetAllTripPlanPaginatedResponse = PageResponse<TripPlan>;

// Delete Trip Plan

export interface DeleteTripPlanRequest {
    tripPlanId: number;
}

export interface DeleteTripPlanResponse {
    message: string;
}

// Update Trip Plan Name

export interface UpdateTripPlanNameRequest {
    tripPlanId: number;
    name: string;
}

// Update Trip Plan Info

export interface UpdateTripPlanRequest {
    tripPlanId: number;
    fareType: number;
    farePrice: number;
    transferCount: number;
    routingStrategy: number;
    notes?: string;
}

// Get Excel

export interface GetTripPlanExcelRequest {
    tripPlanId: number;
}
