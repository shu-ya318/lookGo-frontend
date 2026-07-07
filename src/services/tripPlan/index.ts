import postRequest from '../api';

import type {
    CreateTripPlanRequest,
    DeleteTripPlanRequest,
    DeleteTripPlanResponse,
    GetAllTripPlanPaginatedRequest,
    GetAllTripPlanPaginatedResponse,
    GetTripPlanExcelRequest,
    TripPlan,
    UpdateTripPlanNameRequest,
    UpdateTripPlanRequest,
} from './interface';

export const createTripPlan = async (
    request: CreateTripPlanRequest
): Promise<TripPlan> => {
    return await postRequest<TripPlan>('/trip-plan/create-plan', request);
};

export const getAllTripPlanPaginated = async (
    request: GetAllTripPlanPaginatedRequest = {}
): Promise<GetAllTripPlanPaginatedResponse> => {
    return await postRequest<GetAllTripPlanPaginatedResponse>(
        '/trip-plan/get-all-plan-paginated',
        undefined,
        { params: request }
    );
};

export const deleteTripPlan = async (
    request: DeleteTripPlanRequest
): Promise<DeleteTripPlanResponse> => {
    return await postRequest<DeleteTripPlanResponse>(
        '/trip-plan/delete-plan',
        request
    );
};

export const updateTripPlanName = async (
    request: UpdateTripPlanNameRequest
): Promise<TripPlan> => {
    return await postRequest<TripPlan>(
        '/trip-plan/update-plan-name',
        request
    );
};

export const updateTripPlan = async (
    request: UpdateTripPlanRequest
): Promise<TripPlan> => {
    return await postRequest<TripPlan>('/trip-plan/update-plan', request);
};

export const getTripPlanExcel = async (
    request: GetTripPlanExcelRequest
): Promise<Blob> => {
    return await postRequest<Blob>('/trip-plan/get-excel', request, {
        responseType: 'blob',
    });
};
