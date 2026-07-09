import type { PageResponse } from '../common/interface';

// Create Trip Plan

export interface CreateTripPlanRequest {
    name: string;
    fromStationId: number;
    toStationId: number;
    fareType: number;
    farePrice: number;
    transferCount: number;
    routingStrategy: number;
    notes?: string;
}

// TripPlan
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
    travelTimeSeconds: number;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
}

// Get Trip Plan 
export interface GetTripPlanParams {
    keyword: string;
}

// All Trip Plan Name
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
