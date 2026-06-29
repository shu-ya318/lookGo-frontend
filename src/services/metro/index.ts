import postRequest from '../api';

import type {
    GetMetroMapResponse,
    GetAllStationResponse,
    GetAllStationFareResponse,
    GetAllLineResponse,
    GetAllLineTransferResponse,
    GetAllLineStationResponse,
    StationDetails,
    GetOriginDestinationDetailRequest,
    GetOriginDestinationDetailResponse,
} from './interface';

export const getMetroMap = async (): Promise<GetMetroMapResponse> => {
    return await postRequest<GetMetroMapResponse>('/metro/get-metro-map');
};

export const getStationByCode = async (
    stationCode: string
): Promise<StationDetails> => {
    return await postRequest<StationDetails>(
        '/metro/get-station-by-code',
        { stationCode }
    );
};

export const getAllStation = async (): Promise<GetAllStationResponse> => {
    return await postRequest<GetAllStationResponse>('/metro/get-all-station');
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
