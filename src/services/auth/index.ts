import postRequest from '../api';

import type { ApiResponse } from '../common/interface';
import type { LoginRequest, SignupRequest, AuthResponse, ForgetPasswordRequest, ResetPasswordRequest } from './interface';

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

export const forgetPassword = async (request: ForgetPasswordRequest): Promise<ApiResponse> => {
    return await postRequest('/auth/forget-password', request);
};

export const resetPassword = async (request: ResetPasswordRequest): Promise<ApiResponse> => {
    return await postRequest<ApiResponse>('/auth/reset-password', request);
};