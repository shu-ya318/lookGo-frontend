import postRequest from '../api';

import type { LoginRequest, SignupRequest, AuthResponse } from './interface';

export const signup = async (request: SignupRequest): Promise<AuthResponse> => {
    return await postRequest<AuthResponse>('/auth/signup', request);
};

export const login = async (request: LoginRequest): Promise<AuthResponse> => {
    return await postRequest<AuthResponse>('/auth/login', request);
};

export const refreshTokens = async (): Promise<AuthResponse> => {
    return await postRequest<AuthResponse>('/auth/refreshTokens');
};

export const logout = async (): Promise<void> => {
    await postRequest('/auth/logout');
};
