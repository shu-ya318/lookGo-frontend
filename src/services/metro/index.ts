import postRequest from '../api';

import type {
    GetMetroMapResponse,
    GetAllStationResponse,
    GetAllStationOptionResponse,
    GetAllStationFareResponse,
    GetAllLineResponse,
    GetAllLineTransferResponse,
    GetAllLineStationResponse,
    GetStationByCodeRequest,
    StationDetails,
    GetStationByIdRequest,
    Station,
    GetAllStationPaginatedRequest,
    GetAllStationPaginatedResponse,
    GetAllStationIdOptionResponse,
    GetOriginDestinationDetailRequest,
    GetOriginDestinationDetailResponse,
    UpdateStationRequest,
    UpdateStationResponse,
} from './interface';

export const getMetroMap = async (): Promise<GetMetroMapResponse> => {
    return await postRequest<GetMetroMapResponse>('/metro/get-metro-map');
};

export const getStationByCode = async (
    request: GetStationByCodeRequest
): Promise<StationDetails> => {
    return await postRequest<StationDetails>(
        '/metro/get-station-by-code',
        request
    );
};

export const getAllStation = async (): Promise<GetAllStationResponse> => {
    return await postRequest<GetAllStationResponse>('/metro/get-all-station');
};

export const getAllStationOption =
    async (): Promise<GetAllStationOptionResponse> => {
        return await postRequest<GetAllStationOptionResponse>(
            '/metro/get-all-station-option'
        );
    };

export const getAllStationFare =
    async (): Promise<GetAllStationFareResponse> => {
        return await postRequest<GetAllStationFareResponse>(
            '/metro/get-all-station-fare'
        );
    };

export const getAllLine = async (): Promise<GetAllLineResponse> => {
    return await postRequest<GetAllLineResponse>('/metro/get-all-line');
};

export const getAllLineTransfer =
    async (): Promise<GetAllLineTransferResponse> => {
        return await postRequest<GetAllLineTransferResponse>(
            '/metro/get-all-line-transfer'
        );
    };

export const getAllLineStation =
    async (): Promise<GetAllLineStationResponse> => {
        return await postRequest<GetAllLineStationResponse>(
            '/metro/get-all-line-station'
        );
    };

export const getStationById = async (
    request: GetStationByIdRequest
): Promise<Station> => {
    return await postRequest<Station>('/metro/get-station-by-id', request);
};

export const getAllStationPaginated = async (
    request: GetAllStationPaginatedRequest
): Promise<GetAllStationPaginatedResponse> => {
    return await postRequest<GetAllStationPaginatedResponse>(
        '/metro/get-all-station-paginated',
        undefined,
        { params: request }
    );
};

export const getAllStationIdOption =
    async (): Promise<GetAllStationIdOptionResponse> => {
        return await postRequest<GetAllStationIdOptionResponse>(
            '/metro/get-all-station-id-option'
        );
    };

export const getOriginDestinationDetail = async (
    request: GetOriginDestinationDetailRequest
): Promise<GetOriginDestinationDetailResponse> => {
    return await postRequest<GetOriginDestinationDetailResponse>(
        '/metro/get-origin-destination-detail',
        request
    );
};

export const updateStation = async (
    request: UpdateStationRequest
): Promise<UpdateStationResponse> => {
    return await postRequest<UpdateStationResponse>(
        '/metro/update-station',
        request
    );
};
