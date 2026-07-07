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

export interface TripPlan {
    id: number;
    name: string;
    fromStationId: number;
    fromStationNameZhTw: string;
    toStationId: number;
    toStationNameZhTw: string;
    fareType: number;
    farePrice: number;
    transferCount: number;
    routingStrategy: number;
    notes: string;
    createdAt: string;
    updatedAt: string;
}

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
