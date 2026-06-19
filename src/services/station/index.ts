import postRequest from '../api';

import type { GetStationsRequest, GetStationsResponse } from './interface';

export const getStations = async (
    request: GetStationsRequest
): Promise<GetStationsResponse> => {
    return await postRequest<GetStationsResponse>(
        '/station/get-stations',
        request
    );
};
