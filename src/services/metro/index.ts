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
    GetOriginDestinationDetailRequest,
    GetOriginDestinationDetailResponse,
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

export const getOriginDestinationDetail = async (
    request: GetOriginDestinationDetailRequest
): Promise<GetOriginDestinationDetailResponse> => {
    return await postRequest<GetOriginDestinationDetailResponse>(
        '/metro/get-origin-destination-detail',
        request
    );
};
