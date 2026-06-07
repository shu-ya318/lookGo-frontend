import postRequest from '../api';

import type { GetCurrentUserResponse } from './interface';

export const getCurrentUser = async (): Promise<GetCurrentUserResponse> => {
    return await postRequest<GetCurrentUserResponse>('/user/get-current-user');
};
